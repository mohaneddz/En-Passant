"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";

const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#071034]/70 backdrop-blur-xl border-b border-cyan-500/20 px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 shadow-inner">
             <Image src="/images/brand/esc.webp" alt="ESCC" width={32} height={32} className="drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
          </div>
          <div>
            <h1 className="text-white text-xl font-black  uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Arena
            </h1>
            <p className="text-cyan-500/40 text-[10px] font-black uppercase tracking-[0.2em]">
              Olympole Chess Control 2026
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00e5ff] text-xs font-black tracking-widest uppercase rounded-xl transition-all border border-cyan-500/20 hover:border-cyan-500/40"
        >
          <LogOut size={16} strokeWidth={3} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
