function Line({ className = "" }: { className?: string }) {
  return <div className={`h-4 animate-pulse rounded bg-[#2a2a2a] ${className}`} />;
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#111] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Line className="h-10 w-72" />
          <Line className="w-96" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Line className="h-40" />
          <Line className="h-40" />
          <Line className="h-40" />
        </div>
      </div>
    </main>
  );
}
