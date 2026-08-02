"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { analyzeJob } from "@/lib/api";
import type {
  JobAnalysisResponse,
  JobRequirement,
} from "@/types/job";

const MINIMUM_DESCRIPTION_LENGTH = 100;

const SAMPLE_JOB_DESCRIPTION = `CareerLens Labs is hiring an AI Engineer Intern. You will build Python services, evaluate LLM applications, and collaborate with product engineers. Candidates must have Python programming experience and basic machine-learning knowledge. Experience with FastAPI, Git, Docker, or prompt engineering is preferred. Applicants must be enrolled in a computer science or related degree.`;

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function RequirementCard({
  requirement,
}: {
  requirement: JobRequirement;
}) {
  const isMustHave = requirement.priority === "must_have";

  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{requirement.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {formatLabel(requirement.category)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isMustHave
              ? "bg-rose-400/15 text-rose-300"
              : "bg-cyan-400/15 text-cyan-300"
          }`}
        >
          {isMustHave ? "Must have" : "Nice to have"}
        </span>
      </div>

      <p className="mt-4 border-l-2 border-slate-600 pl-3 text-sm italic text-slate-300">
        “{requirement.evidence}”
      </p>
    </article>
  );
}

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const characterCount = jobDescription.trim().length;
  const isDescriptionValid =
    characterCount >= MINIMUM_DESCRIPTION_LENGTH;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDescriptionValid) {
      setError(
        `Job description must contain at least ${MINIMUM_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeJob(jobDescription.trim());
      setResult(analysis);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function useSampleDescription() {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setError(null);
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
            <nav className="mb-10 flex items-center justify-between gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
                >
                    <span aria-hidden="true">←</span>
                    Back to home
                </Link>

                <span className="text-sm font-bold tracking-tight text-white">
                    CareerLens <span className="text-cyan-400">AI</span>
                </span>
            </nav>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                AI job analyzer
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                Understand what a job posting actually requires.
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
                Paste a complete job description and let the AI extract its
                requirements, responsibilities, and important keywords.
            </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-950/20 lg:sticky lg:top-8"
          >
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="job-description"
                className="font-semibold text-white"
              >
                Job description
              </label>

              <button
                type="button"
                onClick={useSampleDescription}
                className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Use sample
              </button>
            </div>

            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              minLength={MINIMUM_DESCRIPTION_LENGTH}
              maxLength={30_000}
              rows={16}
              placeholder="Paste the complete job description here..."
              className="mt-4 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 p-4 leading-7 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
            />

            <div className="mt-3 flex items-center justify-between text-sm">
              <p
                className={
                  characterCount > 0 && !isDescriptionValid
                    ? "text-amber-300"
                    : "text-slate-500"
                }
              >
                Minimum {MINIMUM_DESCRIPTION_LENGTH} characters
              </p>

              <p className="text-slate-500">
                {characterCount.toLocaleString()} / 30,000
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isDescriptionValid || isLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              )}

              {isLoading ? "Analyzing job..." : "Analyze job"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              AI-generated results should be verified against the original
              posting.
            </p>
          </form>

          <section aria-live="polite">
            {!result && !isLoading && (
              <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl text-cyan-300">
                    ✦
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-white">
                    Analysis results will appear here
                  </h2>

                  <p className="mt-2 max-w-md text-slate-400">
                    The AI will return structured information supported by
                    evidence from the original posting.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex min-h-96 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 p-10">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
                  <p className="mt-5 font-medium text-slate-300">
                    CareerLens is reading the job posting...
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-cyan-400">
                        {result.company_name}
                      </p>
                      <h2 className="mt-1 text-3xl font-bold text-white">
                        {result.job_title}
                      </h2>
                    </div>

                    <span className="rounded-full bg-violet-400/15 px-4 py-2 text-sm font-medium text-violet-300">
                      {formatLabel(result.employment_type)}
                    </span>
                  </div>

                  <p className="mt-5 leading-7 text-slate-300">
                    {result.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {result.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </article>

                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      Requirements
                    </h2>

                    <span className="text-sm text-slate-500">
                      {result.requirements.length} detected
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {result.requirements.map((requirement, index) => (
                      <RequirementCard
                        key={`${requirement.name}-${index}`}
                        requirement={requirement}
                      />
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                  <h2 className="text-xl font-semibold text-white">
                    Responsibilities
                  </h2>

                  <ul className="mt-4 space-y-3">
                    {result.responsibilities.map(
                      (responsibility, index) => (
                        <li
                          key={`${responsibility}-${index}`}
                          className="flex gap-3 leading-7 text-slate-300"
                        >
                          <span className="text-cyan-400">•</span>
                          <span>{responsibility}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </section>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}