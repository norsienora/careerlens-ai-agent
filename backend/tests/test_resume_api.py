from fastapi import UploadFile
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import ResumeAnalysisResponse, ResumeTextResponse


client = TestClient(app)


def test_analyze_resume_returns_structured_result(
    monkeypatch,
) -> None:
    async def fake_extract_resume_text(
        file: UploadFile,
    ) -> ResumeTextResponse:
        assert file.filename == "resume.pdf"

        resume_text = (
            "Naura is an Informatics student with Python "
            "and machine-learning project experience."
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
            summary="Informatics student with Python experience.",
            skills=[
                {
                    "name": "Python",
                    "category": "programming_language",
                    "evidence": "Python",
                },
            ],
            education=[],
            experiences=[],
            projects=[],
            certifications=[],
            languages=[],
        )

    monkeypatch.setattr(
        "app.main.extract_resume_text",
        fake_extract_resume_text,
    )
    monkeypatch.setattr(
        "app.main.analyze_resume_text",
        fake_analyze_resume_text,
    )

    response = client.post(
        "/api/v1/resumes/analyze",
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

    assert body["candidate_name"] == "Naura Ivana Ramadani"
    assert body["headline"] == "Bachelor of Informatics Student"
    assert body["skills"][0]["name"] == "Python"
    assert body["skills"][0]["category"] == "programming_language"


def test_analyze_resume_requires_file() -> None:
    response = client.post("/api/v1/resumes/analyze")

    assert response.status_code == 422