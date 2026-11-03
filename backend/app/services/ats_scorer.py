import re
from typing import Any


class AtsScorer:
    """Calculates ATS Match Score, Keyword Frequency & Section Quantifiability."""

    def score_resume(self, resume_text: str, job_requirements: list[str]) -> dict[str, Any]:
        resume_lower = resume_text.lower()
        matched_keywords = []
        missing_keywords = []

        for req in job_requirements:
            req_clean = req.strip().lower()
            if req_clean and req_clean in resume_lower:
                matched_keywords.append(req)
            else:
                missing_keywords.append(req)

        total = len(job_requirements) or 1
        match_rate = len(matched_keywords) / total

        # Check quantifiability: numbers, percentages, metrics ($/%)
        metric_matches = re.findall(r'(\d+%|\$\d+|\d+x|\d+\+)', resume_text)
        quant_score = min(1.0, len(metric_matches) / 5.0)

        overall_score = round((match_rate * 0.7 + quant_score * 0.3) * 100, 1)

        return {
            "ats_score": overall_score,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "quantifiable_metrics_count": len(metric_matches),
            "metric_highlights": metric_matches[:5],
        }


ats_scorer = AtsScorer()
