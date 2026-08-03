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

function formatCategory(category: string) {
  return category
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function EvidenceQuote({ evidence }: { evidence: string }) {
  return (
    <blockquote className="mt-3 border-l-2 border-slate-600 pl-3 text-sm italic leading-6 text-slate-400">
      &ldquo;{evidence}&rdquo;
    </blockquote>
  );
}

function ResumeResults({
  result,
}: {
  result: ResumeAnalysisResponse;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Candidate profile
        </p>

        <h2 className="mt-3 text-3xl font-bold">
          {result.candidate_name}
        </h2>

        <p className="mt-2 text-lg text-slate-300">
          {result.headline}
        </p>

        <p className="mt-5 leading-7 text-slate-400">
          {result.summary}
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Skills</h2>
          <p className="text-sm text-slate-500">
            {result.skills.length} detected
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {result.skills.map((skill, index) => (
            <article
              key={`${skill.name}-${index}`}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <h3 className="font-semibold text-slate-100">
                {skill.name}
              </h3>

              <p className="mt-1 text-sm text-cyan-400">
                {formatCategory(skill.category)}
              </p>

              <EvidenceQuote evidence={skill.evidence} />
            </article>
          ))}
        </div>
      </section>

      {result.education.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Education</h2>

          <div className="space-y-4">
            {result.education.map((education, index) => (
              <article
                key={`${education.institution}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="text-lg font-semibold">
                  {education.degree}
                </h3>

                <p className="mt-1 text-cyan-400">
                  {education.institution}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {education.field_of_study} ·{" "}
                  {education.start_date} – {education.end_date}
                </p>

                <EvidenceQuote evidence={education.evidence} />
              </article>
            ))}
          </div>
        </section>
      )}

      {result.experiences.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Experience
          </h2>

          <div className="space-y-4">
            {result.experiences.map((experience, index) => (
              <article
                key={`${experience.organization}-${experience.role}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="text-lg font-semibold">
                  {experience.role}
                </h3>

                <p className="mt-1 text-cyan-400">
                  {experience.organization}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {experience.start_date} – {experience.end_date}
                </p>

                {experience.highlights.length > 0 && (
                  <ul className="mt-4 space-y-2 text-slate-300">
                    {experience.highlights.map(
                      (highlight, highlightIndex) => (
                        <li
                          key={highlightIndex}
                          className="flex gap-3"
                        >
                          <span className="text-cyan-400">•</span>
                          <span>{highlight}</span>
                        </li>
                      ),
                    )}
                  </ul>
                )}

                <EvidenceQuote evidence={experience.evidence} />
              </article>
            ))}
          </div>
        </section>
      )}

      {result.projects.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Projects</h2>

          <div className="space-y-4">
            {result.projects.map((project, index) => (
              <article
                key={`${project.name}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="text-lg font-semibold">
                  {project.name}
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map(
                    (technology, technologyIndex) => (
                      <span
                        key={`${technology}-${technologyIndex}`}
                        className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300"
                      >
                        {technology}
                      </span>
                    ),
                  )}
                </div>

                <EvidenceQuote evidence={project.evidence} />
              </article>
            ))}
          </div>
        </section>
      )}

      {(result.certifications.length > 0 ||
        result.languages.length > 0) && (
        <section className="grid gap-5 md:grid-cols-2">
          {result.certifications.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">
                Certifications
              </h2>

              <div className="mt-4 space-y-4">
                {result.certifications.map(
                  (certification, index) => (
                    <div key={`${certification.name}-${index}`}>
                      <p className="font-medium">
                        {certification.name}
                      </p>
                      <EvidenceQuote
                        evidence={certification.evidence}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {result.languages.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">Languages</h2>

              <div className="mt-4 space-y-4">
                {result.languages.map((language, index) => (
                  <div key={`${language.name}-${index}`}>
                    <p className="font-medium">
                      {language.name}
                    </p>
                    <EvidenceQuote evidence={language.evidence} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] =
    useState<ResumeAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0] ?? null;

    setResult(null);
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      event.target.value = "";
      setFile(null);
      setError("Please choose a PDF file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      event.target.value = "";
      setFile(null);
      setError("The PDF must be no larger than 5 MB.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!file) {
      setError("Please choose a resume PDF first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeResume(file);
      setResult(analysis);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-slate-400 transition hover:text-cyan-400"
          >
            ← Back to home
          </Link>

          <p className="font-bold">
            CareerLens <span className="text-cyan-400">AI</span>
          </p>
        </header>

        <div className="mt-14 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Evidence-grounded resume analyzer
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            Turn your resume into structured evidence.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Upload a text-based PDF and let Gemini identify your
            skills, education, experience, and projects without
            inventing information.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-7 lg:sticky lg:top-8"
          >
            <label
              htmlFor="resume"
              className="text-lg font-semibold"
            >
              Resume PDF
            </label>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Maximum 5 MB and 20 pages. Scanned PDFs are not
              currently supported.
            </p>

            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="mt-6 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-300"
            />

            {file && (
              <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
                <p className="font-medium">{file.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || isLoading}
              className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isLoading ? "Analyzing resume..." : "Analyze resume"}
            </button>

            <p className="mt-5 text-sm leading-6 text-slate-500">
              Privacy notice: extracted resume text is sent to
              Gemini for analysis. The PDF is not stored by this
              application.
            </p>
          </form>

          <div aria-live="polite">
            {isLoading ? (
              <div className="rounded-3xl border border-cyan-900 bg-slate-900 p-10 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
                <h2 className="mt-5 text-xl font-bold">
                  Analyzing your resume
                </h2>
                <p className="mt-2 text-slate-400">
                  Extracting structured evidence with Gemini...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-900 bg-red-950/30 p-7 text-red-200">
                <h2 className="font-bold">Analysis failed</h2>
                <p className="mt-2">{error}</p>
              </div>
            ) : result ? (
              <ResumeResults result={result} />
            ) : (
              <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 p-10 text-center">
                <div className="rounded-2xl bg-cyan-950 p-4 text-2xl text-cyan-400">
                  ✦
                </div>
                <h2 className="mt-5 text-xl font-bold">
                  Resume analysis will appear here
                </h2>
                <p className="mt-2 max-w-md leading-7 text-slate-400">
                  Choose a PDF to generate structured information
                  supported by evidence from the resume.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}