"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else {
        // If signUp returned a session (password sign-up without confirm),
        // persist it to HTTP-only cookies on the server so middleware can read it.
        const session = data?.session;
        if (session?.access_token && session?.refresh_token) {
          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          });
        }

        setMessage("Check your email to confirm your account.");
      }
    } catch (err: any) {
      setMessage(err?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Email</span>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Password</span>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create account"}
      </Button>

      {message && (
        <div
          className={`text-sm ${
            message.includes("Check") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
