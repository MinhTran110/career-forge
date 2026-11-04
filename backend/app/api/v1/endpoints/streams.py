import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from agent_engine.core.event_bus import AgentEvent, event_bus

router = APIRouter()


@router.get("/agent-events/{workflow_id}")
async def stream_agent_events(workflow_id: str):
    """Streams live multi-agent communication, debate, Actor-Critic conflict and resolution."""
    async def event_generator():
        # If no events exist yet for this workflow_id, seed initial trace
        history = event_bus.get_history(workflow_id)
        if not history:
            seed_events = [
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Candidate Profiler",
                    agent="profiler",
                    agent_name="Candidate Profiler",
                    status="info",
                    thought="Reading CV PDF text stream and querying GitHub GraphQL API for verified commits...",
                    message="Extracted 12 verified skills from CV & GitHub (420 commits, 12 repos). Stored 8 atomic chunks in Qdrant Vector Lake.",
                ),
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Market Hunter",
                    agent="hunter",
                    agent_name="Market Hunter",
                    status="info",
                    thought="Calculating 70% skill coverage ratio and 30% semantic cosine distance against verified profile...",
                    message="Evaluated market positions: FinFlow Tech classified as SAFE (85% match), CloudMesh classified as REACH (missing Kafka, Triton).",
                ),
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Skill Strategist",
                    agent="strategist",
                    agent_name="Skill Strategist",
                    status="info",
                    thought="Conducting gap analysis between candidate skills and target JD requirements...",
                    message="Identified critical gap in High-Throughput Serving (Triton/vLLM). Formulated 48h Sprint Blueprint: 'vLLM Load Balancer Proxy' across 4 milestones.",
                ),
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Resume Strategist (Actor)",
                    agent="writer",
                    agent_name="Resume Strategist (Actor)",
                    status="draft",
                    thought="Drafting aggressive high-impact bullet using Google X-Y-Z formula to maximize ATS score...",
                    message="Draft Bullet #1: 'Architected distributed Triton CUDA serving cluster handling 100M users with 99.99% uptime.' Transmitting to Fact Checker...",
                ),
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Fact Checker (Critic Auditor)",
                    agent="critic",
                    agent_name="Fact Checker (Critic Auditor)",
                    status="critic_alert",
                    thought="Querying Qdrant Evidence Lake for candidate_id evidence matching 'Triton CUDA 100M users'...",
                    message="⚠️ CRITIC REJECT: Cosine similarity 0.18 < threshold 0.40. Ground-truth check shows NO commits or CV proof for Triton/CUDA. Hallucination flagged!",
                ),
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Resume Strategist (Actor)",
                    agent="writer",
                    agent_name="Resume Strategist (Actor)",
                    status="critic_revision",
                    thought="Accepting critic feedback. Re-grounding statement strictly into verified FastAPI & Redis evidence...",
                    message="Refined Bullet #1: 'Architected asynchronous FastAPI microservices serving 12M monthly queries, reducing p99 latency by 35% with Redis caching.'",
                ),
                AgentEvent(
                    workflow_id=workflow_id,
                    step="Fact Checker (Critic Auditor)",
                    agent="critic",
                    agent_name="Fact Checker (Critic Auditor)",
                    status="approved",
                    thought="Re-auditing refined bullet against Qdrant collection 'candidate_knowledge'...",
                    message="✅ CRITIC APPROVED: Cosine similarity 0.92 matches verified repo 'fastapi-cache'. Zero hallucination. Final ATS Match Score: 89.5%.",
                ),
            ]
            for ev in seed_events:
                event_bus.publish(ev)

        # Stream from event_bus subscription
        async for ev in event_bus.subscribe(workflow_id):
            yield f"data: {ev.model_dump_json()}\n\n"
            await asyncio.sleep(0.8)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

