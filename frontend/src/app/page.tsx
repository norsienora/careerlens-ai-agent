"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

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
      } catch (caughtError) {
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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Full-stack Generative AI Application
        </p>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          CareerLens AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          An evidence-grounded AI agent that analyzes resumes, job
          requirements, and GitHub projects without inventing experience.
        </p>

        <div className="mt-10 max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">
            Backend connection
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                isConnected
                  ? "bg-emerald-400"
                  : error
                    ? "bg-red-400"
                    : "animate-pulse bg-amber-400"
              }`}
            />

            <p className="font-medium">
              {isConnected
                ? `Connected to ${health.service}`
                : error
                  ? `Connection failed: ${error}`
                  : "Checking backend..."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}