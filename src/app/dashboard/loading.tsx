import Image from "next/image";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cyan-900/10 border border-cyan-500/10 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="relative min-h-screen w-full px-6 md:px-8 py-10 overflow-hidden">
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

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up mt-16">
        <Skeleton className="h-14 w-64" />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>

        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </main>
  );
}
