"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useSignInLogic } from "@/hooks/useSignInLogic";
import Image from "next/image";

export default function SignInForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    message,
    showPassword,
    setShowPassword,
    handleSignIn,
  } = useSignInLogic();

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-cyan-500/20 bg-[#050d1e]/80 backdrop-blur-xl text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6 relative">
          <Image 
            src="/images/brand/esc.webp" 
            alt="ESCC Logo" 
            width={72} 
            height={72} 
            className="drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          />
          <div className="absolute -inset-4 bg-cyan-500/10 blur-xl rounded-full -z-10" />
        </div>
        <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-3xl font-black  uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Admin Arena
            </h1>
        </div>
        <p className="text-cyan-500/50 text-xs font-bold tracking-widest uppercase">Authorized Access Only</p>
      </div>

      <form onSubmit={handleSignIn} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black tracking-widest uppercase text-cyan-500/60 ml-1">Admin Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/40 h-5 w-5 group-focus-within:text-cyan-400 transition-colors" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ensia.edu.dz"
              className="pl-12 bg-cyan-900/10 border-cyan-500/10 focus:border-cyan-500/40 focus:bg-cyan-900/20 text-white placeholder:text-cyan-900 h-14 rounded-xl transition-all outline-none ring-0 focus:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black tracking-widest uppercase text-cyan-500/60 ml-1">Shared Credentials</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/40 h-5 w-5 group-focus-within:text-cyan-400 transition-colors" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="pl-12 pr-12 bg-cyan-900/10 border-cyan-500/10 focus:border-cyan-500/40 focus:bg-cyan-900/20 text-white placeholder:text-cyan-900 h-14 rounded-xl transition-all outline-none ring-0 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500/30 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-[#050d1e] font-black tracking-widest uppercase h-14 text-sm rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] active:scale-[0.98]"
        >
          {loading ? "Decrypting..." : "Enter Portal"}
        </Button>

        {message && (
          <div className="text-[10px] font-bold text-center mt-2 text-red-400 uppercase tracking-widest animate-pulse">{message}</div>
        )}
      </form>
    </div>
  );
}
