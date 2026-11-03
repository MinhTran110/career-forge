import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from agent_engine.agents.star_interviewer import StarInterviewerAgent


@pytest.mark.asyncio
async def test_star_interviewer_question_generation():
    agent = StarInterviewerAgent()
    questions = agent.generate_interview_questions(
        job_title="Senior AI Infrastructure Engineer",
        tech_stack=["FastAPI", "Redis", "Docker", "Kubernetes"],
        requirements=["Python", "vLLM"],
        num_questions=3,
    )

    assert len(questions) == 3
    assert "FastAPI" in questions[0]["question"] or "distributed" in questions[0]["question"]
    assert any("Architecture" in q["category"] for q in questions)
    assert any("Incident" in q["category"] or "Debugging" in q["category"] for q in questions)
    assert any("Behavioral" in q["category"] for q in questions)


@pytest.mark.asyncio
async def test_star_interviewer_evaluation():
    agent = StarInterviewerAgent()
    question = "Describe a time you designed a high-throughput backend system."

    # 1. High-performing STAR answer
    strong_answer = (
        "When I was at my previous company, our production infrastructure suffered critical bottlenecks handling holiday traffic. "
        "I was tasked with resolving the bottleneck, where the goal was to stabilize p99 latency below 100ms for 10,000 peak requests per second. "
        "I architected and implemented an asynchronous microservices pipeline using FastAPI and Redis connection pooling, by deploying optimized database indices. "
        "As a result, we reduced p99 latency by 45%, achieved 99.99% service uptime, and successfully handled 12M requests without any outage."
    )

    eval_strong = agent.evaluate_star_answer(question=question, answer_text=strong_answer)
    assert eval_strong["situation_score"] >= 75.0
    assert eval_strong["task_score"] >= 75.0
    assert eval_strong["action_score"] >= 75.0
    assert eval_strong["result_score"] >= 75.0
    assert eval_strong["overall_score"] >= 80.0
    assert len(eval_strong["strengths"]) > 0

    # 2. Vague answer lacking metrics
    weak_answer = "We just wrote some code together and fixed the bug when it came up."
    eval_weak = agent.evaluate_star_answer(question=question, answer_text=weak_answer)
    assert eval_weak["result_score"] < 60.0
    assert any("quantify" in imp.lower() for imp in eval_weak["improvements"])


@pytest.mark.asyncio
async def test_interview_api_lifecycle():
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register & login
        uid = uuid.uuid4().hex[:8]
        email = f"interviewer_{uid}@careerforge.dev"
        password = "SecurePassword123!"

        await client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": "Minh Candidate"})
        login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Interview Session
        create_res = await client.post(
            "/api/v1/interviews/session",
            headers=headers,
            json={"title": "FastAPI & Distributed Systems Mock Interview"},
        )
        assert create_res.status_code == 200, create_res.text
        sess_data = create_res.json()
        session_id = sess_data["id"]
        assert len(sess_data["questions"]) == 3
        assert sess_data["overall_score"] == 0.0

        # 3. Submit Answer to Question 0
        answer_text = (
            "When I was at our platform team, we had a critical challenge where the goal was to eliminate 500 errors during traffic spikes. "
            "I architected asynchronous task queues using Celery and Redis connection pools, achieving 35% latency reduction and handling 10k RPS."
        )
        ans_res = await client.post(
            f"/api/v1/interviews/{session_id}/answer",
            headers=headers,
            json={"question_index": 0, "answer_text": answer_text},
        )
        assert ans_res.status_code == 200, ans_res.text
        updated_session = ans_res.json()
        assert updated_session["overall_score"] > 60.0
        assert "star_evaluation" in updated_session["questions"][0]

        # 4. Fetch Scoreboard
        score_res = await client.get(f"/api/v1/interviews/{session_id}/scoreboard", headers=headers)
        assert score_res.status_code == 200
        scoreboard = score_res.json()
        assert scoreboard["session_id"] == session_id
        assert scoreboard["answered_count"] == 1
        assert "situation" in scoreboard["star_dimension_averages"]
        assert "result" in scoreboard["star_dimension_averages"]

        # 5. List Interview Sessions
        list_res = await client.get("/api/v1/interviews", headers=headers)
        assert list_res.status_code == 200
        assert any(s["id"] == session_id for s in list_res.json())
