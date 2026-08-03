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


class RequirementMatch(BaseModel):
    requirement_name: str = Field(
        description="Name of the job requirement being evaluated.",
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
    status: Literal["matched", "partial", "missing"]
    match_score: int = Field(
        ge=0,
        le=100,
        description=(
            "Degree to which resume evidence supports this requirement. "
            "This is not a hiring probability."
        ),
    )
    explanation: str = Field(
        description=(
            "Concise explanation of why the requirement is matched, "
            "partially matched, or missing."
        ),
    )
    resume_evidence: list[str] = Field(
        description=(
            "Exact supporting phrases from the resume. "
            "Use an empty list when no supporting evidence exists."
        ),
    )


class JobResumeMatchAssessment(BaseModel):
    overall_score: int = Field(
        ge=0,
        le=100,
        description=(
            "Overall alignment between the resume and job requirements. "
            "This score is not a hiring probability."
        ),
    )
    fit_level: Literal["strong", "moderate", "limited"]
    summary: str = Field(
        description="Concise evidence-grounded summary of the overall match.",
    )
    requirement_matches: list[RequirementMatch]
    strengths: list[str] = Field(
        description="Most relevant strengths supported by the resume.",
    )
    gaps: list[str] = Field(
        description="Important job requirements with insufficient evidence.",
    )
    recommendations: list[str] = Field(
        description=(
            "Practical recommendations based only on the supplied "
            "job description and resume."
        ),
    )


class JobResumeMatchResponse(BaseModel):
    job: JobAnalysisResponse
    resume: ResumeAnalysisResponse
    assessment: JobResumeMatchAssessment