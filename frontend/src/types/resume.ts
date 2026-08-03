export type ResumeSkillCategory =
  | "programming_language"
  | "framework"
  | "library"
  | "tool"
  | "platform"
  | "database"
  | "ai_ml"
  | "soft_skill"
  | "other";

export interface ResumeSkill {
  name: string;
  category: ResumeSkillCategory;
  evidence: string;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  evidence: string;
}

export interface ResumeExperience {
  organization: string;
  role: string;
  start_date: string;
  end_date: string;
  highlights: string[];
  evidence: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  evidence: string;
}

export interface ResumeEvidenceItem {
  name: string;
  evidence: string;
}

export interface ResumeAnalysisResponse {
  candidate_name: string;
  headline: string;
  summary: string;
  skills: ResumeSkill[];
  education: ResumeEducation[];
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  certifications: ResumeEvidenceItem[];
  languages: ResumeEvidenceItem[];
}