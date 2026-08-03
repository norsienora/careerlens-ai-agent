from fastapi.testclient import TestClient

from app.main import app
from app.schemas import JobAnalysisResponse


client = TestClient(app)


def test_analyze_job_returns_structured_result(
    monkeypatch,
) -> None:
    async def fake_extract_job_requirements(
        job_description: str,
    ) -> JobAnalysisResponse:
        assert len(job_description) >= 100

        return JobAnalysisResponse(
            job_title="AI Engineer Intern",
            company_name="CareerLens Labs",
            employment_type="internship",
            summary="Structured job analysis for testing.",
            requirements=[
                {
                    "name": "Python programming",
                    "category": "technical",
                    "priority": "must_have",
                    "evidence": "Python programming experience",
                },
            ],
            responsibilities=[
                "Build reliable Python backend services",
            ],
            keywords=[
                "Python",
                "AI",
                "Backend",
            ],
        )

    monkeypatch.setattr(
        "app.main.extract_job_requirements",
        fake_extract_job_requirements,
    )

    response = client.post(
        "/api/v1/jobs/analyze",
        json={
            "job_description": (
                "CareerLens Labs is hiring an AI Engineer Intern. "
                "Candidates must have Python programming experience "
                "and will build reliable backend services for AI "
                "products. The role includes collaborating with "
                "product engineers and evaluating AI applications."
            ),
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["job_title"] == "AI Engineer Intern"
    assert body["company_name"] == "CareerLens Labs"
    assert body["employment_type"] == "internship"
    assert body["requirements"][0]["priority"] == "must_have"
    assert body["requirements"][0]["name"] == "Python programming"


def test_analyze_job_rejects_short_description() -> None:
    response = client.post(
        "/api/v1/jobs/analyze",
        json={
            "job_description": "Deskripsi terlalu pendek.",
        },
    )

    assert response.status_code == 422