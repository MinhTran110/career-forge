from typing import Any, Dict, List, Optional
from agent_engine.agents.skill_strategist import SkillStrategistAgent
from agent_engine.agents.resume_strategist import ResumeStrategistAgent
from agent_engine.agents.fact_checker import FactCheckerAgent
from agent_engine.tools.vector_retriever import VectorRetrieverTool


class ApplicationEngine:
    """Orchestrator for Module 3 & 4: Dual-Loop CV Generator & Fact-Checker Critic."""

    def __init__(self, vector_tool: Optional[VectorRetrieverTool] = None):
        self.vector_tool = vector_tool or VectorRetrieverTool()
        self.skill_strategist = SkillStrategistAgent()
        self.resume_strategist = ResumeStrategistAgent()
        self.fact_checker = FactCheckerAgent(vector_tool=self.vector_tool)

    def process_application(
        self,
        candidate_id: str,
        candidate_profile: Dict[str, Any],
        target_job: Dict[str, Any],
        max_iterations: int = 2,
    ) -> Dict[str, Any]:
        """Runs end-to-end dual-loop pipeline:

        1. Skill gap analysis & 48h Sprint Roadmap.
        2. Draft generation with Google X-Y-Z formula.
        3. Critic verification loop against Qdrant evidence lake.
        4. ATS Match Score computation.
        """
        # Step 1: Skill Strategist
        skills = candidate_profile.get("skills", {})
        if isinstance(skills, dict):
            cand_skills = skills.get("verified", ["Python", "FastAPI", "Docker", "PostgreSQL"])
        else:
            cand_skills = skills or ["Python", "FastAPI", "Docker", "PostgreSQL"]

        job_reqs = target_job.get("requirements", [])
        tech_stack = target_job.get("tech_stack", [])
        job_title = target_job.get("title", "Senior Software Engineer")

        skill_plan = self.skill_strategist.run(
            candidate_skills=cand_skills,
            job_requirements=job_reqs,
            job_title=job_title,
            tech_stack=tech_stack,
        )

        # Step 2 & 3: Dual-Loop Resume Generation & Critic Audit
        current_tailored = self.resume_strategist.run(
            candidate_profile=candidate_profile,
            target_job=target_job,
        )

        audit_result = self.fact_checker.run(
            candidate_id=candidate_id,
            bullets=current_tailored["bullets"],
        )

        iteration = 1
        # If critic flagged issues, refine using suggested revisions
        while not audit_result["is_valid"] and iteration < max_iterations:
            refined_bullets = []
            rev_map = {r["original"]: r["suggested_grounded"] for r in audit_result.get("revisions_needed", [])}
            for b in current_tailored["bullets"]:
                refined_bullets.append(rev_map.get(b, b))

            current_tailored["bullets"] = refined_bullets
            # Reconstruct markdown with refined bullets
            exp_section = "\n".join(f"- {b}" for b in refined_bullets)
            parts = current_tailored["markdown"].split("## Professional Experience")
            if len(parts) == 2:
                subparts = parts[1].split("## Key Technical Projects")
                header_exp = subparts[0].split("\n*2022 – Present*")[0] + "\n*2022 – Present*\n"
                new_markdown = parts[0] + "## Professional Experience" + header_exp + exp_section + "\n\n---\n\n## Key Technical Projects" + subparts[1]
                current_tailored["markdown"] = new_markdown

            audit_result = self.fact_checker.run(
                candidate_id=candidate_id,
                bullets=refined_bullets,
            )
            iteration += 1

        # Step 4: Compute ATS Score (0 - 100)
        # Skill coverage: 50%
        cand_skills_lower = {s.lower() for s in cand_skills}
        all_job_skills = list(dict.fromkeys(job_reqs + tech_stack)) or [1]
        matched_count = sum(1 for s in all_job_skills if s.lower() in cand_skills_lower)
        skill_coverage_ratio = matched_count / len(all_job_skills)

        # Grounding confidence: 30%
        grounding_ratio = audit_result["grounding_score"] / 100.0

        # Metric density: 20%
        metric_score = 1.0 if len(candidate_profile.get("metric_highlights", [])) > 0 else 0.75

        ats_score = round(
            (skill_coverage_ratio * 0.50 + grounding_ratio * 0.30 + metric_score * 0.20) * 100,
            1,
        )

        return {
            "status": "tailored",
            "job_id": target_job.get("id"),
            "ats_score": ats_score,
            "tailored_resume_markdown": current_tailored["markdown"],
            "gap_matrix": skill_plan["gap_matrix"],
            "mini_project_roadmap": skill_plan["mini_project_roadmap"],
            "audit_report": audit_result,
            "refinement_iterations": iteration,
        }
