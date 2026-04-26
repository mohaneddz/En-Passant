"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050d1e]">
        <main className="relative min-h-screen w-full flex items-center justify-center p-6 font-sans overflow-hidden">
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

          <div className="mx-auto max-w-2xl w-full rounded-2xl border border-red-500/20 bg-[#050d1e]/80 backdrop-blur-xl p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
            </div>
            
            <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-red-500">APPLICATION ERROR</p>
            <h1 className="mb-4 text-4xl font-black tracking-tighter uppercase text-white">
              Critical Arena Failure
            </h1>
            <p className="mb-8 text-red-100/60 font-medium">
              The entire digital environment has encountered a fatal error.
            </p>

            <div className="mb-10 text-left overflow-hidden">
                <div className="text-[10px] uppercase font-black tracking-widest text-red-500/50 mb-2">Technical Details:</div>
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs font-mono text-red-200/80 break-words">
                    {error.message || "A critical unhandled exception occurred."}
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center px-10 py-3.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                    Reload System
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-10 py-3.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 border border-cyan-500/40 text-cyan-400 bg-cyan-500/5"
                >
                    Return to Arena
                </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
