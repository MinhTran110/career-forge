from typing import Dict, Any, List, Optional
from agent_engine.tools.job_hunter_tool import JobHunterTool
from agent_engine.tools.vector_retriever import VectorRetrieverTool


class MarketHunterAgent:
    """Agent 1: Ingests market jobs, runs semantic matching, and classifies into Safe, Target, Reach tiers."""

    def __init__(self, vector_tool: Optional[VectorRetrieverTool] = None):
        self.hunter_tool = JobHunterTool()
        self.vector_tool = vector_tool or VectorRetrieverTool()

    def evaluate_and_rank_jobs(
        self,
        candidate_id: str,
        candidate_skills: List[str],
        target_roles: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        raw_jobs = self.hunter_tool.fetch_market_jobs(target_roles=target_roles)
        candidate_skills_lower = {s.lower() for s in candidate_skills}

        evaluated_jobs = []
        for job in raw_jobs:
            reqs = job.get("requirements", [])
            matched_skills = []
            missing_skills = []

            for r in reqs:
                if r.lower() in candidate_skills_lower:
                    matched_skills.append(r)
                else:
                    missing_skills.append(r)

            # 1. Skill Match Ratio (70% weight)
            total_reqs = len(reqs) or 1
            skill_ratio = len(matched_skills) / total_reqs

            # 2. Semantic Qdrant Grounding Distance (30% weight)
            try:
                evidences = self.vector_tool.retrieve_evidence(
                    candidate_id=candidate_id,
                    query=job.get("description", ""),
                    limit=1,
                )
                semantic_score = evidences[0]["score"] if evidences else 0.5
            except Exception:
                semantic_score = 0.5

            # Calculate composite match score (0 - 100)
            composite_score = round((skill_ratio * 0.70 + semantic_score * 0.30) * 100, 1)

            # 3. 3-Tier Classification
            if composite_score >= 82.0 and len(missing_skills) <= 1:
                tier = "safe"
            elif composite_score >= 68.0:
                tier = "target"
            else:
                tier = "reach"

            evaluated_job = dict(job)
            evaluated_job.update({
                "match_score": composite_score,
                "tier": tier,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
            })
            evaluated_jobs.append(evaluated_job)

        # Sort descending by match score
        evaluated_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        return evaluated_jobs
