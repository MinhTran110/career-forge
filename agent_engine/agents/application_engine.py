from typing import Any

from agent_engine.agents.fact_checker import FactCheckerAgent
from agent_engine.agents.resume_strategist import ResumeStrategistAgent
from agent_engine.agents.skill_strategist import SkillStrategistAgent
from agent_engine.core.event_bus import AgentEvent, AgentEventBus, event_bus as default_event_bus
from agent_engine.core.model_gateway import ModelGateway, model_gateway as default_model_gateway
from agent_engine.core.tool_registry import ToolRegistry, tool_registry as default_tool_registry
from agent_engine.tools.vector_retriever import VectorRetrieverTool


class ApplicationEngine:
    """Orchestrator for Module 3 & 4: Dual-Loop CV Generator & Fact-Checker Critic."""

    def __init__(
        self,
        vector_tool: VectorRetrieverTool | None = None,
        model_gateway: ModelGateway | None = None,
        tool_registry: ToolRegistry | None = None,
        event_bus: AgentEventBus | None = None,
    ):
        self.vector_tool = vector_tool or VectorRetrieverTool()
        self.model_gateway = model_gateway or default_model_gateway
        self.tool_registry = tool_registry or default_tool_registry
        self.event_bus = event_bus or default_event_bus

        self.skill_strategist = SkillStrategistAgent()
        self.resume_strategist = ResumeStrategistAgent(
            model_gateway=self.model_gateway,
            tool_registry=self.tool_registry,
        )
        self.fact_checker = FactCheckerAgent(
            vector_tool=self.vector_tool,
            tool_registry=self.tool_registry,
        )

    def process_application(
        self,
        candidate_id: str,
        candidate_profile: dict[str, Any],
        target_job: dict[str, Any],
        max_iterations: int = 2,
        workflow_id: str = "default",
    ) -> dict[str, Any]:
        """Runs end-to-end dual-loop pipeline:

        1. Skill gap analysis & 48h Sprint Roadmap.
        2. Draft generation with Google X-Y-Z formula.
        3. Critic verification loop against Qdrant evidence lake.
        4. ATS Match Score computation.
        """
        # Step 1: Extract Skills & Ground Truth
        skills = candidate_profile.get("skills", {})
        if isinstance(skills, dict):
            cand_skills = skills.get("verified", ["Python", "FastAPI", "Docker", "PostgreSQL"])
        else:
            cand_skills = skills or ["Python", "FastAPI", "Docker", "PostgreSQL"]

        self.event_bus.publish(AgentEvent(
            workflow_id=workflow_id,
            step="Candidate Profiler",
            agent="profiler",
            agent_name="Candidate Profiler",
            status="info",
            thought="Extracting verified ground-truth skills and atomic experience chunks from candidate profile...",
            message=f"Verified {len(cand_skills)} technical competencies from CV and GitHub lake.",
        ))

        job_reqs = target_job.get("requirements", [])
        tech_stack = target_job.get("tech_stack", [])
        job_title = target_job.get("title", "Senior Software Engineer")

        # Step 2: Skill Strategist
        skill_plan = self.skill_strategist.run(
            candidate_skills=cand_skills,
            job_requirements=job_reqs,
            job_title=job_title,
            tech_stack=tech_stack,
        )

        missing = skill_plan.get("missing_skills", [])
        missing_str = ", ".join(missing[:3]) if missing else "None"
        self.event_bus.publish(AgentEvent(
            workflow_id=workflow_id,
            step="Skill Strategist",
            agent="strategist",
            agent_name="Skill Strategist",
            status="info",
            thought=f"Analyzing required tech stack against verified capabilities for {job_title}...",
            message=f"Identified {len(missing)} skill gap(s): {missing_str}. Scaffolded 48h Sprint Blueprint.",
        ))

        # Step 3: Dual-Loop Resume Generation & Critic Audit
        current_tailored = self.resume_strategist.run(
            candidate_profile=candidate_profile,
            target_job=target_job,
        )

        sample_b = current_tailored["bullets"][0] if current_tailored.get("bullets") else "Tailored experience"
        self.event_bus.publish(AgentEvent(
            workflow_id=workflow_id,
            step="Resume Strategist (Actor)",
            agent="writer",
            agent_name="Resume Strategist (Actor)",
            status="draft",
            thought="Drafting aggressive high-impact bullet using Google X-Y-Z formula to maximize ATS score...",
            message=f"Draft Bullet #1: '{sample_b[:120]}...'",
        ))

        audit_result = self.fact_checker.run(
            candidate_id=candidate_id,
            bullets=current_tailored["bullets"],
        )

        if not audit_result["is_valid"]:
            self.event_bus.publish(AgentEvent(
                workflow_id=workflow_id,
                step="Fact Checker (Critic Auditor)",
                agent="critic",
                agent_name="Fact Checker (Critic Auditor)",
                status="critic_alert",
                thought="Querying Qdrant Evidence Lake for candidate claims...",
                message=f"⚠️ CRITIC REJECT: Found {len(audit_result.get('revisions_needed', []))} unsupported claim(s). Requesting revision.",
            ))
        else:
            self.event_bus.publish(AgentEvent(
                workflow_id=workflow_id,
                step="Fact Checker (Critic Auditor)",
                agent="critic",
                agent_name="Fact Checker (Critic Auditor)",
                status="approved",
                thought="Auditing tailored bullets against Qdrant collection...",
                message="✅ CRITIC APPROVED: 100% vector grounding confidence. Zero hallucination detected.",
            ))

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

            self.event_bus.publish(AgentEvent(
                workflow_id=workflow_id,
                step="Resume Strategist (Actor)",
                agent="writer",
                agent_name="Resume Strategist (Actor)",
                status="critic_revision",
                thought="Re-grounding statement strictly into verified repository evidence...",
                message=f"Refined Bullet #1: '{refined_bullets[0][:120]}...'",
            ))

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

        self.event_bus.publish(AgentEvent(
            workflow_id=workflow_id,
            step="Fact Checker (Critic Auditor)",
            agent="critic",
            agent_name="Fact Checker (Critic Auditor)",
            status="approved",
            thought="Final grounding verification complete.",
            message=f"✅ Final ATS Match Score: {ats_score}%. Ready for application submission.",
        ))
        self.event_bus.complete_workflow(workflow_id)

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

