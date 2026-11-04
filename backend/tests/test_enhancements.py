import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db


@pytest.mark.asyncio
async def test_get_my_profile_and_custom_jd_endpoints():
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        uid = uuid.uuid4().hex[:8]
        email = f"lead_{uid}@careerforge.dev"
        password = "SecurePassword123!"
        full_name = "Alex Lead AI Engineer"

        # 1. Register & Login
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password, "full_name": full_name},
        )
        assert reg_res.status_code == 201

        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Test GET /api/v1/profile/me
        me_res = await client.get("/api/v1/profile/me", headers=headers)
        assert me_res.status_code == 200, me_res.text
        profile = me_res.json()
        assert profile["email"] == email
        assert profile["full_name"] == full_name
        assert len(profile["verified_skills"]) > 0
        assert profile["qdrant_indexed"] is True

        # 3. Test POST /api/v1/radar/analyze-custom-jd
        custom_jd_payload = {
            "title": "Principal Distributed Systems Engineer",
            "company": "DeepInfra Global",
            "description": "Looking for deep expertise in Python, FastAPI, Docker, and Redis microservices with high RPS.",
            "salary_range": "$160,000 - $200,000",
            "location": "Remote",
        }
        jd_res = await client.post(
            "/api/v1/radar/analyze-custom-jd",
            headers=headers,
            json=custom_jd_payload,
        )
        assert jd_res.status_code == 200, jd_res.text
        job_data = jd_res.json()
        assert job_data["company"] == "DeepInfra Global"
        assert job_data["tier"] in ["safe", "target", "reach"]
        assert job_data["match_score"] > 50.0
        assert "FastAPI" in job_data["matched_skills"] or "Python" in job_data["matched_skills"]

        # 4. Test physical file upload & storage persistence
        import io
        from pypdf import PdfWriter
        pdf_writer = PdfWriter()
        pdf_writer.add_blank_page(width=595, height=842)
        pdf_stream = io.BytesIO()
        pdf_writer.write(pdf_stream)
        valid_pdf_bytes = pdf_stream.getvalue()

        files = {
            "cv_file": ("candidate_cv.pdf", valid_pdf_bytes, "application/pdf")
        }
        upload_res = await client.post(
            "/api/v1/profile/setup",
            headers=headers,
            data={"github_username": "MinhTran110"},
            files=files,
        )
        assert upload_res.status_code == 200, upload_res.text
        upload_data = upload_res.json()
        assert upload_data["status"] == "success"
        assert upload_data["cv_metadata"]["filename"] == "candidate_cv.pdf"
        assert upload_data["cv_metadata"]["file_size"] > 0
        from pathlib import Path
        saved_path = Path(upload_data["cv_metadata"]["file_path"])
        assert saved_path.exists()
        assert saved_path.read_bytes() == valid_pdf_bytes
