import hashlib
import re
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


class JobHunterTool:
    """Discovers, normalizes, and deduplicates tech job postings from job boards and web scrapers."""

    SEED_MARKET_JOBS = [
        {
            "title": "Senior Backend Engineer (Python / FastAPI / Distributed)",
            "company": "VNG Corporation",
            "location": "TP. Hồ Chí Minh (VNG Campus, Quận 7)",
            "salary_range": "35.000.000 - 55.000.000 VND",
            "job_type": "Full-time",
            "url": "https://careers.vng.com.vn/",
            "description": "VNG Corporation tìm kiếm Senior Backend Engineer gia nhập đội ngũ Zalo / VNG Cloud. Thiết kế và phát triển microservices chịu tải cao hàng triệu CCU, tối ưu hóa latency cho distributed storage và streaming API. Yêu cầu thành thạo Python, FastAPI, Docker, Kubernetes, Redis và PostgreSQL. Môi trường chuẩn quốc tế với đầy đủ tiện ích và phúc lợi hấp dẫn.",
            "requirements": ["Python", "FastAPI", "Docker", "Kubernetes", "Redis", "PostgreSQL", "Microservices"],
            "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Kafka"],
        },
        {
            "title": "Senior Backend Developer (Fintech Platform & Payment Gateway)",
            "company": "MoMo (M-Service)",
            "location": "TP. Hồ Chí Minh (Phú Nhuận)",
            "salary_range": "40.000.000 - 60.000.000 VND",
            "job_type": "Full-time",
            "url": "https://momo.vn/tuyen-dung",
            "description": "Tham gia phát triển hạ tầng Core Payment và Ví Điện Tử MoMo phục vụ hơn 30 triệu người dùng. Xây dựng dịch vụ giao dịch tài chính với tính sẵn sàng cao 99.99%, độ trễ thấp, tích hợp ngân hàng đối tác. Yêu cầu vững vàng về Python, Microservices kiến trúc hướng sự kiện, RabbitMQ/Kafka, Redis caching và bảo mật thanh toán.",
            "requirements": ["Python", "Microservices", "Kafka", "Redis", "PostgreSQL", "Docker", "CI/CD"],
            "tech_stack": ["Python", "FastAPI", "Redis", "Kafka", "Docker", "PostgreSQL"],
        },
        {
            "title": "AI Platform & Cloud Solutions Architect",
            "company": "FPT Software",
            "location": "Hà Nội / Hybrid",
            "salary_range": "35.000.000 - 65.000.000 VND",
            "job_type": "Hybrid",
            "url": "https://fptsoftware.com/careers",
            "description": "FPT Software tuyển dụng AI Platform Architect dẫn dắt các dự án giải pháp Trí tuệ nhân tạo (GenAI & LLMs) và điện toán đám mây cho khách hàng toàn cầu. Trách nhiệm bao gồm triển khai mô hình LLM serving tốc độ cao với FastAPI, vLLM, Docker container orchestration, và xây dựng hệ thống Multi-Agent Copilot.",
            "requirements": ["Python", "FastAPI", "Docker", "Kubernetes", "LLM", "vLLM", "Cloud Architect"],
            "tech_stack": ["Python", "FastAPI", "Docker", "Kubernetes", "vLLM", "AWS"],
        },
        {
            "title": "Distributed Systems & Cloud Engineer (Digital Banking)",
            "company": "Techcombank",
            "location": "Hà Nội (Techcombank Tower)",
            "salary_range": "40.000.000 - 60.000.000 VND",
            "job_type": "Full-time",
            "url": "https://www.techcombank.com/ve-chung-toi/co-hoi-nghe-nghiep",
            "description": "Techcombank chuyển đổi số mạnh mẽ với chiến lược Data & Digital-first. Vị trí Cloud Engineer phụ trách hạ tầng microservices ngân hàng số, tối ưu hóa đường truyền dữ liệu lớn, quản lý cụm Kubernetes an toàn, bảo đảm SLA và bảo mật theo chuẩn khắt khe của ngành ngân hàng.",
            "requirements": ["Distributed Systems", "Kubernetes", "Docker", "Python", "Cloud (AWS/GCP)", "CI/CD", "PostgreSQL"],
            "tech_stack": ["Kubernetes", "Docker", "Python", "PostgreSQL", "AWS", "Kafka"],
        },
        {
            "title": "Senior Python & Cloud Services Engineer",
            "company": "Viettel Solutions",
            "location": "Hà Nội (Duy Tân, Cầu Giấy)",
            "salary_range": "30.000.000 - 50.000.000 VND",
            "job_type": "Full-time",
            "url": "https://tuyendung.viettel.vn/",
            "description": "Tổng công ty Giải pháp Doanh nghiệp Viettel (Viettel Solutions) tìm kiếm Kỹ sư Phát triển Hệ thống Cloud/Backend. Nhiệm vụ tham gia xây dựng các nền tảng Chính phủ điện tử (e-Gov), Smart City và Smart Health quy mô toàn quốc. Cần ứng viên giàu kinh nghiệm về RESTful API, FastAPI/Django, Linux internals, microservices.",
            "requirements": ["Python", "FastAPI", "PostgreSQL", "Docker", "Linux", "RESTful API", "Redis"],
            "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Docker", "Linux", "Redis"],
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
