import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "CareerForge Gateway"


@pytest.mark.asyncio
async def test_auth_full_lifecycle():
    # Step 0: Ensure tables exist
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        random_id = uuid.uuid4().hex[:8]
        email = f"engineer_{random_id}@careerforge.dev"
        password = "SecurePassword123!"
        full_name = "Alex Senior Engineer"

        # Step 1: Register new user
        reg_payload = {
            "email": email,
            "password": password,
            "full_name": full_name,
        }
        reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201, reg_res.text
        user_data = reg_res.json()
        assert user_data["email"] == email
        assert user_data["full_name"] == full_name
        assert "id" in user_data
        assert user_data["is_active"] is True

        # Step 2: Attempt duplicate registration -> should fail
        dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert dup_res.status_code == 400
        assert "already exists" in dup_res.json()["detail"]

        # Step 3: Login with invalid password -> 401
        bad_login = await client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword"})
        assert bad_login.status_code == 401

        # Step 4: Login with correct password -> returns JWT
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
        token = token_data["access_token"]

        # Step 5: Access protected route /me with JWT
        me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["id"] == user_data["id"]
        assert me_data["email"] == email
        assert me_data["full_name"] == full_name

        # Step 6: Access /me without token -> 401
        unauth_res = await client.get("/api/v1/auth/me")
        assert unauth_res.status_code == 401
