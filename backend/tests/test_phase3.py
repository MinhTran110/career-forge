import uuid

import pytest
from agent_engine.agents.market_hunter import MarketHunterAgent
from agent_engine.tools.job_hunter_tool import JobHunterTool
from agent_engine.tools.vector_retriever import VectorRetrieverTool
from httpx import ASGITransport, AsyncClient

from app.core.database import init_db
from app.main import app


@pytest.mark.asyncio
async def test_job_hunter_url_cleaning_and_fingerprint():
    hunter_tool = JobHunterTool()

    # 1. Test canonical URL cleaning
    dirty_url = "https://careers.example.com/job/senior-ai?utm_source=linkedin&ref=feed&fbclid=xyz123&keep=1"
    clean_url = hunter_tool.clean_canonical_url(dirty_url)
    assert "utm_source" not in clean_url
    assert "ref" not in clean_url
    assert "fbclid" not in clean_url
    assert "keep=1" in clean_url
    assert clean_url.startswith("https://careers.example.com/job/senior-ai")

    # 2. Test deterministic fingerprint computation
    fp1 = hunter_tool.compute_job_fingerprint("DeepScale AI", "Senior AI Infrastructure Engineer", "Remote")
    fp2 = hunter_tool.compute_job_fingerprint("deepscale ai", "Senior AI Infrastructure Engineer ", "remote")
    assert fp1 == fp2, "Fingerprint must be case-insensitive and whitespace-resilient"
    assert len(fp1) == 64, "Fingerprint must be 64-character SHA-256 hex string"


@pytest.mark.asyncio
async def test_market_hunter_tier_classification():
    vtool = VectorRetrieverTool(collection_name=f"test_radar_{uuid.uuid4().hex[:6]}")
    candidate_id = f"cand_{uuid.uuid4().hex[:8]}"

    # Index evidence for candidate
    vtool.index_evidence(candidate_id, [
        {
            "text": "Deep expertise in Python, FastAPI, Docker, and PostgreSQL microservices.",
            "source": "cv_pdf",
            "category": "skills",
        }
    ])

    agent = MarketHunterAgent(vector_tool=vtool)

    # Candidate with full Python/FastAPI/PostgreSQL/Docker/Linux skills
    candidate_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "Linux", "RESTful API", "Redis"]
    ranked_jobs = agent.evaluate_and_rank_jobs(
        candidate_id=candidate_id,
        candidate_skills=candidate_skills,
    )

    assert len(ranked_jobs) > 0
    # The Viettel Solutions role requires ["Python", "FastAPI", "PostgreSQL", "Docker", "Linux", "RESTful API", "Redis"]
    # All skills matched -> safe tier
    viettel_job = next((j for j in ranked_jobs if "Viettel" in j["company"]), None)
    assert viettel_job is not None
    assert viettel_job["tier"] == "safe"
    assert viettel_job["match_score"] >= 74.0
    assert len(viettel_job["missing_skills"]) == 0

    # The FPT Software AI Platform role requires LLM, vLLM, Cloud Architect -> reach tier
    fpt_job = next((j for j in ranked_jobs if "FPT" in j["company"]), None)
    assert fpt_job is not None
    assert fpt_job["tier"] == "reach"
    assert len(fpt_job["missing_skills"]) >= 3


@pytest.mark.asyncio
async def test_radar_api_endpoints():
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register & login candidate
        uid = uuid.uuid4().hex[:8]
        email = f"radar_{uid}@careerforge.dev"
        password = "SecurePassword123!"

        await client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": "Radar Tester"})
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Trigger scan POST /api/v1/radar/scan
        scan_res = await client.post("/api/v1/radar/scan", headers=headers)
        assert scan_res.status_code == 200, scan_res.text
        jobs = scan_res.json()
        assert len(jobs) >= 4
        assert any(j["tier"] in ["safe", "target", "reach"] for j in jobs)
        target_job_id = jobs[0]["id"]

        # 3. Test GET /api/v1/radar/jobs with filtering
        get_all = await client.get("/api/v1/radar/jobs", headers=headers)
        assert get_all.status_code == 200
        assert len(get_all.json()) >= 4

        # Filter by tier=safe
        get_safe = await client.get("/api/v1/radar/jobs?tier=safe", headers=headers)
        assert get_safe.status_code == 200
        for j in get_safe.json():
            assert j["tier"] == "safe"

        # Filter by min_score
        get_high_score = await client.get("/api/v1/radar/jobs?min_score=75.0", headers=headers)
        assert get_high_score.status_code == 200
        for j in get_high_score.json():
            assert j["match_score"] >= 75.0

        # 4. Test GET /api/v1/radar/jobs/{job_id}
        detail_res = await client.get(f"/api/v1/radar/jobs/{target_job_id}", headers=headers)
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == target_job_id

        # 5. Non-existent job returns 404
        not_found_res = await client.get("/api/v1/radar/jobs/non_existent_job_12345", headers=headers)
        assert not_found_res.status_code == 404
