import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator
from pydantic import BaseModel, Field


class AgentEvent(BaseModel):
    """Structured event emitted during multi-agent orchestration."""
    workflow_id: str = Field(default="global", description="Workflow correlation ID")
    step: str = Field(description="Display step / agent name")
    agent: str = Field(description="Internal agent identifier (e.g. writer, critic)")
    agent_name: str = Field(description="Full human-readable agent name")
    status: str = Field(default="info", description="Status code: info, draft, critic_alert, critic_revision, approved")
    thought: str = Field(default="", description="Internal reasoning and reflection trace")
    message: str = Field(description="User-facing summary message")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentEventBus:
    """Asynchronous in-memory event bus with replay buffer and multi-subscriber support."""

    def __init__(self):
        self._history: dict[str, list[AgentEvent]] = {}
        self._subscribers: dict[str, list[asyncio.Queue[AgentEvent | None]]] = {}
        self._completed: set[str] = set()

    def publish(self, event: AgentEvent) -> None:
        """Publishes an event to all active subscribers and appends to replay history."""
        w_id = event.workflow_id
        if w_id not in self._history:
            self._history[w_id] = []
        self._history[w_id].append(event)

        # Broadcast to active queues
        if w_id in self._subscribers:
            for q in self._subscribers[w_id]:
                try:
                    q.put_nowait(event)
                except Exception:
                    pass

    def complete_workflow(self, workflow_id: str) -> None:
        """Signals end-of-stream to all active subscribers for this workflow."""
        self._completed.add(workflow_id)
        if workflow_id in self._subscribers:
            for q in self._subscribers[workflow_id]:
                try:
                    q.put_nowait(None)
                except Exception:
                    pass

    async def subscribe(self, workflow_id: str) -> AsyncGenerator[AgentEvent, None]:
        """Subscribes to live events for a workflow. Replays history first."""
        q: asyncio.Queue[AgentEvent | None] = asyncio.Queue()

        if workflow_id not in self._subscribers:
            self._subscribers[workflow_id] = []
        self._subscribers[workflow_id].append(q)

        try:
            # 1. Replay historical events
            for ev in self._history.get(workflow_id, []):
                yield ev

            # 2. If workflow was already completed, terminate stream immediately
            if workflow_id in self._completed:
                return

            # 3. Yield live events
            while True:
                ev = await q.get()
                if ev is None:
                    break
                yield ev
        finally:
            if workflow_id in self._subscribers and q in self._subscribers[workflow_id]:
                self._subscribers[workflow_id].remove(q)

    def get_history(self, workflow_id: str) -> list[AgentEvent]:
        return list(self._history.get(workflow_id, []))

    def clear(self, workflow_id: str | None = None) -> None:
        if workflow_id:
            self._history.pop(workflow_id, None)
            self._subscribers.pop(workflow_id, None)
            self._completed.discard(workflow_id)
        else:
            self._history.clear()
            self._subscribers.clear()
            self._completed.clear()


# Global event bus instance
event_bus = AgentEventBus()
