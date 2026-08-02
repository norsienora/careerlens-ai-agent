import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.gemini_service import extract_job_requirements
from app.schemas import JobAnalysisRequest, JobAnalysisResponse

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CareerLens AI API",
    description="Backend API for the CareerLens AI agent.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "careerlens-api",
    }


@app.post(
    "/api/v1/jobs/analyze",
    response_model=JobAnalysisResponse,
    tags=["jobs"],
)
async def analyze_job(
    payload: JobAnalysisRequest,
) -> JobAnalysisResponse:
    try:
        return await extract_job_requirements(payload.job_description)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        logger.exception("Job analysis failed")
        raise HTTPException(
            status_code=502,
            detail="Job analysis failed. Check the backend logs.",
        ) from error