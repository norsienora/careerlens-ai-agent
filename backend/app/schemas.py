from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class JobAnalysisRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    job_description: str = Field(
        min_length=100,
        max_length=30_000,
        description="Complete text of the job description.",
    )


class JobRequirement(BaseModel):
    name: str = Field(
        description="Concise name of the requirement.",
    )
    category: Literal[
        "technical",
        "soft_skill",
        "education",
        "experience",
        "language",
        "other",
    ]
    priority: Literal["must_have", "nice_to_have"]
    evidence: str = Field(
        description="Short exact phrase from the job description.",
    )


class JobAnalysisResponse(BaseModel):
    job_title: str
    company_name: str
    employment_type: Literal[
        "internship",
        "full_time",
        "part_time",
        "contract",
        "unknown",
    ]
    summary: str
    requirements: list[JobRequirement]
    responsibilities: list[str]
    keywords: list[str]

class ResumeTextResponse(BaseModel):
    filename: str
    page_count: int = Field(ge=1)
    character_count: int = Field(ge=1)
    word_count: int = Field(ge=1)
    text: str = Field(min_length=1)