import type { JobAnalysisResponse } from "@/types/job";
import type { ResumeAnalysisResponse } from "@/types/resume";

export type MatchRequirementCategory =
  | "technical"
  | "soft_skill"
  | "education"
  | "experience"
  | "language"
  | "other";

export type MatchRequirementPriority =
  | "must_have"
  | "nice_to_have";

export type MatchStatus =
  | "matched"
  | "partial"
  | "missing";

export type FitLevel =
  | "strong"
  | "moderate"
  | "limited";

export interface RequirementMatch {
  requirement_name: string;
  category: MatchRequirementCategory;
  priority: MatchRequirementPriority;
  status: MatchStatus;
  match_score: number;
  explanation: string;
  resume_evidence: string[];
}

export interface JobResumeMatchAssessment {
  overall_score: number;
  fit_level: FitLevel;
  summary: string;
  requirement_matches: RequirementMatch[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface JobResumeMatchResponse {
  job: JobAnalysisResponse;
  resume: ResumeAnalysisResponse;
  assessment: JobResumeMatchAssessment;
}