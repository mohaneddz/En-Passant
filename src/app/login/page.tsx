"use client";
import React, { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
