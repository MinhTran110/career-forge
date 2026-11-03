import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader


class DocumentParserTool:
    """Extracts structured candidate capabilities from PDF and text resumes."""

    KNOWN_SKILLS = {
        "python": "Python",
        "fastapi": "FastAPI",
        "react": "React",
        "typescript": "TypeScript",
        "javascript": "JavaScript",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "redis": "Redis",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "sql": "SQL",
        "qdrant": "Qdrant",
        "mongodb": "MongoDB",
        "aws": "AWS",
        "gcp": "GCP",
        "azure": "Azure",
        "celery": "Celery",
        "graphql": "GraphQL",
        "typst": "Typst",
        "whisper": "Whisper",
        "linux": "Linux",
        "git": "Git",
        "ci/cd": "CI/CD",
        "pytorch": "PyTorch",
        "tensorflow": "TensorFlow",
        "pandas": "Pandas",
        "numpy": "NumPy",
        "kafka": "Kafka",
        "grpc": "gRPC",
        "microservices": "Microservices",
        "vllm": "vLLM",
    }

    def parse_pdf(self, file_bytes: bytes) -> Dict[str, Any]:
        reader = PdfReader(io.BytesIO(file_bytes))
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        return self.extract_structured_profile(full_text)

    def extract_structured_profile(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        matched_skills = [
            canonical_name
            for keyword, canonical_name in self.KNOWN_SKILLS.items()
            if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower)
        ]

        # Extract quantifiable metric achievements
        metrics = re.findall(r'(\d+%\s*[\w\s]{5,30}|\$\d+[\w\s]{5,30}|\d+x\s*[\w\s]{5,30})', text)

        # Break text into paragraphs/bullet points for evidence chunks
        lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 20]

        return {
            "raw_text": text,
            "skills": sorted(list(set(matched_skills))),
            "metric_highlights": metrics[:5],
            "experience_chunks": lines,
        }
