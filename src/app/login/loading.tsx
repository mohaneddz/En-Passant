import Image from "next/image";

export default function LoginLoading() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
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

      <div className="w-full max-w-md space-y-4 rounded-2xl border border-cyan-500/20 bg-[#050d1e]/80 backdrop-blur-xl p-8 animate-pulse">
        <div className="mx-auto h-16 w-16 mb-4 rounded-full bg-cyan-900/20 border border-cyan-500/10" />
        <div className="h-8 w-40 mx-auto bg-cyan-900/20 rounded-lg" />
        <div className="h-12 w-full bg-cyan-900/20 rounded-xl" />
        <div className="h-12 w-full bg-cyan-900/20 rounded-xl" />
      </div>
    </main>
  );
}
