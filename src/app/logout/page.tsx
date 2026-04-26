"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const executeLogout = async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    };

    executeLogout();
  }, [router]);

  return <div>Logging out...</div>;
}
