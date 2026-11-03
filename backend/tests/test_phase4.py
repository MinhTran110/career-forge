import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from agent_engine.agents.skill_strategist import SkillStrategistAgent
from agent_engine.agents.resume_strategist import ResumeStrategistAgent
from agent_engine.agents.fact_checker import FactCheckerAgent
from agent_engine.agents.application_engine import ApplicationEngine
from agent_engine.tools.vector_retriever import VectorRetrieverTool


@pytest.mark.asyncio
async def test_skill_strategist_gap_and_roadmap():
    agent = SkillStrategistAgent()
    candidate_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]
    job_reqs = ["Python", "FastAPI", "Kubernetes", "Kafka", "Redis"]

    res = agent.run(
        candidate_skills=candidate_skills,
        job_requirements=job_reqs,
        job_title="Senior Infrastructure Engineer",
        tech_stack=["Docker", "Kubernetes"],
    )

    assert res["status"] == "completed"
    assert "Kubernetes" in res["missing_skills"]
    assert "Kafka" in res["missing_skills"]
    assert "Redis" in res["missing_skills"]

    # Check gap matrix
    gap_matrix = res["gap_matrix"]
    assert "Kubernetes" in gap_matrix
    assert gap_matrix["Kubernetes"]["criticality"] == "high"
    assert "project_module" in gap_matrix["Kubernetes"]

    # Check 48h roadmap
    roadmap = res["mini_project_roadmap"]
    assert roadmap["estimated_duration_hours"] == 48
    assert len(roadmap["milestones"]) == 4
    hours = [m["hour_window"] for m in roadmap["milestones"]]
    assert "00h - 12h" in hours[0]
    assert "12h - 24h" in hours[1]
    assert "24h - 36h" in hours[2]
    assert "36h - 48h" in hours[3]


@pytest.mark.asyncio
async def test_resume_strategist_xyz_formula():
    agent = ResumeStrategistAgent()
    raw_exp = "Optimized database query performance reducing p99 latency by 35% with Redis"
    bullet = agent.format_xyz_bullet(raw_exp, target_skills=["Redis", "PostgreSQL"])

    # Google X-Y-Z check: Action + Accomplished [X] + Measured [Y] + Doing [Z]
    assert "achieving" in bullet.lower() or "reducing" in bullet.lower()
    assert "35%" in bullet
    assert "Redis" in bullet or "PostgreSQL" in bullet

    # Full markdown check
    res = agent.generate_tailored_resume(
        candidate_name="Minh Tran",
        candidate_skills=["Python", "FastAPI", "Docker", "PostgreSQL"],
        experience_chunks=[raw_exp],
        metric_highlights=["35% latency reduction"],
        target_job={
            "title": "Senior Backend Engineer",
            "company": "ScaleAI",
            "requirements": ["Python", "FastAPI", "Docker"],
            "tech_stack": ["PostgreSQL"],
        },
        github_username="MinhTran110",
    )

    assert res["status"] == "completed"
    assert "## Professional Experience" in res["markdown"]
    assert "## Key Technical Projects" in res["markdown"]
    assert "ScaleAI" in res["markdown"]
    assert len(res["bullets"]) > 0


@pytest.mark.asyncio
async def test_fact_checker_critic_audit():
    vtool = VectorRetrieverTool(collection_name=f"test_critic_{uuid.uuid4().hex[:6]}")
    cand_id = f"cand_{uuid.uuid4().hex[:8]}"

    # Index actual candidate evidence
    vtool.index_evidence(cand_id, [
        {
            "text": "Engineered distributed streaming pipeline with FastAPI and Redis handling 10k RPS.",
            "source": "cv_pdf",
            "category": "experience",
        }
    ])

    checker = FactCheckerAgent(vector_tool=vtool, threshold=0.35)

    # 1. Grounded bullet (matches evidence)
    grounded_bullet = "Engineered distributed streaming pipeline with FastAPI and Redis handling 10,000 peak requests."
    audit_grounded = checker.audit_bullet_claim(cand_id, grounded_bullet)
    assert audit_grounded["supported"] is True
    assert audit_grounded["confidence_score"] >= 0.35

    # 2. Hallucinated bullet (completely fabricated capability)
    fake_bullet = "Designed satellite rocket guidance propulsion firmware using Assembly on FPGA radiation hardened chips."
    audit_fake = checker.audit_bullet_claim(cand_id, fake_bullet)
    assert audit_fake["supported"] is False


@pytest.mark.asyncio
async def test_application_engine_dual_loop():
    vtool = VectorRetrieverTool(collection_name=f"test_dual_loop_{uuid.uuid4().hex[:6]}")
    cand_id = f"cand_{uuid.uuid4().hex[:8]}"

    vtool.index_evidence(cand_id, [
        {
            "text": "Architected FastAPI backend with PostgreSQL and Redis connection pooling.",
            "source": "cv_pdf",
            "category": "experience",
        }
    ])

    engine = ApplicationEngine(vector_tool=vtool)
    profile = {
        "full_name": "Minh Tran",
        "email": "minh@careerforge.dev",
        "skills": {"verified": ["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"]},
        "verified_experience": ["Architected FastAPI backend with PostgreSQL and Redis connection pooling."],
        "metric_highlights": ["35% latency reduction"],
    }
    job = {
        "id": "job_scale_101",
        "title": "Senior AI Infrastructure Engineer",
        "company": "DeepScale AI",
        "requirements": ["Python", "FastAPI", "Docker", "Kubernetes", "Redis"],
        "tech_stack": ["PostgreSQL", "Redis"],
        "description": "Architect high-throughput LLM serving platforms with FastAPI, Docker, and Redis.",
    }

    result = engine.process_application(
        candidate_id=cand_id,
        candidate_profile=profile,
        target_job=job,
    )

    assert result["status"] == "tailored"
    assert result["ats_score"] > 60.0
    assert len(result["mini_project_roadmap"]["milestones"]) == 4
    assert "Kubernetes" in result["gap_matrix"]
    assert "tailored_resume_markdown" in result


@pytest.mark.asyncio
async def test_applications_api_lifecycle():
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register & login
        uid = uuid.uuid4().hex[:8]
        email = f"app_user_{uid}@careerforge.dev"
        password = "SecurePassword123!"

        await client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": "Minh Tran"})
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Trigger radar scan to ensure a Job is present
        scan_res = await client.post("/api/v1/radar/scan", headers=headers)
        assert scan_res.status_code == 200
        jobs = scan_res.json()
        assert len(jobs) > 0
        target_job_id = jobs[0]["id"]

        # 3. Call POST /api/v1/applications/tailor
        tailor_res = await client.post(
            "/api/v1/applications/tailor",
            headers=headers,
            json={"job_id": target_job_id},
        )
        assert tailor_res.status_code == 200, tailor_res.text
        app_data = tailor_res.json()
        assert app_data["status"] == "tailored"
        assert app_data["ats_score"] > 50.0
        assert "mini_project_roadmap" in app_data
        assert len(app_data["mini_project_roadmap"]["milestones"]) == 4
        app_id = app_data["id"]

        # 4. Call GET /api/v1/applications
        list_res = await client.get("/api/v1/applications", headers=headers)
        assert list_res.status_code == 200
        apps = list_res.json()
        assert len(apps) >= 1
        assert any(a["id"] == app_id for a in apps)

        # 5. Call GET /api/v1/applications/{app_id}
        detail_res = await client.get(f"/api/v1/applications/{app_id}", headers=headers)
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == app_id
        assert detail_res.json()["job_id"] == target_job_id
