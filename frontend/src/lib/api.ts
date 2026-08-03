import type { JobAnalysisResponse } from "@/types/job";
import type { JobResumeMatchResponse } from "@/types/match";
import type { ResumeAnalysisResponse } from "@/types/resume";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

interface ApiValidationError {
  msg?: string;
}

interface ApiErrorResponse {
  detail?: string | ApiValidationError[];
}

async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const error = (await response.json()) as ApiErrorResponse;

    if (typeof error.detail === "string") {
      return error.detail;
    }

    if (Array.isArray(error.detail)) {
      const messages = error.detail
        .map((item) => item.msg)
        .filter((message): message is string => Boolean(message));

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  } catch {
    // Gunakan pesan bawaan jika respons bukan JSON.
  }

  return fallbackMessage;
}

export async function analyzeJob(
  jobDescription: string,
): Promise<JobAnalysisResponse> {
  const response = await fetch(
    `${API_URL}/api/v1/jobs/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_description: jobDescription,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Analisis lowongan gagal (${response.status}).`,
      ),
    );
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
    throw new Error(
      await readErrorMessage(
        response,
        `Analisis CV gagal (${response.status}).`,
      ),
    );
  }

  return (await response.json()) as ResumeAnalysisResponse;
}

export async function analyzeJobResumeMatch(
  jobDescription: string,
  file: File,
): Promise<JobResumeMatchResponse> {
  const formData = new FormData();

  formData.append("job_description", jobDescription);
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/v1/matches/analyze`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Pencocokan CV dan lowongan gagal (${response.status}).`,
      ),
    );
  }

  return (await response.json()) as JobResumeMatchResponse;
}