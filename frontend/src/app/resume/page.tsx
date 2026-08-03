"use client";

import Link from "next/link";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { analyzeResume } from "@/lib/api";
import type { ResumeAnalysisResponse } from "@/types/resume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function cleanDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  const cleaned = value.trim();

  if (!cleaned || cleaned.toLowerCase() === "unknown") {
    return "";
  }

  return cleaned;
}

function formatPeriod(
  startDate?: string | null,
  endDate?: string | null,
): string {
  const start = cleanDate(startDate);
  const end = cleanDate(endDate);

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start || end;
}

function SectionHeading({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        {title}
      </h2>

      {typeof count === "number" && (
        <p className="text-sm text-slate-500">
          {count} {count === 1 ? "detected" : "detected"}
        </p>
      )}
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl text-cyan-300">
        ✦
      </div>

      <h2 className="mt-7 text-2xl font-semibold text-white">
        Resume analysis will appear here
      </h2>

      <p className="mt-3 max-w-xl text-base leading-7 text-slate-400">
        Choose a PDF to generate structured information from your resume.
      </p>
    </div>
  );
}

function LoadingResult() {
  return (
    <div
      aria-live="polite"
      className="flex min-h-[480px] flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 px-8 text-center"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

      <h2 className="mt-7 text-2xl font-semibold text-white">
        Analyzing your resume
      </h2>

      <p className="mt-3 max-w-lg leading-7 text-slate-400">
        CareerLens is extracting the PDF text and generating structured
        information.
      </p>
    </div>
  );
}

export default function ResumePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] =
    useState<ResumeAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setAnalysis(null);
    setError(null);

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setError("Pilih file dengan format PDF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setError("Ukuran PDF tidak boleh melebihi 5 MB.");
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Pilih file PDF terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await analyzeResume(selectedFile);
      setAnalysis(response);
    } catch (caughtError) {
      setAnalysis(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Analisis resume gagal. Silakan coba kembali.",
      );
    } finally {
      setIsAnalyzing(false);
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

      <section className="relative mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
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

        <header className="pb-16 pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Evidence-grounded resume analyzer
          </p>

          <h1 className="mt-7 max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
            Turn your resume into structured evidence.
          </h1>

          <p className="mt-7 max-w-4xl text-lg leading-8 text-slate-400">
            Upload a text-based PDF and let Gemini identify your skills,
            education, experience, and projects without inventing information.
          </p>
        </header>

        <div className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 lg:sticky lg:top-8"
          >
            <h2 className="text-2xl font-semibold text-white">
              Resume PDF
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Maximum 5 MB and 20 pages. Scanned PDFs are not currently
              supported.
            </p>

            <div className="mt-8 flex min-h-20 items-center gap-5 rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <label
                htmlFor="resume-file"
                className="shrink-0 cursor-pointer rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Choose File
              </label>

              <input
                id="resume-file"
                name="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />

              <p className="min-w-0 truncate text-sm text-slate-300">
                {selectedFile?.name ?? "No file chosen"}
              </p>
            </div>

            {selectedFile && (
              <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-5">
                <p className="break-words font-medium text-white">
                  {selectedFile.name}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm leading-6 text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || isAnalyzing}
              className="mt-7 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isAnalyzing ? "Analyzing resume..." : "Analyze resume"}
            </button>

            <p className="mt-6 text-sm leading-6 text-slate-500">
              Privacy notice: extracted resume text is sent to Gemini for
              analysis. The PDF is not stored by this application.
            </p>
          </form>

          <div aria-live="polite">
            {isAnalyzing && <LoadingResult />}

            {!isAnalyzing && !analysis && <EmptyResult />}

            {!isAnalyzing && analysis && (
              <div className="space-y-12">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                    Candidate profile
                  </p>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {analysis.candidate_name || "Candidate"}
                  </h2>

                  {analysis.headline && (
                    <p className="mt-4 text-xl text-slate-200">
                      {analysis.headline}
                    </p>
                  )}

                  {analysis.summary && (
                    <p className="mt-6 leading-8 text-slate-400">
                      {analysis.summary}
                    </p>
                  )}
                </section>

                {analysis.skills?.length > 0 && (
                  <section>
                    <SectionHeading
                      title="Skills"
                      count={analysis.skills.length}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      {analysis.skills.map((skill, index) => (
                        <article
                          key={`${skill.name}-${index}`}
                          className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7"
                        >
                          <h3 className="text-xl font-semibold text-white">
                            {skill.name}
                          </h3>

                          <p className="mt-2 text-sm font-medium text-cyan-400">
                            {formatLabel(skill.category)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.education?.length > 0 && (
                  <section>
                    <SectionHeading title="Education" />

                    <div className="space-y-5">
                      {analysis.education.map((education, index) => {
                        const period = formatPeriod(
                          education.start_date,
                          education.end_date,
                        );

                        return (
                          <article
                            key={`${education.institution}-${index}`}
                            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8"
                          >
                            <h3 className="text-2xl font-semibold text-white">
                              {education.degree || "Education"}
                            </h3>

                            <p className="mt-3 text-lg font-medium text-cyan-400">
                              {education.institution}
                            </p>

                            {(education.field_of_study || period) && (
                              <p className="mt-3 text-slate-400">
                                {education.field_of_study}

                                {education.field_of_study && period
                                  ? " · "
                                  : ""}

                                {period}
                              </p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}

                {analysis.experiences?.length > 0 && (
                  <section>
                    <SectionHeading title="Experience" />

                    <div className="space-y-5">
                      {analysis.experiences.map((experience, index) => {
                        const period = formatPeriod(
                          experience.start_date,
                          experience.end_date,
                        );

                        return (
                          <article
                            key={`${experience.role}-${experience.organization}-${index}`}
                            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8"
                          >
                            <h3 className="text-2xl font-semibold text-white">
                              {experience.role}
                            </h3>

                            <p className="mt-3 text-lg font-medium text-cyan-400">
                              {experience.organization}
                            </p>

                            {period && (
                              <p className="mt-3 text-slate-400">
                                {period}
                              </p>
                            )}

                            {experience.highlights?.length > 0 && (
                              <ul className="mt-6 space-y-3">
                                {experience.highlights.map(
                                  (highlight, highlightIndex) => (
                                    <li
                                      key={`${highlight}-${highlightIndex}`}
                                      className="flex gap-4 leading-7 text-slate-200"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="text-cyan-400"
                                      >
                                        •
                                      </span>

                                      <span>{highlight}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}

                {analysis.projects?.length > 0 && (
                  <section>
                    <SectionHeading title="Projects" />

                    <div className="space-y-5">
                      {analysis.projects.map((project, index) => (
                        <article
                          key={`${project.name}-${index}`}
                          className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8"
                        >
                          <h3 className="text-2xl font-semibold text-white">
                            {project.name}
                          </h3>

                          {project.description && (
                            <p className="mt-5 leading-8 text-slate-300">
                              {project.description}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.certifications?.length > 0 && (
                  <section>
                    <SectionHeading title="Certifications" />

                    <div className="grid gap-5 sm:grid-cols-2">
                      {analysis.certifications.map(
                        (certification, index) => (
                          <article
                            key={`${certification.name}-${index}`}
                            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7"
                          >
                            <h3 className="text-lg font-semibold text-white">
                              {certification.name}
                            </h3>
                          </article>
                        ),
                      )}
                    </div>
                  </section>
                )}

                {analysis.languages?.length > 0 && (
                  <section>
                    <SectionHeading title="Languages" />

                    <div className="flex flex-wrap gap-3">
                      {analysis.languages.map((language, index) => (
                        <div
                          key={`${language.name}-${index}`}
                          className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 font-medium text-slate-200"
                        >
                          {language.name}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}