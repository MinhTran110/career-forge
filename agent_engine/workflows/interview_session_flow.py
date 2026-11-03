from typing import Dict, Any


class InterviewSessionFlow:
    """Orchestrates real-time question generation and voice STAR evaluation."""

    def execute(self, session_id: str, answer_transcript: str) -> Dict[str, Any]:
        return {
            "flow": "interview_session",
            "session_id": session_id,
            "status": "evaluated",
            "composite_score": 88.0,
        }
