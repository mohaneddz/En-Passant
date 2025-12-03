import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useSignUpLogic() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAccountExists, setIsAccountExists] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsAccountExists(false);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        // Check if the error indicates the account already exists
        if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
          setIsAccountExists(true);
          setMessage("Account already exists. Please sign in instead.");
        } else {
          setMessage(error.message);
        }
      } else {
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    message,
    showPassword,
    setShowPassword,
    isAccountExists,
    handleSignUp,
  };
}
