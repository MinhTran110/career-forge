from typing import Any, Dict, List, Optional


class SkillStrategistAgent:
    """Agent 3: Analyzes skill gaps and crafts an actionable 48-Hour Sprint Roadmap."""

    SKILL_RESOURCE_CATALOG = {
        "kubernetes": {
            "criticality": "high",
            "hours": 12,
            "project_module": "Container Orchestration & Helm deployment chart",
            "concept": "Pod autoscaling, Ingress controller, and persistent volumes",
        },
        "kafka": {
            "criticality": "high",
            "hours": 14,
            "project_module": "Event-driven distributed producer-consumer stream",
            "concept": "Topic partitioning, consumer groups, and commit offsets",
        },
        "redis": {
            "criticality": "medium",
            "hours": 8,
            "project_module": "Distributed cache layer & pub/sub rate limiting",
            "concept": "Cache invalidation strategies and Redis sorted sets",
        },
        "celery": {
            "criticality": "medium",
            "hours": 10,
            "project_module": "Async background task workers with Redis broker",
            "concept": "Task retries, exponential backoff, and chord/group workflows",
        },
        "docker": {
            "criticality": "high",
            "hours": 8,
            "project_module": "Multi-stage Dockerfile build & image size optimization",
            "concept": "Container security scanning and layer caching",
        },
        "triton": {
            "criticality": "high",
            "hours": 16,
            "project_module": "Model serving inference repository with dynamic batching",
            "concept": "Triton C++ client, ensemble models, and GPU memory management",
        },
        "cuda": {
            "criticality": "high",
            "hours": 20,
            "project_module": "Custom CUDA tensor kernel with PyTorch C++ extension",
            "concept": "Memory coalescing, shared memory tiling, and warp primitives",
        },
    }

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}

    def analyze_gap_matrix(
        self,
        candidate_skills: List[str],
        job_requirements: List[str],
        tech_stack: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Maps missing technical skills to actionable learning items and criticality."""
        candidate_lower = {s.lower() for s in candidate_skills}
        tech_stack_lower = {s.lower() for s in (tech_stack or [])}

        missing_skills = []
        gap_matrix = {}

        all_target_skills = list(dict.fromkeys(job_requirements + (tech_stack or [])))
        for req in all_target_skills:
            req_clean = req.strip()
            if req_clean.lower() not in candidate_lower:
                missing_skills.append(req_clean)
                info = self.SKILL_RESOURCE_CATALOG.get(req_clean.lower(), {
                    "criticality": "high" if req_clean.lower() in tech_stack_lower else "medium",
                    "hours": 10,
                    "project_module": f"Hands-on reference prototype using {req_clean}",
                    "concept": f"Production implementation and design patterns for {req_clean}",
                })
                gap_matrix[req_clean] = {
                    "skill": req_clean,
                    "criticality": info["criticality"],
                    "estimated_hours": info["hours"],
                    "target_concept": info["concept"],
                    "project_module": info["project_module"],
                }

        return {
            "missing_skills": missing_skills,
            "gap_matrix": gap_matrix,
            "total_estimated_gap_hours": sum(item["estimated_hours"] for item in gap_matrix.values()),
        }

    def generate_48h_roadmap(
        self,
        target_role: str,
        missing_skills: List[str],
        candidate_skills: List[str],
    ) -> Dict[str, Any]:
        """Synthesizes a 48-Hour Hands-On Portfolio Sprint divided into 4 key milestones."""
        top_focus = missing_skills[:2] if missing_skills else ["Production Hardening", "System Design"]
        focus_str = " & ".join(top_focus)
        project_title = f"High-Throughput {target_role.split('/')[0].strip()} Capstone ({focus_str})"

        milestones = [
            {
                "milestone": 1,
                "hour_window": "00h - 12h",
                "title": "Architecture Blueprint, Data Contract & Scaffolding",
                "deliverables": [
                    f"Initialize Git repository and define domain data models for {focus_str}",
                    "Configure containerized environment with Docker Compose",
                    "Write API/service contract specification with strict typing",
                ],
                "skills_addressed": [candidate_skills[0] if candidate_skills else "Python"] + top_focus[:1],
                "verification_gate": "Clean repository structure, passing linter, docker build passes",
            },
            {
                "milestone": 2,
                "hour_window": "12h - 24h",
                "title": "Core Pipeline & Business Logic Implementation",
                "deliverables": [
                    f"Implement core processing engine integrating {focus_str}",
                    "Add connection pooling, retry policies, and error boundaries",
                    "Expose health checks and operational telemetry",
                ],
                "skills_addressed": top_focus,
                "verification_gate": "Core functionality working end-to-end with mock test data",
            },
            {
                "milestone": 3,
                "hour_window": "24h - 36h",
                "title": "Stress Testing, Performance Benchmarking & Metric Extraction",
                "deliverables": [
                    "Implement comprehensive unit and integration test suite with pytest",
                    "Run load/stress testing to record p95/p99 latency and throughput (RPS)",
                    "Optimize bottlenecks (indexing, query caching, async workers)",
                ],
                "skills_addressed": ["Pytest", "Benchmarking", "Latency Optimization"],
                "verification_gate": "Test coverage > 85%, documented quantitative benchmark results",
            },
            {
                "milestone": 4,
                "hour_window": "36h - 48h",
                "title": "Documentation, Evidence Grounding & GitHub Release",
                "deliverables": [
                    "Draft production README with Architecture Diagram (Mermaid) and benchmark metrics",
                    "Tag v1.0.0 release on GitHub and link commit proof in portfolio",
                    "Index repository evidence into Qdrant ground-truth lake",
                ],
                "skills_addressed": ["Technical Writing", "Open-Source Grounding", "Release Engineering"],
                "verification_gate": "Live GitHub repo with clear proof-of-work ready for recruiters",
            },
        ]

        return {
            "project_title": project_title,
            "target_role": target_role,
            "skills_targeted": top_focus,
            "estimated_duration_hours": 48,
            "milestones": milestones,
        }

    def run(
        self,
        candidate_skills: List[str],
        job_requirements: List[str],
        job_title: str = "Software Engineer",
        tech_stack: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Main entry point: combines gap analysis and 48h sprint planning."""
        gap_analysis = self.analyze_gap_matrix(candidate_skills, job_requirements, tech_stack)
        roadmap = self.generate_48h_roadmap(
            target_role=job_title,
            missing_skills=gap_analysis["missing_skills"],
            candidate_skills=candidate_skills,
        )

        return {
            "status": "completed",
            "agent": "Skill Strategist",
            "missing_skills": gap_analysis["missing_skills"],
            "gap_matrix": gap_analysis["gap_matrix"],
            "mini_project_roadmap": roadmap,
        }
