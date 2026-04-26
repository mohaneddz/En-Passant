export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#111] text-white px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#2b2b2b] bg-[#171717] p-10 text-center shadow-xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#fbbf24]">404</p>
        <h1 className="mb-4 text-4xl font-bold">Page Not Found</h1>
        <p className="mb-8 text-gray-300">
          The page you are looking for does not exist or was moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center rounded-lg bg-[#fbbf24] px-5 py-2.5 font-semibold text-black transition hover:bg-[#fcd34d]"
        >
          Go Home
        </a>
      </div>
    </main>
  );
}
