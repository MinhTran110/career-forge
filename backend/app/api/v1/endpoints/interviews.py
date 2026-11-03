from fastapi import APIRouter, File, UploadFile

from app.schemas import InterviewSessionResponse

router = APIRouter()


@router.post("/sessions", response_model=InterviewSessionResponse)
async def create_interview_session():
    return {
        "id": "int_sess_001",
        "user_id": "usr_sample123",
        "job_id": "job_101",
        "title": "Senior AI Infrastructure Mock Interview",
        "overall_score": 86.0,
        "questions": [
            {
                "id": "q1",
                "question": "Describe a time when you diagnosed and resolved a distributed system bottleneck under tight production deadlines.",
                "category": "Behavioral / Problem Solving"
            }
        ],
        "star_feedback": {
            "situation": "Clear context regarding the production outage on holiday traffic.",
            "task": "Well-defined mission to recover 99.9% uptime within 30 minutes.",
            "action": "Analyzed slow query logs, deployed Redis read-replicas, tuned connection pool.",
            "result": "Restored latency to <45ms and prevented $50k revenue loss.",
            "score": 86.0
        },
        "created_at": "2026-11-03T11:15:00Z"
    }


@router.post("/sessions/{session_id}/evaluate-audio")
async def evaluate_audio_answer(session_id: str, audio: UploadFile = File(...)):
    return {
        "session_id": session_id,
        "transcription": "In my previous role, we mitigated a severe Redis memory fragmentation leak by tuning active defragmentation parameters.",
        "star_breakdown": {
            "situation_score": 90,
            "task_score": 85,
            "action_score": 92,
            "result_score": 88
        },
        "recommendations": "Add explicit metrics regarding memory savings in MB/GB."
    }
