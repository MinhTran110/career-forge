from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    radar,
    applications,
    interviews,
    streams,
    documents,
)


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(radar.router, prefix="/radar", tags=["Job Radar"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["Mock Interview"])
api_router.include_router(streams.router, prefix="/streams", tags=["Real-time Streams"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Compilation"])
