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

class ResumeSkill(BaseModel):
    name: str = Field(
        description="Skill explicitly mentioned in the resume.",
    )
    category: Literal[
        "programming_language",
        "framework",
        "library",
        "tool",
        "platform",
        "database",
        "ai_ml",
        "soft_skill",
        "other",
    ]
    evidence: str = Field(
        description="Short exact phrase from the resume.",
    )


class ResumeEducation(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: str
    end_date: str
    evidence: str = Field(
        description="Short exact phrase supporting this education entry.",
    )


class ResumeExperience(BaseModel):
    organization: str
    role: str
    start_date: str
    end_date: str
    highlights: list[str]
    evidence: str = Field(
        description="Short exact phrase supporting this experience.",
    )


class ResumeProject(BaseModel):
    name: str
    description: str
    technologies: list[str]
    evidence: str = Field(
        description="Short exact phrase supporting this project.",
    )


class ResumeEvidenceItem(BaseModel):
    name: str
    evidence: str = Field(
        description="Short exact phrase from the resume.",
    )


class ResumeAnalysisResponse(BaseModel):
    candidate_name: str
    headline: str
    summary: str
    skills: list[ResumeSkill]
    education: list[ResumeEducation]
    experiences: list[ResumeExperience]
    projects: list[ResumeProject]
    certifications: list[ResumeEvidenceItem]
    languages: list[ResumeEvidenceItem]