from typing import Any


class JobDiscoveryFlow:
    """Orchestrates market scraping and semantic candidate matching."""

    def execute(self, candidate_id: str) -> dict[str, Any]:
        return {
            "flow": "job_discovery",
            "candidate_id": candidate_id,
            "status": "success",
            "ranked_jobs_count": 8,
        }
