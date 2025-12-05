"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useSignInLogic } from "@/hooks/useSignInLogic";

import Link from "next/link";
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
    <div className="w-full max-w-md p-8 rounded-xl border border-[#C5A059] bg-[#1A1A1A] text-white shadow-2xl mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-4">
          <Image src="/assets/logo.png" alt="Logo" width={64} height={64} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
        <p className="text-gray-400 text-sm">
          Sign in to manage the tournament
        </p>
      </div>

      <form
        onSubmit={handleSignIn}
        className="flex flex-col gap-5 w-full"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ensia.edu.dz"
              className="pl-12 bg-[#2A2A2A] border-none text-gray-200 placeholder:text-gray-600 h-12 focus-visible:ring-1 focus-visible:ring-[#C5A059]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••"
              className="pl-12 pr-10 bg-[#2A2A2A] border-none text-gray-200 placeholder:text-gray-600 h-12 focus-visible:ring-1 focus-visible:ring-[#C5A059]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <p className="text-center opacity-50">No account yet? <Link href="/signup" className="text-[#EBCB6B] hover:underline">Sign Up</Link></p>

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-[#EBCB6B] hover:bg-[#d4b55b] text-black font-bold h-12 text-lg transition-colors"
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>

        {message && (
          <div
            className={`text-sm text-center mt-2 ${
              message.includes("success") || message.includes("Logged")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
