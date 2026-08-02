import logging
from pathlib import PurePosixPath
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from app.gemini_service import extract_job_requirements
from app.resume_analysis_service import analyze_resume_text
from app.pdf_service import (
    MAX_PDF_SIZE_BYTES,
    PdfTextExtractionError,
    PdfValidationError,
    extract_text_from_pdf,
)
from app.schemas import (
    JobAnalysisRequest,
    JobAnalysisResponse,
    ResumeAnalysisResponse,
    ResumeTextResponse,
)

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


@app.post(
    "/api/v1/resumes/extract",
    response_model=ResumeTextResponse,
    tags=["resumes"],
)
async def extract_resume_text(
    file: Annotated[
        UploadFile,
        File(description="A text-based PDF resume, maximum 5 MB."),
    ],
) -> ResumeTextResponse:
    raw_filename = file.filename or "resume.pdf"
    filename = (
        PurePosixPath(raw_filename.replace("\\", "/")).name
        or "resume.pdf"
    )

    try:
        if file.content_type not in {
            "application/pdf",
            "application/x-pdf",
        }:
            raise HTTPException(
                status_code=415,
                detail="File harus menggunakan format PDF.",
            )

        pdf_bytes = await file.read(MAX_PDF_SIZE_BYTES + 1)

        if len(pdf_bytes) > MAX_PDF_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Ukuran PDF melebihi batas 5 MB.",
            )

        text, page_count = await run_in_threadpool(
            extract_text_from_pdf,
            pdf_bytes,
        )

        return ResumeTextResponse(
            filename=filename,
            page_count=page_count,
            character_count=len(text),
            word_count=len(text.split()),
            text=text,
        )
    except HTTPException:
        raise
    except PdfValidationError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error
    except PdfTextExtractionError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error
    except Exception as error:
        logger.exception("Resume text extraction failed")
        raise HTTPException(
            status_code=500,
            detail="Ekstraksi CV gagal. Periksa log backend.",
        ) from error
    finally:
        await file.close()

@app.post(
    "/api/v1/resumes/analyze",
    response_model=ResumeAnalysisResponse,
    tags=["resumes"],
)
async def analyze_resume(
    file: Annotated[
        UploadFile,
        File(
            description=(
                "A text-based PDF resume that will be analyzed "
                "using Gemini."
            ),
        ),
    ],
) -> ResumeAnalysisResponse:
    extracted_resume = await extract_resume_text(file)

    try:
        return await analyze_resume_text(extracted_resume.text)
    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error
    except Exception as error:
        logger.exception("Resume analysis failed")
        raise HTTPException(
            status_code=502,
            detail=(
                "Analisis CV gagal. Silakan coba lagi dan "
                "periksa log backend."
            ),
        ) from error