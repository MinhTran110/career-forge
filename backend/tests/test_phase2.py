import pytest
import io
import uuid
from httpx import AsyncClient, ASGITransport
from pypdf import PdfWriter
from app.main import app
from app.core.database import init_db
from agent_engine.tools.document_parser import DocumentParserTool
from agent_engine.tools.github_graphql import GitHubGraphQLTool
from agent_engine.tools.vector_retriever import VectorRetrieverTool


def create_dummy_resume_pdf() -> bytes:
    """Generates an in-memory test PDF resume with technical claims."""
    writer = PdfWriter()
    writer.add_blank_page(width=595, height=842)
    # Using raw content text stream
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()


@pytest.mark.asyncio
async def test_document_parser_and_metrics():
    parser = DocumentParserTool()
    sample_text = """
    Alex Senior AI Engineer
    Core Technical Skills: Python, FastAPI, React, Docker, Kubernetes, PostgreSQL, Redis.
    Professional Experience:
    - Architected distributed inference backend with FastAPI and Celery handling 12M monthly requests.
    - Optimized memory usage reducing p99 latency by 35% across all microservices.
    - Maintained Redis cache cluster ensuring 99.99% uptime.
    """
    res = parser.extract_structured_profile(sample_text)
    assert "Python" in res["skills"]
    assert "FastAPI" in res["skills"]
    assert "Docker" in res["skills"]
    assert len(res["metric_highlights"]) > 0
    assert len(res["experience_chunks"]) >= 3


@pytest.mark.asyncio
async def test_vector_grounding_and_claim_verification():
    vtool = VectorRetrieverTool(collection_name=f"test_evidence_{uuid.uuid4().hex[:6]}")
    candidate_id = f"cand_{uuid.uuid4().hex[:8]}"

    evidence = [
        {
            "text": "Engineered distributed streaming pipeline with FastAPI and Redis handling 10k RPS.",
            "source": "cv_pdf",
            "category": "experience"
        },
        {
            "text": "Implemented Typst PDF compiler service reducing document export times by 80%.",
            "source": "github_repo",
            "category": "project"
        }
    ]

    indexed = vtool.index_evidence(candidate_id, evidence)
    assert indexed == 2

    # Query matching evidence
    results = vtool.retrieve_evidence(candidate_id, "FastAPI streaming Redis pipeline", limit=2)
    assert len(results) > 0
    assert results[0]["score"] > 0.4
    assert "FastAPI" in results[0]["text"]

    # Verify true claim
    audit = vtool.verify_claim(candidate_id, "FastAPI Redis pipeline for 10k RPS", threshold=0.4)
    assert audit["supported"] is True
    assert audit["confidence_score"] > 0.4


@pytest.mark.asyncio
async def test_full_profile_setup_api():
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register & login
        uid = uuid.uuid4().hex[:8]
        email = f"prof_{uid}@careerforge.dev"
        password = "SecurePassword123!"

        await client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": "Minh Tran"})
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Call /api/v1/profile/setup
        setup_res = await client.post(
            "/api/v1/profile/setup",
            headers=headers,
            data={"github_username": "MinhTran110"},
        )
        assert setup_res.status_code == 200, setup_res.text
        data = setup_res.json()
        assert data["status"] == "success"
        assert "profile" in data
        assert len(data["profile"]["verified_skills"]) > 0
        assert data["indexed_evidence_count"] > 0

        # 3. Query Qdrant evidence lake via API
        ev_res = await client.get(
            "/api/v1/profile/evidence",
            headers=headers,
            params={"query": "FastAPI React backend"},
        )
        assert ev_res.status_code == 200
        ev_data = ev_res.json()
        assert "evidences" in ev_data
        assert len(ev_data["evidences"]) > 0
