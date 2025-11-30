"use client";
import React from "react";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        <h2 style={{ marginBottom: 12 }}>Sign up</h2>
        <SignUpForm />
      </div>
    </main>
  );
}
