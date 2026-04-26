export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#2f2f2f] bg-[#141414] p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-[#2a2a2a]" />
        <div className="h-10 animate-pulse rounded bg-[#2a2a2a]" />
        <div className="h-10 animate-pulse rounded bg-[#2a2a2a]" />
        <div className="h-10 animate-pulse rounded bg-[#2a2a2a]" />
      </div>
    </main>
  );
}
