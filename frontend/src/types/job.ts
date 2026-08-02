export type EmploymentType =
  | "internship"
  | "full_time"
  | "part_time"
  | "contract"
  | "unknown";

export type RequirementCategory =
  | "technical"
  | "soft_skill"
  | "education"
  | "experience"
  | "language"
  | "other";

export type RequirementPriority = "must_have" | "nice_to_have";

export interface JobRequirement {
  name: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  evidence: string;
}

export interface JobAnalysisResponse {
  job_title: string;
  company_name: string;
  employment_type: EmploymentType;
  summary: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  keywords: string[];
}