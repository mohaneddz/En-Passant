function Box({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#2a2a2a] ${className}`} />;
}

export default function GamesLoading() {
  return (
    <main className="min-h-screen px-10 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3 text-center">
          <Box className="mx-auto h-12 w-12 rounded-full" />
          <Box className="mx-auto h-10 w-80" />
          <Box className="mx-auto h-4 w-48" />
        </div>

        <div className="space-y-4">
          <Box className="h-14 w-full" />
          <Box className="h-24 w-full" />
          <Box className="h-24 w-full" />
          <Box className="h-24 w-full" />
        </div>
      </div>
    </main>
  );
}
