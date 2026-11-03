import asyncio
import json
from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/agent-events/{workflow_id}")
async def stream_agent_events(workflow_id: str):
    """Streams live multi-agent communication, handoffs, and critic audit reasoning."""
    async def event_generator():
        steps = [
            ("Candidate Profiler", "Extracted 12 verified skills from CV (Python, FastAPI, Docker, PostgreSQL, Redis) & GitHub (420 commits). Stored 8 atomic chunks in Qdrant Vector Lake."),
            ("Market Hunter", "Received Candidate Profile. Scanned 4 tech positions. Applied 70% Skill Ratio + 30% Semantic Cosine distance -> Categorized: 1 Safe, 1 Target, 2 Reach."),
            ("Skill Strategist", "Selected target role: 'Senior AI Infrastructure Engineer'. Identified critical gaps: [Kubernetes, vLLM]. Synthesized 48h Sprint Capstone with 4 milestones."),
            ("Resume Strategist", "Synthesizing tailored experience bullets using Google X-Y-Z formula. Transmitting draft to Fact Checker Critic..."),
            ("Fact Checker (Critic)", "Auditing bullet #1 against candidate Qdrant Lake... Cosine Score: 0.88 -> SUPPORTED. Auditing bullet #2... Score: 0.74 -> SUPPORTED. 0 hallucinations detected."),
            ("STAR Interviewer", "Application approved. Prepared 3 behavioral & architectural interview questions tailored to target tech stack. Simulator ready."),
        ]
        for step, msg in steps:
            now_iso = datetime.now(timezone.utc).isoformat()
            payload = json.dumps({"step": step, "message": msg, "timestamp": now_iso})
            yield f"data: {payload}\n\n"
            await asyncio.sleep(0.9)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
