"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { analyzeJob } from "@/lib/api";
import type { JobAnalysisResponse } from "@/types/job";

const MIN_DESCRIPTION_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 30_000;

const SAMPLE_JOB_DESCRIPTION = `CareerLens Labs is hiring an AI Engineer Intern. You will build Python services, evaluate LLM applications, and collaborate with product engineers. Candidates must have Python programming experience and basic machine-learning knowledge. Experience with FastAPI, Git, Docker, or prompt engineering is preferred. Applicants must be enrolled in a computer science or related degree.`;

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function EmptyResult() {
  return (
    <div className="flex min-h-[34rem] items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/30 px-6 text-center">
      <div className="max-w-lg">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl text-cyan-300">
          ✦
        </span>

        <h2 className="mt-7 text-2xl font-semibold text-white">
          Analysis results will appear here
        </h2>

        <p className="mt-3 leading-7 text-slate-400">
          The AI will return structured information about the job posting,
          including requirements, priorities, keywords, and responsibilities.
        </p>
      </div>
    </div>
  );
}

function LoadingResult() {
  return (
    <div
      role="status"
      className="flex min-h-[34rem] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/50 px-6 text-center"
    >
      <div>
        <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

        <h2 className="mt-6 text-2xl font-semibold text-white">
          Analyzing job posting
        </h2>

        <p className="mt-3 text-slate-400">
          Gemini is extracting structured requirements and responsibilities.
        </p>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] =
    useState<JobAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const trimmedDescription = jobDescription.trim();
  const characterCount = jobDescription.length;

  const isDescriptionValid =
    trimmedDescription.length >= MIN_DESCRIPTION_LENGTH &&
    characterCount <= MAX_DESCRIPTION_LENGTH;

  function handleUseSample() {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setAnalysis(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
      setError(
        `Job description must contain at least ${MIN_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }

    if (characterCount > MAX_DESCRIPTION_LENGTH) {
      setError(
        `Job description cannot exceed ${MAX_DESCRIPTION_LENGTH.toLocaleString()} characters.`,
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeJob(trimmedDescription);
      setAnalysis(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred while analyzing the job.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
      />

      <section className="relative mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition hover:text-cyan-300 sm:text-base"
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

        <header className="mt-16 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            AI Job Analyzer
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Understand what a job posting actually requires.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400 sm:text-xl">
            Paste a complete job description and let the AI extract its
            requirements, responsibilities, and important keywords.
          </p>
        </header>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-[0.88fr_1.12fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 lg:sticky lg:top-8"
          >
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="job-description"
                className="text-lg font-semibold text-white"
              >
                Job description
              </label>

              <button
                type="button"
                onClick={handleUseSample}
                disabled={isAnalyzing}
                className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Use sample
              </button>
            </div>

            <textarea
              id="job-description"
              name="job-description"
              value={jobDescription}
              maxLength={MAX_DESCRIPTION_LENGTH}
              disabled={isAnalyzing}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setError(null);
              }}
              placeholder="Paste the complete job description here..."
              className="mt-6 min-h-[26rem] w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 px-5 py-5 text-base leading-8 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-500">
              <span>Minimum {MIN_DESCRIPTION_LENGTH} characters</span>

              <span>
                {characterCount.toLocaleString()} /{" "}
                {MAX_DESCRIPTION_LENGTH.toLocaleString()}
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isDescriptionValid || isAnalyzing}
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isAnalyzing ? "Analyzing job..." : "Analyze job"}
            </button>

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              AI-generated results should be verified against the original job
              posting.
            </p>
          </form>

          <div aria-live="polite" className="min-w-0">
            {isAnalyzing ? (
              <LoadingResult />
            ) : analysis ? (
              <div className="space-y-10">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-cyan-400">
                        {analysis.company_name || "Company not specified"}
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                        {analysis.job_title || "Untitled position"}
                      </h2>
                    </div>

                    <span className="w-fit rounded-full bg-violet-400/15 px-4 py-2 text-sm font-semibold text-violet-300">
                      {formatLabel(analysis.employment_type)}
                    </span>
                  </div>

                  <p className="mt-7 text-base leading-8 text-slate-300 sm:text-lg">
                    {analysis.summary}
                  </p>

                  {analysis.keywords.length > 0 && (
                    <div className="mt-7 flex flex-wrap gap-3">
                      {analysis.keywords.map((keyword, index) => (
                        <span
                          key={`${keyword}-${index}`}
                          className="rounded-full border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm text-slate-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold text-white">
                      Requirements
                    </h2>

                    <span className="text-sm text-slate-500">
                      {analysis.requirements.length} detected
                    </span>
                  </div>

                  {analysis.requirements.length > 0 ? (
                    <div className="space-y-5">
                      {analysis.requirements.map((requirement, index) => {
                        const isMustHave =
                          requirement.priority === "must_have";

                        return (
                          <article
                            key={`${requirement.name}-${index}`}
                            className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 sm:p-7"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-white">
                                  {requirement.name}
                                </h3>

                                <p className="mt-2 text-sm font-medium text-cyan-400">
                                  {formatLabel(requirement.category)}
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${
                                  isMustHave
                                    ? "bg-rose-400/15 text-rose-300"
                                    : "bg-cyan-400/15 text-cyan-300"
                                }`}
                              >
                                {isMustHave ? "Must have" : "Nice to have"}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-7 text-slate-400">
                      No explicit requirements were detected.
                    </div>
                  )}
                </section>

                {analysis.responsibilities.length > 0 && (
                  <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
                    <h2 className="text-3xl font-bold text-white">
                      Responsibilities
                    </h2>

                    <ul className="mt-6 space-y-4">
                      {analysis.responsibilities.map(
                        (responsibility, index) => (
                          <li
                            key={`${responsibility}-${index}`}
                            className="flex items-start gap-4 text-slate-300"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 text-cyan-400"
                            >
                              •
                            </span>

                            <span className="leading-7">
                              {responsibility}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </section>
                )}
              </div>
            ) : (
              <EmptyResult />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}