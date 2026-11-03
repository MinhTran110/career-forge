from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.schemas import Token, UserResponse, UserCreate


router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", response_model=UserResponse)
async def register(payload: UserCreate):
    return {
        "id": "usr_sample123",
        "email": payload.email,
        "full_name": payload.full_name or "Engineer",
        "is_active": True,
        "created_at": "2026-11-03T11:00:00Z"
    }


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest):
    return {
        "access_token": "mock-jwt-access-token-careerforge-2026",
        "token_type": "bearer"
    }
