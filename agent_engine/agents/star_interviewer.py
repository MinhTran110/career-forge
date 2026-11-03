import re
from typing import Any, Dict, List, Optional


class StarInterviewerAgent:
    """Agent 6: Simulates realistic technical interviews and evaluates responses using the 4-dimension STAR rubric."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}

    def generate_interview_questions(
        self,
        job_title: str = "Senior Software Engineer",
        tech_stack: Optional[List[str]] = None,
        requirements: Optional[List[str]] = None,
        num_questions: int = 3,
    ) -> List[Dict[str, Any]]:
        """Generates role-tailored behavioral and architectural interview questions."""
        skills = list(dict.fromkeys((tech_stack or []) + (requirements or [])))
        primary_tool = skills[0] if skills else "distributed backend microservices"
        secondary_tool = skills[1] if len(skills) > 1 else "database caching and indexing"

        standard_pool = [
            {
                "id": "q1_arch",
                "category": "System Architecture & Scalability",
                "question": f"Describe a time you designed a high-throughput system using {primary_tool}. How did you ensure fault-tolerance, low latency, and graceful degradation under peak load?",
                "rubric_focus": "Looking for clear architectural tradeoffs, asynchronous communication, and connection pooling.",
            },
            {
                "id": "q2_troubleshoot",
                "category": "Debugging & Incident Resolution",
                "question": f"Tell me about a challenging production outage or performance bottleneck involving {secondary_tool}. What root-cause analysis techniques did you use, and what was the resolution?",
                "rubric_focus": "Looking for systematic telemetry analysis (logs/metrics/traces) and preventive architectural remediation.",
            },
            {
                "id": "q3_behavioral",
                "category": "Behavioral Leadership & Engineering Tradeoffs",
                "question": f"Can you give an example of a situation where you had a disagreement with your team or product manager regarding technical debt versus shipping new features for {job_title}? How did you resolve it?",
                "rubric_focus": "Looking for empathy, data-driven negotiation, and aligning engineering velocity with business value.",
            },
        ]

        return standard_pool[:num_questions]

    def evaluate_star_answer(
        self,
        question: str,
        answer_text: str,
    ) -> Dict[str, Any]:
        """Evaluates an answer across the 4 STAR pillars: Situation, Task, Action, Result."""
        text_lower = answer_text.lower()
        word_count = len(answer_text.split())

        # 1. Situation: Context, environment, project scope
        s_cues = ["when i was", "at my previous", "in our team", "in our system", "production", "infrastructure", "client", "project", "we had a platform"]
        s_hits = sum(1 for cue in s_cues if cue in text_lower)
        situation_score = min(95.0, 50.0 + (s_hits * 15.0) + min(15.0, word_count / 10.0))

        # 2. Task: Problem definition, specific challenge, engineering constraints
        t_cues = ["tasked with", "goal was", "objective", "problem was", "needed to", "challenge", "bottleneck", "issue", "requirement", "slas"]
        t_hits = sum(1 for cue in t_cues if cue in text_lower)
        task_score = min(95.0, 50.0 + (t_hits * 15.0) + min(15.0, word_count / 10.0))

        # 3. Action: First-person agency ("I"), specific technical decisions and tools
        a_verbs = ["i architected", "i implemented", "i designed", "i migrated", "i optimized", "i wrote", "i deployed", "i configured", "using", "by deploying"]
        a_hits = sum(1 for v in a_verbs if v in text_lower)
        action_score = min(98.0, 45.0 + (a_hits * 16.0) + min(15.0, word_count / 10.0))

        # 4. Result: Quantitative metrics (% latency, RPS, uptime, memory, savings)
        metrics = re.findall(r'(\d+%\s*[\w\s]*|\d+[kKmMbB]?\s*(?:RPS|requests|queries|qps|users)|\d+x|\$\d+|\b99\.9+%)', answer_text)
        r_cues = ["reduced", "improved", "increased", "decreased", "saved", "achieved", "resulting in", "as a result"]
        r_hits = sum(1 for c in r_cues if c in text_lower) + (len(metrics) * 2)
        result_score = min(95.0, 40.0 + (r_hits * 18.0))

        # Composite overall score
        overall = round((situation_score + task_score + action_score + result_score) / 4.0, 1)

        # Generate Strengths & Improvements
        strengths = []
        improvements = []

        if situation_score >= 75.0:
            strengths.append("Clearly established production context and system architecture scope.")
        else:
            improvements.append("Elaborate more on the initial situation, business domain, and technical environment.")

        if task_score >= 75.0:
            strengths.append("Articulated the core technical challenge and engineering constraints effectively.")
        else:
            improvements.append("Clearly define the explicit engineering task or SLA objective you were assigned.")

        if action_score >= 75.0:
            strengths.append("Demonstrated decisive personal technical leadership ('I' vs 'We') and concrete tooling choices.")
        else:
            improvements.append("Highlight your personal contributions ('I built/optimized') rather than collective team actions.")

        if result_score >= 75.0:
            strengths.append(f"Strong quantitative impact demonstrated with measurable metrics ({', '.join(metrics[:2]) if metrics else 'documented improvements'}).")
        else:
            improvements.append("Quantify your business outcome using exact numbers, e.g., 'reduced p99 latency by 35%' or 'scaled to 10k RPS'.")

        # Recommended STAR answer pattern
        recommended_answer = (
            "Situation: In our production platform serving 5M daily users, we experienced critical database connection exhaustion during peak traffic. "
            "Task: My goal was to eliminate 500 errors and stabilize p99 latency below 150ms without over-provisioning cloud infrastructure. "
            "Action: I architected asynchronous connection pooling with Redis caching and FastAPI background workers, implementing circuit breaker patterns for database queries. "
            "Result: Completely eliminated database connection dropouts, reduced p99 latency by 42%, and saved $18,000 in monthly database provisioning costs."
        )

        return {
            "situation_score": round(situation_score, 1),
            "task_score": round(task_score, 1),
            "action_score": round(action_score, 1),
            "result_score": round(result_score, 1),
            "overall_score": overall,
            "strengths": strengths,
            "improvements": improvements,
            "recommended_answer": recommended_answer,
        }

    def run(self, question: str, answer_text: str) -> Dict[str, Any]:
        """Entrypoint for question answer evaluation."""
        eval_result = self.evaluate_star_answer(question=question, answer_text=answer_text)
        return {
            "status": "completed",
            "agent": "STAR Interviewer",
            "question": question,
            "scores": {
                "situation": eval_result["situation_score"],
                "task": eval_result["task_score"],
                "action": eval_result["action_score"],
                "result": eval_result["result_score"],
                "composite": eval_result["overall_score"],
            },
            "strengths": eval_result["strengths"],
            "improvements": eval_result["improvements"],
            "recommended_answer": eval_result["recommended_answer"],
        }
