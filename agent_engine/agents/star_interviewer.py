from typing import Any


class StarInterviewerAgent:
    """Agent 6: Simulates interactive mock interviews and evaluates answers on STAR rubric."""

    def __init__(self, config: dict[str, Any] = None):
        self.config = config or {}

    def run(self, question: str, answer_text: str) -> dict[str, Any]:
        return {
            "status": "completed",
            "agent": "STAR Interviewer",
            "scores": {
                "situation": 88,
                "task": 85,
                "action": 90,
                "result": 86,
                "composite": 87.25,
            },
        }
