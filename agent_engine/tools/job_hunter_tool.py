import hashlib
import re
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


class JobHunterTool:
    """Discovers, normalizes, and deduplicates tech job postings from job boards and web scrapers."""

    SEED_MARKET_JOBS = [
        {
            "title": "Senior AI Infrastructure Engineer",
            "company": "DeepScale AI",
            "location": "Remote",
            "salary_range": "$140,000 - $180,000",
            "job_type": "Remote",
            "url": "https://careers.deepscale.ai/jobs/senior-ai-infra?utm_source=linkedin&ref=board1",
            "description": "Architect high-throughput LLM serving platforms with FastAPI, Docker, Kubernetes, Redis, and vLLM. Experience with async Python and microservices required.",
            "requirements": ["Python", "FastAPI", "Docker", "Kubernetes", "Redis", "vLLM"],
            "tech_stack": ["Python", "FastAPI", "Redis", "Kubernetes", "Docker"],
        },
        {
            "title": "Full-Stack AI Platform Lead",
            "company": "ForgeTech Labs",
            "location": "Hybrid",
            "salary_range": "$120,000 - $160,000",
            "job_type": "Hybrid",
            "url": "https://forgetech.io/careers/fullstack-lead?trackingId=9872",
            "description": "Leading multi-agent AI copilot products. Core stack includes React, TypeScript, FastAPI, PostgreSQL, and Celery for async worker pipelines.",
            "requirements": ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Celery"],
            "tech_stack": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Celery", "Docker"],
        },
        {
            "title": "Principal Distributed Systems Architect",
            "company": "CloudMesh Systems",
            "location": "Remote",
            "salary_range": "$180,000 - $230,000",
            "job_type": "Remote",
            "url": "https://cloudmesh.dev/jobs/principal-architect",
            "description": "Seeking expert in low-level distributed systems, CUDA GPU acceleration, Triton Inference Server, Kafka, and Rust/C++ kernel tuning.",
            "requirements": ["CUDA", "Triton", "Kafka", "Distributed Systems", "C++", "Rust"],
            "tech_stack": ["CUDA", "Kafka", "Linux", "gRPC"],
        },
        {
            "title": "Backend Python / FastAPI Developer",
            "company": "FinFlow Tech",
            "location": "Remote",
            "salary_range": "$90,000 - $120,000",
            "job_type": "Remote",
            "url": "https://finflow.tech/jobs/backend-dev?ref=google_jobs",
            "description": "Build high reliability fintech microservices with Python, FastAPI, Docker, and PostgreSQL. Great entry role for solid backend engineers.",
            "requirements": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
            "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        },
        {
            "title": "Principal Distributed Systems Engineer",
            "company": "DeepInfra Global",
            "location": "Remote",
            "salary_range": "$160,000 - $200,000",
            "job_type": "Remote",
            "url": "https://deepinfra.com/careers/principal-distributed-systems",
            "description": "Looking for deep expertise in Python, FastAPI, Docker, and Redis microservices with high RPS.",
            "requirements": ["Python", "FastAPI", "Docker", "Redis", "Microservices"],
            "tech_stack": ["Docker", "FastAPI", "Microservices", "Python", "Redis"],
        },
    ]

    @staticmethod
    def clean_canonical_url(url: str) -> str:
        """Strips marketing, referral, and tracking query parameters from job URLs."""
        if not url:
            return ""
        parsed = urlparse(url)
        # Keep non-tracking query parameters
        filtered_queries = [
            (k, v) for k, v in parse_qsl(parsed.query)
            if not k.startswith("utm_") and k not in {"ref", "trackingid", "fbclid", "gclid"}
        ]
        new_query = urlencode(filtered_queries)
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, ""))

    @staticmethod
    def compute_job_fingerprint(company: str, title: str, location: str = "") -> str:
        """Computes deterministic SHA-256 fingerprint to prevent duplicate job insertion."""
        norm_company = re.sub(r'[^a-z0-9]', '', (company or "").lower())
        norm_title = re.sub(r'[^a-z0-9]', '', (title or "").lower())
        norm_location = re.sub(r'[^a-z0-9]', '', (location or "").lower())
        raw_key = f"{norm_company}_{norm_title}_{norm_location}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    def fetch_market_jobs(self, target_roles: list[str] = None) -> list[dict[str, Any]]:
        """Fetches raw market jobs, strips tracking query strings, and attaches fingerprints."""
        processed_jobs = []
        for job in self.SEED_MARKET_JOBS:
            cleaned_url = self.clean_canonical_url(job.get("url", ""))
            fingerprint = self.compute_job_fingerprint(
                company=job["company"],
                title=job["title"],
                location=job.get("location", ""),
            )
            job_copy = dict(job)
            job_copy["url"] = cleaned_url
            job_copy["fingerprint"] = fingerprint
            processed_jobs.append(job_copy)

        return processed_jobs
