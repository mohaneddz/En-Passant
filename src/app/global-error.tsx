"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-[#111] text-white px-6 py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#2b2b2b] bg-[#171717] p-10 shadow-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Application Error</p>
            <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>
            <p className="mb-6 text-gray-300">
              An unexpected error occurred while rendering the app.
            </p>
            <p className="mb-6 rounded-lg border border-[#2f2f2f] bg-[#101010] p-4 text-sm text-red-300">
              {error.message || "Unknown error"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-lg bg-[#fbbf24] px-4 py-2 font-semibold text-black transition hover:bg-[#fcd34d]"
              >
                Try Again
              </button>
              <a
                href="/"
                className="rounded-lg border border-[#353535] px-4 py-2 font-semibold text-gray-200 transition hover:bg-[#202020]"
              >
                Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
