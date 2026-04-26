"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <header className="bg-[#1a1a1a] border-b border-[#333] px-8 py-5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="currentColor"
            >
              <path d="M19 22H5c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2zM12 4l-1.5 5.5h-4L10 13l-1.5 5L12 15l3.5 3-1.5-5 3.5-3.5h-4L12 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">
              Admin dashboard
            </h1>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              EN PASSANT Chess Tournament
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-[#262626] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-all border border-[#333]"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
