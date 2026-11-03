from typing import Any

from agent_engine.tools.vector_retriever import VectorRetrieverTool


class FactCheckerAgent:
    """Agent 5 (Critic): Audits tailored resume claims against candidate ground-truth in Qdrant to eliminate hallucinations."""

    def __init__(self, vector_tool: VectorRetrieverTool | None = None, threshold: float = 0.35):
        self.vector_tool = vector_tool or VectorRetrieverTool()
        self.threshold = threshold

    def audit_bullet_claim(self, candidate_id: str, bullet_text: str) -> dict[str, Any]:
        """Audits an individual resume bullet point against candidate ground truth."""
        audit_result = self.vector_tool.verify_claim(
            candidate_id=candidate_id,
            claim=bullet_text,
            threshold=self.threshold,
        )

        return {
            "bullet": bullet_text,
            "supported": audit_result["supported"],
            "confidence_score": audit_result["confidence_score"],
            "grounding_evidence": audit_result.get("grounding_evidence"),
        }

    def audit_tailored_resume(
        self,
        candidate_id: str,
        bullets: list[str],
    ) -> dict[str, Any]:
        """Audits all bullet points of a resume and produces a grounding verdict."""
        audited_bullets = []
        hallucinations = 0
        total_confidence = 0.0

        for b in bullets:
            audit = self.audit_bullet_claim(candidate_id, b)
            audited_bullets.append(audit)
            total_confidence += audit["confidence_score"]
            if not audit["supported"]:
                hallucinations += 1

        total = len(bullets) or 1
        avg_confidence = round(total_confidence / total, 4)
        is_valid = hallucinations == 0

        # Suggested revisions if any bullet failed
        revisions = []
        for a in audited_bullets:
            if not a["supported"]:
                ev = a.get("grounding_evidence")
                ev_text = ev["text"] if ev else "verified core capabilities"
                revisions.append({
                    "original": a["bullet"],
                    "suggested_grounded": f"Engineered system components aligned with verified experience: {ev_text}",
                    "reason": f"Low vector grounding confidence ({a['confidence_score']:.2f} < {self.threshold})",
                })

        return {
            "is_valid": is_valid,
            "grounding_score": round(avg_confidence * 100, 1),
            "hallucinations_detected": hallucinations,
            "total_bullets_audited": len(bullets),
            "audited_bullets": audited_bullets,
            "revisions_needed": revisions,
        }

    def run(
        self,
        candidate_id: str,
        bullets: list[str],
    ) -> dict[str, Any]:
        """Main execution entrypoint."""
        audit_report = self.audit_tailored_resume(candidate_id=candidate_id, bullets=bullets)
        return {
            "status": "verified" if audit_report["is_valid"] else "refinement_required",
            "agent": "Fact Checker (Critic)",
            **audit_report,
        }
