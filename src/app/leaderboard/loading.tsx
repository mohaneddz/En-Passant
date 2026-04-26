import Image from "next/image";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cyan-900/20 border border-cyan-500/10 ${className}`} />;
}

export default function LeaderboardLoading() {
  return (
    <main className="relative min-h-screen w-full px-6 py-10 text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/backgrounds/background.svg"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#03081c]/60" />
      </div>

      <div className="mx-auto max-w-5xl space-y-12 mt-10 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto h-12 w-64 md:w-80" />
          <Skeleton className="mx-auto h-4 w-40 rounded-full" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[#050d1e]/80 backdrop-blur-xl overflow-hidden">
          <div className="h-14 bg-cyan-500/5 border-b border-cyan-500/10 w-full" />
          <div className="divide-y divide-cyan-500/5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-12" />
                <Skeleton className="h-10 flex-1 max-w-xs" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-16 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
