import Image from "next/image";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cyan-900/20 border border-cyan-500/10 ${className}`} />;
}

export default function Loading() {
  return (
    <main className="relative min-h-screen w-full p-6 md:p-10 font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/backgrounds/background.svg"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#03081c]/40" />
      </div>

      <div className="mx-auto max-w-6xl space-y-12 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center space-y-6 pt-10">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-14 w-64 md:w-96" />
          <Skeleton className="h-4 w-40 rounded-full" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <Skeleton className="h-10 w-48" />
             <div className="flex-1 h-px bg-cyan-500/10" />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
