from fastapi import UploadFile
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import (
    JobAnalysisResponse,
    JobResumeMatchAssessment,
    ResumeAnalysisResponse,
    ResumeTextResponse,
)


client = TestClient(app)


def test_analyze_match_returns_structured_result(
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
            summary="AI engineering internship.",
            requirements=[
                {
                    "name": "Python programming",
                    "category": "technical",
                    "priority": "must_have",
                    "evidence": "Python programming experience",
                },
            ],
            responsibilities=[
                "Build reliable Python services",
            ],
            keywords=[
                "Python",
                "AI",
            ],
        )

    async def fake_extract_resume_text(
        file: UploadFile,
    ) -> ResumeTextResponse:
        assert file.filename == "resume.pdf"

        resume_text = (
            "Naura has Python programming and "
            "machine-learning project experience."
        )

        return ResumeTextResponse(
            filename="resume.pdf",
            page_count=1,
            character_count=len(resume_text),
            word_count=len(resume_text.split()),
            text=resume_text,
        )

    async def fake_analyze_resume_text(
        resume_text: str,
    ) -> ResumeAnalysisResponse:
        assert "Python" in resume_text

        return ResumeAnalysisResponse(
            candidate_name="Naura Ivana Ramadani",
            headline="Bachelor of Informatics Student",
            summary="Student with Python project experience.",
            skills=[
                {
                    "name": "Python",
                    "category": "programming_language",
                    "evidence": "Python programming",
                },
            ],
            education=[],
            experiences=[],
            projects=[],
            certifications=[],
            languages=[],
        )

    async def fake_assess_job_resume_match(
        job: JobAnalysisResponse,
        resume: ResumeAnalysisResponse,
    ) -> JobResumeMatchAssessment:
        assert job.job_title == "AI Engineer Intern"
        assert resume.candidate_name == "Naura Ivana Ramadani"

        return JobResumeMatchAssessment(
            overall_score=85,
            fit_level="strong",
            summary=(
                "The resume strongly matches the Python requirement."
            ),
            requirement_matches=[
                {
                    "requirement_name": "Python programming",
                    "category": "technical",
                    "priority": "must_have",
                    "status": "matched",
                    "match_score": 100,
                    "explanation": (
                        "Python is explicitly listed in the resume."
                    ),
                    "resume_evidence": [
                        "Python programming",
                    ],
                },
            ],
            strengths=[
                "Python programming experience",
            ],
            gaps=[],
            recommendations=[
                "Highlight relevant backend projects.",
            ],
        )

    monkeypatch.setattr(
        "app.main.extract_job_requirements",
        fake_extract_job_requirements,
    )
    monkeypatch.setattr(
        "app.main.extract_resume_text",
        fake_extract_resume_text,
    )
    monkeypatch.setattr(
        "app.main.analyze_resume_text",
        fake_analyze_resume_text,
    )
    monkeypatch.setattr(
        "app.main.assess_job_resume_match",
        fake_assess_job_resume_match,
    )

    job_description = (
        "CareerLens Labs is hiring an AI Engineer Intern. "
        "Candidates must have Python programming experience "
        "and basic machine-learning knowledge. The intern will "
        "build reliable Python services, evaluate LLM applications, "
        "and collaborate with product engineers."
    )

    response = client.post(
        "/api/v1/matches/analyze",
        data={
            "job_description": job_description,
        },
        files={
            "file": (
                "resume.pdf",
                b"%PDF-1.4 fake test content",
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["job"]["job_title"] == "AI Engineer Intern"
    assert body["resume"]["candidate_name"] == "Naura Ivana Ramadani"
    assert body["assessment"]["overall_score"] == 85
    assert body["assessment"]["fit_level"] == "strong"
    assert (
        body["assessment"]["requirement_matches"][0]["status"]
        == "matched"
    )


def test_analyze_match_rejects_short_description() -> None:
    response = client.post(
        "/api/v1/matches/analyze",
        data={
            "job_description": "Deskripsi terlalu pendek.",
        },
        files={
            "file": (
                "resume.pdf",
                b"%PDF-1.4 fake test content",
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 422


def test_analyze_match_requires_resume_file() -> None:
    job_description = (
        "CareerLens Labs is hiring an AI Engineer Intern. "
        "Candidates must have Python programming experience "
        "and basic machine-learning knowledge. The intern will "
        "build reliable Python services, evaluate LLM applications, "
        "and collaborate with product engineers."
    )

    response = client.post(
        "/api/v1/matches/analyze",
        data={
            "job_description": job_description,
        },
    )

    assert response.status_code == 422