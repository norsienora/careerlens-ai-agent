"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

const pipelineFeatures = [
  "Job requirement extraction",
  "Resume PDF text extraction",
  "Evidence-grounded resume analysis",
  "Structured Gemini output",
];

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
        }

        const response = await fetch(`${apiUrl}/health`);

        if (!response.ok) {
          throw new Error(`Backend mengembalikan HTTP ${response.status}.`);
        }

        const data: HealthResponse = await response.json();

        setHealth(data);
        setError(null);
      } catch (caughtError) {
        setHealth(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Terjadi kesalahan yang tidak diketahui.",
        );
      }
    }

    void checkBackend();
  }, []);

  const isConnected = health?.status === "ok";

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

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-8">
        <nav className="flex items-center">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            CareerLens
            <span className="text-cyan-400"> AI</span>
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Full-stack Generative AI Application
            </p>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
              Turn career documents into
              <span className="text-cyan-300"> actionable evidence.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              CareerLens AI analyzes job postings and resumes, extracts
              structured facts, and shows the source evidence behind every
              result without inventing experience.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Analyze a job
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/resume"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-700 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-cyan-400 hover:bg-slate-900 hover:text-cyan-300"
              >
                Analyze a resume
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <h2 className="font-semibold text-white">Job intelligence</h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Requirements and priority detection
                </p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <h2 className="font-semibold text-white">
                  Resume intelligence
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Structured facts supported by evidence
                </p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <h2 className="font-semibold text-white">
                  Privacy conscious
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Uploaded PDF files are not stored
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  CareerLens system
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-white">
                  AI career analysis pipeline
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                MVP
              </span>
            </div>

            <div className="mt-7 space-y-4">
              {pipelineFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-300">
                    ✓
                  </span>

                  <span className="text-sm font-medium text-slate-200">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div
              aria-live="polite"
              className="mt-7 rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <p className="text-sm font-medium text-slate-400">
                Backend connection
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    isConnected
                      ? "bg-emerald-400"
                      : error
                        ? "bg-red-400"
                        : "animate-pulse bg-amber-400"
                  }`}
                />

                <p className="break-words text-sm font-medium">
                  {isConnected
                    ? `Connected to ${health?.service ?? "backend"}`
                    : error
                      ? `Connection failed: ${error}`
                      : "Checking backend..."}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="border-t border-slate-900 py-5 text-sm text-slate-500">
          Built with Next.js, FastAPI, and Gemini.
        </footer>
      </section>
    </main>
  );
}