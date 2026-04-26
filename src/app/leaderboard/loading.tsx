function Cell() {
  return <div className="h-10 animate-pulse rounded bg-[#2a2a2a]" />;
}

export default function LeaderboardLoading() {
  return (
    <main className="min-h-screen px-10 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-[#2a2a2a]" />
          <div className="mx-auto h-10 w-72 animate-pulse rounded bg-[#2a2a2a]" />
          <div className="mx-auto h-4 w-40 animate-pulse rounded bg-[#2a2a2a]" />
        </div>

        <div className="rounded-xl border border-[#333] bg-[#1a1a1a] p-5">
          <div className="mb-4 grid grid-cols-12 gap-4">
            <Cell />
            <Cell />
            <Cell />
            <Cell />
            <Cell />
            <Cell />
          </div>
          <div className="space-y-3">
            <Cell />
            <Cell />
            <Cell />
            <Cell />
            <Cell />
          </div>
        </div>
      </div>
    </main>
  );
}
