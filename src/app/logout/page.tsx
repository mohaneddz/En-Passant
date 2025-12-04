"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      // Check if user is signed in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.signOut();
      }
      // Redirect to dashboard regardless
      router.replace("/dashboard");
    };

    handleLogout();
  }, [router]);

  return <div>Logging out...</div>;
}
