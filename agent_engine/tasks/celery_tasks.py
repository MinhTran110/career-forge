import os

from celery import Celery

REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")

celery_app = Celery("careerforge_tasks", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="tasks.run_job_discovery")
def run_job_discovery(candidate_id: str):
    from agent_engine.workflows.job_discovery_flow import JobDiscoveryFlow
    flow = JobDiscoveryFlow()
    return flow.execute(candidate_id)


@celery_app.task(name="tasks.run_application_tailor")
def run_application_tailor(candidate_id: str, job_id: str):
    from agent_engine.workflows.application_tailor_flow import ApplicationTailorFlow
    flow = ApplicationTailorFlow()
    return flow.execute(candidate_id, job_id)


@celery_app.task(name="tasks.evaluate_interview_audio")
def evaluate_interview_audio(session_id: str, transcript: str):
    from agent_engine.workflows.interview_session_flow import InterviewSessionFlow
    flow = InterviewSessionFlow()
    return flow.execute(session_id, transcript)
