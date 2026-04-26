import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="relative min-h-[80vh] w-full flex items-center justify-center p-6 font-sans overflow-hidden">
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

      <div className="mx-auto max-w-2xl w-full rounded-2xl border border-cyan-500/20 bg-[#050d1e]/80 backdrop-blur-xl p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up">
        <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-[#00e5ff] drop-shadow-glow">404 ERROR</p>
        <h1 className="mb-6 text-5xl font-black tracking-tighter uppercase text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Page Not Found
        </h1>
        <p className="mb-10 text-cyan-500/60 font-medium">
          The mind sport you are looking for has been moved or does not exist in this stadium.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center px-10 py-4 rounded-full text-sm font-black tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 bg-[#00e5ff] text-[#050d1e] shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]"
        >
          Return to Arena
        </Link>
      </div>
    </main>
  );
}
