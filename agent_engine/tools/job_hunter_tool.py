from typing import List, Dict, Any


class JobHunterTool:
    """Integrates with remote job boards & search APIs."""

    def search_jobs(self, query: str, location: str = "remote") -> List[Dict[str, Any]]:
        return [
            {
                "id": "ext_job_1",
                "title": "Senior Distributed Systems Engineer",
                "company": "ScaleMesh",
                "location": "Remote",
                "tags": ["FastAPI", "Python", "Redis", "Distributed Systems"],
                "url": "https://example.com/job/scalemesh-1",
            }
        ]
