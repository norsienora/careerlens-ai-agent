"use client";

import Link from "next/link";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { analyzeJobResumeMatch } from "@/lib/api";
import type {
  FitLevel,
  JobResumeMatchResponse,
  MatchRequirementCategory,
  MatchRequirementPriority,
  MatchStatus,
  RequirementMatch,
} from "@/types/match";

const MIN_DESCRIPTION_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 30_000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const SAMPLE_JOB_DESCRIPTION = `CareerLens Labs is hiring an AI Engineer Intern. You will build Python services, evaluate LLM applications, and collaborate with product engineers. Candidates must have Python programming experience and basic machine-learning knowledge. Experience with FastAPI, Git, Docker, or prompt engineering is preferred. Applicants must be enrolled in a computer science or related degree.`;

const statusLabels: Record<MatchStatus, string> = {
  matched: "Matched",
  partial: "Partial",
  missing: "Missing",
};

const statusStyles: Record<MatchStatus, string> = {
  matched:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  partial:
    "border-amber-400/20 bg-amber-400/10 text-amber-300",
  missing:
    "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const priorityLabels: Record<
  MatchRequirementPriority,
  string
> = {
  must_have: "Must have",
  nice_to_have: "Nice to have",
};

const categoryLabels: Record<
  MatchRequirementCategory,
  string
> = {
  technical: "Technical",
  soft_skill: "Soft skill",
  education: "Education",
  experience: "Experience",
  language: "Language",
  other: "Other",
};

const fitLabels: Record<FitLevel, string> = {
  strong: "Strong fit",
  moderate: "Moderate fit",
  limited: "Limited fit",
};

const fitStyles: Record<FitLevel, string> = {
  strong:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  moderate:
    "border-amber-400/20 bg-amber-400/10 text-amber-300",
  limited:
    "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

function RequirementCard({
  requirement,
}: {
  requirement: RequirementMatch;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xl font-semibold text-white">
            {requirement.requirement_name}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="text-slate-400">
              {categoryLabels[requirement.category]}
            </span>

            <span className="text-slate-700">•</span>

            <span className="text-slate-400">
              {priorityLabels[requirement.priority]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              statusStyles[requirement.status]
            }`}
          >
            {statusLabels[requirement.status]}
          </span>

          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
            {requirement.match_score}%
          </span>
        </div>
      </div>

      <p className="mt-5 leading-7 text-slate-300">
        {requirement.explanation}
      </p>
    </article>
  );
}

function InsightList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "strength" | "gap" | "recommendation";
}) {
  const toneStyles = {
    strength: {
      border: "border-emerald-400/20",
      bullet: "bg-emerald-400",
    },
    gap: {
      border: "border-rose-400/20",
      bullet: "bg-rose-400",
    },
    recommendation: {
      border: "border-cyan-400/20",
      bullet: "bg-cyan-400",
    },
  } as const;

  return (
    <section
      className={`rounded-3xl border bg-slate-900/60 p-6 ${
        toneStyles[tone].border
      }`}
    >
      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-4">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 leading-7 text-slate-300"
            >
              <span
                aria-hidden="true"
                className={`mt-3 h-1.5 w-1.5 shrink-0 rounded-full ${
                  toneStyles[tone].bullet
                }`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-slate-400">
          No items detected.
        </p>
      )}
    </section>
  );
}

export default function MatchPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] =
    useState<File | null>(null);
  const [result, setResult] =
    useState<JobResumeMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const normalizedLength = jobDescription.trim().length;

  const canSubmit =
    normalizedLength >= MIN_DESCRIPTION_LENGTH &&
    normalizedLength <= MAX_DESCRIPTION_LENGTH &&
    resumeFile !== null &&
    !isLoading;

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setError(null);
    setResult(null);

    if (!file) {
      setResumeFile(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setResumeFile(null);
      event.target.value = "";
      setError("File harus menggunakan format PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setResumeFile(null);
      event.target.value = "";
      setError("Ukuran PDF melebihi batas 5 MB.");
      return;
    }

    setResumeFile(file);
  }

  function useSample() {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const description = jobDescription.trim();

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      setError(
        `Deskripsi lowongan minimal ${MIN_DESCRIPTION_LENGTH} karakter.`,
      );
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(
        `Deskripsi lowongan maksimal ${MAX_DESCRIPTION_LENGTH.toLocaleString()} karakter.`,
      );
      return;
    }

    if (!resumeFile) {
      setError("Pilih file CV PDF terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const matchResult = await analyzeJobResumeMatch(
        description,
        resumeFile,
      );

      setResult(matchResult);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Terjadi kesalahan yang tidak diketahui.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
      />

      <section className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition hover:text-cyan-300"
          >
            ← Back to home
          </Link>

          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            CareerLens
            <span className="text-cyan-400"> AI</span>
          </Link>
        </nav>

        <header className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            AI job–resume matcher
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
            Measure how your resume aligns with a job.
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-400">
            Compare a job posting with a text-based PDF resume
            and receive a structured, evidence-grounded assessment.
          </p>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 lg:sticky lg:top-8"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                Match inputs
              </h2>

              <button
                type="button"
                onClick={useSample}
                className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Use sample
              </button>
            </div>

            <label
              htmlFor="job-description"
              className="mt-7 block font-semibold text-white"
            >
              Job description
            </label>

            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setResult(null);
                setError(null);
              }}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="Paste the complete job description here..."
              className="mt-3 min-h-72 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 leading-7 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            />

            <div className="mt-3 flex justify-between gap-4 text-sm text-slate-500">
              <span>
                Minimum {MIN_DESCRIPTION_LENGTH} characters
              </span>
              <span>
                {jobDescription.length.toLocaleString()} /{" "}
                {MAX_DESCRIPTION_LENGTH.toLocaleString()}
              </span>
            </div>

            <div className="mt-7">
              <p className="font-semibold text-white">
                Resume PDF
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Maximum 5 MB. Scanned PDFs are not supported.
              </p>

              <label
                htmlFor="resume-file"
                className="mt-4 flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950 p-4 transition hover:border-cyan-400"
              >
                <span className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
                  Choose PDF
                </span>

                <span className="min-w-0 truncate text-sm text-slate-300">
                  {resumeFile?.name ?? "No file selected"}
                </span>
              </label>

              <input
                id="resume-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />

              {resumeFile && (
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="break-words font-medium text-white">
                    {resumeFile.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm leading-6 text-rose-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-7 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isLoading
                ? "Analyzing match..."
                : "Analyze job–resume match"}
            </button>

            <p className="mt-5 text-sm leading-6 text-slate-500">
              The score represents document alignment, not a hiring
              probability. Uploaded PDF files are not stored.
            </p>
          </form>

          <div aria-live="polite">
            {!result ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/40 px-8 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-400/10 text-3xl text-cyan-300">
                  ✦
                </span>

                <h2 className="mt-7 text-2xl font-semibold text-white">
                  Match results will appear here
                </h2>

                <p className="mt-3 max-w-xl leading-7 text-slate-400">
                  Add a job description and resume to evaluate
                  matched, partial, and missing requirements.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7">
                  <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                        Match assessment
                      </p>

                      <h2 className="mt-3 text-3xl font-semibold text-white">
                        {result.job.job_title}
                      </h2>

                      <p className="mt-2 text-slate-400">
                        {result.job.company_name}
                      </p>

                      <div className="mt-6 border-t border-slate-800 pt-6">
                        <p className="text-sm text-slate-500">
                          Candidate
                        </p>

                        <p className="mt-1 text-xl font-semibold text-white">
                          {result.resume.candidate_name}
                        </p>

                        <p className="mt-1 text-slate-400">
                          {result.resume.headline}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className="mx-auto flex h-36 w-36 items-center justify-center rounded-full p-3"
                        style={{
                          background: `conic-gradient(#22d3ee ${
                            result.assessment.overall_score * 3.6
                          }deg, #1e293b 0deg)`,
                        }}
                      >
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950">
                          <span className="text-4xl font-bold text-white">
                            {result.assessment.overall_score}
                          </span>
                          <span className="text-sm text-slate-500">
                            out of 100
                          </span>
                        </div>
                      </div>

                      <span
                        className={`mt-4 inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${
                          fitStyles[result.assessment.fit_level]
                        }`}
                      >
                        {fitLabels[result.assessment.fit_level]}
                      </span>
                    </div>
                  </div>

                  <p className="mt-7 border-t border-slate-800 pt-6 leading-7 text-slate-300">
                    {result.assessment.summary}
                  </p>
                </section>

                <section>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-3xl font-semibold text-white">
                      Requirement alignment
                    </h2>

                    <span className="text-sm text-slate-500">
                      {
                        result.assessment.requirement_matches
                          .length
                      }{" "}
                      evaluated
                    </span>
                  </div>

                  <div className="space-y-5">
                    {result.assessment.requirement_matches.map(
                      (requirement, index) => (
                        <RequirementCard
                          key={`${requirement.requirement_name}-${index}`}
                          requirement={requirement}
                        />
                      ),
                    )}
                  </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                  <InsightList
                    title="Strengths"
                    items={result.assessment.strengths}
                    tone="strength"
                  />

                  <InsightList
                    title="Gaps"
                    items={result.assessment.gaps}
                    tone="gap"
                  />
                </div>

                <InsightList
                  title="Recommendations"
                  items={result.assessment.recommendations}
                  tone="recommendation"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}