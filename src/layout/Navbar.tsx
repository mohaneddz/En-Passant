"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Gamepad2 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Games", href: "/games", icon: Gamepad2 },
  ];

  return (
    <div className="bg-black sticky top-0 w-full flex items-center h-16 z-50 px-6 border-b border-[#333]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="w-10 h-auto"
        />
        <div className="text-white leading-tight">
          <div className="text-lg font-bold tracking-wide">EN PASSANT</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Chess Tournament
          </div>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="ml-auto flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#EAC360] text-black"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
