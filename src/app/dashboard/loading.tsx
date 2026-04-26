function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#2a2a2a] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#111] px-8 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Block className="h-12 w-64" />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Block className="h-24" />
          <Block className="h-24" />
          <Block className="h-24" />
          <Block className="h-24" />
        </div>

        <Block className="h-14 w-full" />
        <Block className="h-20 w-full" />
        <Block className="h-20 w-full" />
        <Block className="h-20 w-full" />
      </div>
    </main>
  );
}
