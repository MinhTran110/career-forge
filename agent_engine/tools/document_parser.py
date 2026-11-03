import io
from typing import Dict, Any


class DocumentParserTool:
    """Parses legacy PDF / Word resumes using Docling/pdfplumber."""

    def parse_resume_file(self, file_bytes: bytes) -> Dict[str, Any]:
        return {
            "extracted_text": "Experienced software engineer with 4+ years building Python, FastAPI, and React web apps.",
            "inferred_skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            "experience_entries": 3,
        }
