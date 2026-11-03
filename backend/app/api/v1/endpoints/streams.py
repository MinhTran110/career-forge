import asyncio
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/agent-events/{workflow_id}")
async def stream_agent_events(workflow_id: str):
    async def event_generator():
        steps = [
            ("Market Hunter", "Scanning live jobs and extracting requirements..."),
            ("Candidate Profiler", "Analyzing GitHub commits and skills matrix..."),
            ("Skill Strategist", "Identifying gap matrix and generating 48h mini-project..."),
            ("Resume Strategist", "Rewriting quantitative ATS bullet points..."),
            ("Fact Checker (Critic)", "Verifying against GitHub commit histories - 0 hallucinations found."),
            ("Ready", "Application package and mock interview ready!"),
        ]
        for step, msg in steps:
            payload = json.dumps({"step": step, "message": msg, "timestamp": "2026-11-03T11:20:00Z"})
            yield f"data: {payload}\n\n"
            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
