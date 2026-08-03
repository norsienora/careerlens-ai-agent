import type { ResumeAnalysisResponse } from "@/types/resume";
import type { JobAnalysisResponse } from "@/types/job";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

interface ApiErrorResponse {
  detail?: string;
}

export async function analyzeJob(
  jobDescription: string,
): Promise<JobAnalysisResponse> {
  const response = await fetch(`${API_URL}/api/v1/jobs/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_description: jobDescription,
    }),
  });

  if (!response.ok) {
    let message = `Analisis lowongan gagal (${response.status}).`;

    try {
      const error = (await response.json()) as ApiErrorResponse;

      if (error.detail) {
        message = error.detail;
      }
    } catch {
      // Gunakan pesan bawaan jika respons bukan JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as JobAnalysisResponse;
}

export async function analyzeResume(
  file: File,
): Promise<ResumeAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/v1/resumes/analyze`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    let message = `Analisis CV gagal (${response.status}).`;

    try {
      const error = (await response.json()) as ApiErrorResponse;

      if (error.detail) {
        message = error.detail;
      }
    } catch {
      // Gunakan pesan bawaan jika respons bukan JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as ResumeAnalysisResponse;
}