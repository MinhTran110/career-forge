import re
from typing import Any, Dict, List, Optional

from agent_engine.core.model_gateway import ModelGateway, model_gateway as default_model_gateway
from agent_engine.core.tool_registry import AgentRole, ToolRegistry, tool_registry as default_tool_registry


class StarInterviewerAgent:
    """Agent 6: Simulates realistic technical interviews and evaluates responses using the 4-dimension STAR rubric."""

    STAR_EVAL_SYSTEM_PROMPT = (
        "You are an elite Principal Engineering Leader and STAR Interview Coach.\n"
        "Your mission is to evaluate candidate responses across the 4 STAR pillars:\n"
        "- Situation (0-100): Clear context, engineering scale, and project scope.\n"
        "- Task (0-100): Concrete problem definition, bottlenecks, or constraints.\n"
        "- Action (0-100): Individual technical contributions, tradeoffs, algorithms, and architectures.\n"
        "- Result (0-100): Measurable metrics, p99 latency, cost savings, throughput.\n"
    )

    def __init__(
        self,
        config: Optional[Dict[str, Any]] = None,
        model_gateway: Optional[ModelGateway] = None,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        self.config = config or {}
        self.model_gateway = model_gateway or default_model_gateway
        self.tool_registry = tool_registry or default_tool_registry
        self.role = AgentRole.STAR_INTERVIEWER

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

    def generate_interview_questions_from_cv_and_jd(
        self,
        cv_skills: Optional[List[str]] = None,
        job_title: str = "Senior Software Engineer",
        job_description: str = "",
        target_requirements: Optional[List[str]] = None,
        num_questions: int = 4,
    ) -> Dict[str, Any]:
        """Generates hyper-tailored interview questions cross-referencing candidate's CV skills with the target Job Description."""
        cv_list = [s.strip() for s in (cv_skills or []) if s.strip()]
        if not cv_list:
            cv_list = ["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"]

        req_list = [r.strip() for r in (target_requirements or []) if r.strip()]
        if not req_list:
            req_list = ["Python", "Microservices", "Docker", "Kubernetes", "Redis", "Kafka"]

        cv_lower_map = {s.lower(): s for s in cv_list}
        req_lower_map = {r.lower(): r for r in req_list}

        matched_skills = [cv_lower_map[k] for k in cv_lower_map if k in req_lower_map]
        missing_skills = [req_lower_map[k] for k in req_lower_map if k not in cv_lower_map]
        if not matched_skills:
            matched_skills = cv_list[:3]

        primary_match = matched_skills[0] if matched_skills else "Python/Backend"
        secondary_match = matched_skills[1] if len(matched_skills) > 1 else (cv_list[1] if len(cv_list) > 1 else "Database/Caching")
        gap_skill = missing_skills[0] if missing_skills else "Kubernetes & Distributed Tracing"

        # Check if live LLM is configured
        llm_questions = []
        if self.model_gateway.api_key:
            try:
                import json
                system_prompt = (
                    "Bạn là Trưởng ban Kỹ thuật (Engineering Director) tại công ty công nghệ hàng đầu Việt Nam.\n"
                    "Nhiệm vụ: Dựa vào Kỹ năng thực tế từ CV và Bản mô tả công việc (JD), hãy tạo bộ câu hỏi phỏng vấn sát thực tế nhất.\n"
                    "Mỗi câu hỏi phải đi kèm: skill_evaluated, cv_evidence_context (lý do hỏi dựa vào CV/JD), sample_star_answer (gợi ý trả lời theo STAR: Tình huống - Nhiệm vụ - Hành động - Kết quả), tips_for_candidate.\n"
                    "Trả về JSON định dạng mảng: [{\"id\": \"q1\", \"category\": \"...\", \"question\": \"...\", \"skill_evaluated\": \"...\", \"cv_evidence_context\": \"...\", \"sample_star_answer\": \"...\", \"tips_for_candidate\": \"...\"}]"
                )
                user_prompt = (
                    f"Vị trí tuyển dụng: {job_title}\n"
                    f"Kỹ năng trong CV ứng viên: {', '.join(cv_list)}\n"
                    f"Kỹ năng trùng khớp (Matched): {', '.join(matched_skills)}\n"
                    f"Kỹ năng còn thiếu trong CV so với JD: {', '.join(missing_skills)}\n"
                    f"Trích đoạn mô tả JD: {job_description[:600]}\n"
                    f"Hãy tạo {num_questions} câu hỏi phỏng vấn chuẩn mực bằng Tiếng Việt."
                )
                resp = self.model_gateway.generate_text_sync(user_prompt, system_prompt=system_prompt, temperature=0.4)
                match = re.search(r'\[\s*\{.*\}\s*\]', resp, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    if isinstance(parsed, list) and len(parsed) > 0:
                        llm_questions = parsed
            except Exception:
                llm_questions = []

        if not llm_questions:
            llm_questions = [
                {
                    "id": "cv_q_tech_deep",
                    "category": "Kỹ thuật chuyên sâu (CV Skills)",
                    "question": f"Trong CV bạn nêu có kinh nghiệm vững về {primary_match}. Đối với vị trí {job_title}, khi hệ thống chạm ngưỡng hàng trăm nghìn requests/phút, bạn sẽ tối ưu hóa I/O, connection pool và hạn chế nghẽn cổ chai (bottlenecks) như thế nào?",
                    "skill_evaluated": f"{primary_match} High Concurrency & I/O",
                    "cv_evidence_context": f"Kỹ năng '{primary_match}' được ghi nhận trong CV của bạn và là yêu cầu trọng tâm trong JD của nhà tuyển dụng.",
                    "sample_star_answer": f"Tình huống: Hệ thống xử lý đơn hàng tại dự án trước bị nghẽn connection khi đạt 15,000 req/s.\nNhiệm vụ: Cần giảm độ trễ p99 từ 450ms xuống dưới 80ms mà không tốn thêm chi phí server.\nHành động: Tôi đã cấu hình lại async connection pool với {primary_match}, triển khai cache tầng nhớ Redis và tách luồng đọc/ghi cơ sở dữ liệu.\nKết quả: Giảm 65% latency p99, throughput tăng gấp 3 lần và hệ thống ổn định 99.99% uptime.",
                    "tips_for_candidate": f"Nhấn mạnh các tham số cấu hình thực tế, công cụ đo benchmark và số liệu cụ thể bạn đã đạt được với {primary_match}."
                },
                {
                    "id": "cv_q_architecture",
                    "category": "Kiến trúc hệ thống & Tích hợp",
                    "question": f"Dự án của nhà tuyển dụng đòi hỏi khả năng mở rộng với {secondary_match}. Hãy phân tích một quyết định kiến trúc khó nhất bạn từng đưa ra khi kết hợp {primary_match} và {secondary_match}?",
                    "skill_evaluated": f"System Architecture ({primary_match} + {secondary_match})",
                    "cv_evidence_context": f"Bạn đã làm việc với {secondary_match} trong các dự án trước, phù hợp với kiến trúc phân tán mà JD yêu cầu.",
                    "sample_star_answer": f"Tình huống: Cần tích hợp dịch vụ xử lý dữ liệu lớn đồng bộ giữa các microservices.\nNhiệm vụ: Đảm bảo dữ liệu không bị thất thoát khi có sự cố mạng giữa các service.\nHành động: Tôi triển khai Outbox Pattern kết hợp {secondary_match} và cơ chế retry idempotent có exponential backoff.\nKết quả: Không còn trường hợp mất dữ liệu, tự động phục hồi trong vòng 5 giây khi node khởi động lại.",
                    "tips_for_candidate": "Tập trung vào tính nhất quán dữ liệu (Data Consistency), idempotent và cách giải quyết failure modes."
                },
                {
                    "id": "cv_q_gap_bridge",
                    "category": "Kỹ năng mở rộng & Học hỏi (Skill Gap)",
                    "question": f"JD tuyển dụng có yêu cầu về {gap_skill}. Dù kỹ năng này chưa được nhấn mạnh sâu trong CV của bạn, nền tảng {primary_match} hiện tại của bạn sẽ giúp bạn tiếp cận và làm chủ {gap_skill} trong 30-60 ngày đầu như thế nào?",
                    "skill_evaluated": f"Adaptability & {gap_skill}",
                    "cv_evidence_context": f"Kỹ năng '{gap_skill}' là điểm chênh lệch (gap) giữa CV của bạn và JD. Nhà tuyển dụng sẽ thử thách khả năng tự học của bạn.",
                    "sample_star_answer": f"Tình huống: Khi công ty bắt đầu nâng cấp hạ tầng sang công nghệ mới tương tự {gap_skill}.\nNhiệm vụ: Tôi chủ động xây dựng PoC thử nghiệm trong 2 tuần trước khi áp dụng cho toàn team.\nHành động: Tận dụng hiểu biết về {primary_match} và containerization, tôi đọc kỹ RFC, viết unit test và benchmark hiệu năng.\nKết quả: Hoàn thành PoC đúng tiến độ và dẫn dắt team bàn giao dự án production thành công.",
                    "tips_for_candidate": "Đừng giấu việc mình chưa thạo; hãy thể hiện tư duy nền tảng vững vàng, tinh thần cầu tiến và phương pháp tiếp cận công nghệ mới khoa học."
                },
                {
                    "id": "cv_q_star_behavioral",
                    "category": "Tình huống thực tế & Văn hóa (STAR)",
                    "question": f"Hãy kể về một lần dự án gặp sự cố nghiêm trọng (P0 Incident) hoặc xung đột về mặt kỹ thuật giữa việc giao hàng nhanh (Velocity) và chất lượng mã nguồn (Code Quality) cho vị trí {job_title}?",
                    "skill_evaluated": "Engineering Trade-offs & Ownership",
                    "cv_evidence_context": "Vị trí Senior đòi hỏi tư duy làm chủ (ownership), khả năng thương lượng và giải quyết xung đột bằng dữ liệu.",
                    "sample_star_answer": "Tình huống: Trước ngày ra mắt sản phẩm 3 ngày, phát hiện một query gây lock bảng người dùng.\nNhiệm vụ: Quyết định hoãn release hay vá tạm thời để kịp tiến độ kinh doanh.\nHành động: Tôi họp khẩn với Product Owner, đưa ra giải pháp trung gian: áp dụng read-replica và cache tạm thời, đồng thời lên lịch refactor ngay trong sprint kế tiếp.\nKết quả: Sản phẩm ra mắt đúng ngày thành công, zero downtime, và nợ kỹ thuật được giải quyết triệt để 1 tuần sau đó.",
                    "tips_for_candidate": "Sử dụng cấu trúc STAR rõ ràng: Tình huống (S) -> Nhiệm vụ (T) -> Hành động cá nhân (A) -> Kết quả đo lường được (R)."
                }
            ]

        return {
            "job_title": job_title,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "questions": llm_questions[:num_questions],
        }

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

        # If external LLM key is configured (e.g. Google AI Studio), attempt live LLM feedback enhancement
        if self.model_gateway.api_key:
            try:
                llm_prompt = (
                    f"Question: {question}\n"
                    f"Candidate Response: {answer_text}\n"
                    "Evaluate this answer. Provide 1 concise strength, 1 specific improvement, and a 2-sentence polished model answer."
                )
                llm_raw = self.model_gateway.generate_text_sync(
                    llm_prompt,
                    system_prompt=self.STAR_EVAL_SYSTEM_PROMPT,
                    temperature=0.3,
                )
                if len(llm_raw.strip()) > 40:
                    recommended_answer = llm_raw.strip()
            except Exception:
                pass

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
