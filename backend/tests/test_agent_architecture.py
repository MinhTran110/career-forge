import pytest
import asyncio
from agent_engine.core.tool_registry import (
    ToolRegistry,
    AgentRole,
    PermissionDeniedError,
    tool_registry,
)
from agent_engine.core.model_gateway import ModelGateway, FallbackHeuristicClient
from agent_engine.core.event_bus import AgentEvent, AgentEventBus
from agent_engine.agents.application_engine import ApplicationEngine


def test_tool_registry_rbac_enforcement():
    """Verifies that strict RBAC permissions prevent privilege escalation across agents."""
    reg = ToolRegistry()

    # 1. Fact Checker (Critic) MUST have READ access to Qdrant evidence
    read_tool = reg.get_tool("vector_query", AgentRole.FACT_CHECKER)
    assert read_tool.name == "vector_query"

    # 2. Fact Checker (Critic) MUST be DENIED write access to prevent evidence forgery
    with pytest.raises(PermissionDeniedError) as exc_info:
        reg.get_tool("vector_index_evidence", AgentRole.FACT_CHECKER)
    assert "Access Denied" in str(exc_info.value)
    assert "fact_checker" in str(exc_info.value)

    # 3. Candidate Profiler MUST have WRITE access to index candidate ground truth
    write_tool = reg.get_tool("vector_index_evidence", AgentRole.CANDIDATE_PROFILER)
    assert write_tool.name == "vector_index_evidence"

    # 4. Resume Strategist (Actor) MUST be DENIED write access to candidate vector lake
    with pytest.raises(PermissionDeniedError) as exc_info2:
        reg.get_tool("vector_index_evidence", AgentRole.RESUME_STRATEGIST)
    assert "Access Denied" in str(exc_info2.value)


@pytest.mark.asyncio
async def test_model_gateway_routing_and_fallback():
    """Verifies that ModelGateway gracefully falls back to heuristic engine in offline/test mode."""
    gateway = ModelGateway()
    assert isinstance(gateway.fallback_client, FallbackHeuristicClient)

    # Test text generation in fallback mode
    res = await gateway.generate_text("Draft Google X-Y-Z bullet for FastAPI and Redis")
    assert "FastAPI" in res or "Architected" in res

    # Test sync wrapper
    res_sync = gateway.generate_text_sync("Generate STAR interview response")
    assert len(res_sync) > 20


@pytest.mark.asyncio
async def test_event_bus_pubsub_lifecycle():
    """Verifies asynchronous event bus publishing, history retention, and stream termination."""
    bus = AgentEventBus()
    wf_id = "wf_test_123"

    event1 = AgentEvent(
        workflow_id=wf_id,
        step="Candidate Profiler",
        agent="profiler",
        agent_name="Candidate Profiler",
        status="info",
        thought="Parsing CV...",
        message="Parsed 8 chunks",
    )
    event2 = AgentEvent(
        workflow_id=wf_id,
        step="Fact Checker",
        agent="critic",
        agent_name="Fact Checker",
        status="approved",
        thought="Verifying claims...",
        message="100% grounded",
    )

    bus.publish(event1)
    bus.publish(event2)

    # History verification
    history = bus.get_history(wf_id)
    assert len(history) == 2
    assert history[0].step == "Candidate Profiler"
    assert history[1].step == "Fact Checker"

    # Replay subscriber test
    received = []
    bus.complete_workflow(wf_id)
    async for ev in bus.subscribe(wf_id):
        received.append(ev)

    assert len(received) == 2
    assert received[0].message == "Parsed 8 chunks"
    assert received[1].status == "approved"


@pytest.mark.asyncio
async def test_application_engine_end_to_end_with_events():
    """Verifies that ApplicationEngine publishes live trace events through the event bus."""
    from agent_engine.tools.vector_retriever import VectorRetrieverTool
    vtool = VectorRetrieverTool(collection_name="test_live_events_coll")
    vtool.index_evidence("cand_test_user", [
        {
            "text": "Engineered high-throughput microservices reducing p99 latency by 35% with Redis and FastAPI.",
            "source": "cv_document",
            "category": "professional_experience",
        }
    ])

    custom_bus = AgentEventBus()
    engine = ApplicationEngine(vector_tool=vtool, event_bus=custom_bus)

    wf_id = "wf_live_test_456"
    candidate_profile = {
        "full_name": "Minh Tran",
        "skills": {"verified": ["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"]},
        "verified_experience": ["Engineered high-throughput microservices reducing p99 latency by 35% with Redis"],
        "metric_highlights": ["35% latency reduction"],
    }
    target_job = {
        "id": "job_scaleai_1",
        "title": "Senior Infrastructure Engineer",
        "company": "ScaleAI",
        "requirements": ["Python", "FastAPI", "Kubernetes", "Redis"],
        "tech_stack": ["Docker", "PostgreSQL"],
    }

    result = engine.process_application(
        candidate_id="cand_test_user",
        candidate_profile=candidate_profile,
        target_job=target_job,
        workflow_id=wf_id,
    )

    assert result["status"] == "tailored"
    assert result["ats_score"] >= 60.0

    # Verify event trace was published into custom_bus
    events = custom_bus.get_history(wf_id)
    assert len(events) >= 4

    agent_names = [e.agent for e in events]
    assert "profiler" in agent_names
    assert "strategist" in agent_names
    assert "writer" in agent_names
    assert "critic" in agent_names
