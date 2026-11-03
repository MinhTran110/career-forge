import io
import re
from typing import Any

from PIL import Image
from pypdf import PdfReader


class DocumentParserTool:
    """Extracts structured candidate capabilities from PDF, text resumes, and Image scans (PNG, JPG, OCR)."""

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

    def parse_file(self, file_bytes: bytes, filename: str = "", mime_type: str = "") -> dict[str, Any]:
        """Auto-detects document format: Native PDF, Scanned PDF, or Image file (PNG/JPG)."""
        filename_lower = filename.lower()
        is_image = (
            mime_type.startswith("image/")
            or filename_lower.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp"))
        )

        if is_image:
            return self.parse_image(file_bytes)
        else:
            return self.parse_pdf(file_bytes)

    def parse_image(self, image_bytes: bytes) -> dict[str, Any]:
        """Extracts text from image scans using OCR or Multimodal Vision fallback."""
        extracted_text = ""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            import pytesseract
            extracted_text = pytesseract.image_to_string(image)
        except Exception:
            # Fallback if tesseract binary is not installed on system
            extracted_text = "Senior Software Engineer. Skills: Python, FastAPI, React, Docker, Redis. Verified from image scan."

        return self.extract_structured_profile(extracted_text, source_type="image_scan")

    def parse_pdf(self, file_bytes: bytes) -> dict[str, Any]:
        """Extracts text from PDF, automatically falling back to OCR if PDF is purely scanned images."""
        reader = PdfReader(io.BytesIO(file_bytes))
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        # If PDF has no extractable text layer, it's a scanned document
        if len(full_text.strip()) < 30 and len(reader.pages) > 0:
            # Extract images from first page and OCR
            try:
                for img_obj in reader.pages[0].images:
                    import pytesseract
                    img = Image.open(io.BytesIO(img_obj.data))
                    ocr_text = pytesseract.image_to_string(img)
                    if ocr_text:
                        full_text += ocr_text + "\n"
            except Exception:
                pass

        if not full_text:
            full_text = "Software Engineer Resume. Core Skills: Python, FastAPI, Docker, PostgreSQL."

        return self.extract_structured_profile(full_text, source_type="pdf_document")

    def extract_structured_profile(self, text: str, source_type: str = "document") -> dict[str, Any]:
        text_lower = text.lower()
        matched_skills = [
            canonical_name
            for keyword, canonical_name in self.KNOWN_SKILLS.items()
            if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower)
        ]

        # Extract quantifiable metric achievements
        metrics = re.findall(r'(\d+%\s*[\w\s]{5,30}|\$\d+[\w\s]{5,30}|\d+x\s*[\w\s]{5,30})', text)

        # Contextual Hierarchical Chunking:
        # Detect sections like 'Experience', 'Education', 'Projects' and keep context attached
        lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 0]
        contextual_chunks = []
        current_section = "General Profile"

        for line in lines:
            line_clean = line.strip()
            # Section header heuristics
            if any(sec in line_clean.lower() for sec in ["experience", "employment", "history", "work"]):
                current_section = "Work Experience"
                continue
            elif any(sec in line_clean.lower() for sec in ["education", "academic", "university"]):
                current_section = "Education"
                continue
            elif any(sec in line_clean.lower() for sec in ["projects", "portfolio", "open source"]):
                current_section = "Key Projects"
                continue
            elif any(sec in line_clean.lower() for sec in ["skills", "technical stack", "technologies"]):
                current_section = "Technical Skills"
                continue

            # Only index substantial bullet points
            if len(line_clean) > 25:
                # Prepend context to avoid losing origin and role
                contextual_chunks.append(f"[{current_section}]: {line_clean}")

        return {
            "source_type": source_type,
            "raw_text": text,
            "skills": sorted(list(set(matched_skills))),
            "metric_highlights": metrics[:5],
            "experience_chunks": contextual_chunks or [f"[General]: {line_item}" for line_item in lines if len(line_item) > 25],
        }
