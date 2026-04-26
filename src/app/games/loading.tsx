import Image from "next/image";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-cyan-900/20 border border-cyan-500/10 ${className}`} />;
}

export default function GamesLoading() {
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

      <div className="mx-auto max-w-4xl space-y-12 mt-10 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto h-12 w-64 md:w-96" />
          <Skeleton className="mx-auto h-4 w-48 rounded-full" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
