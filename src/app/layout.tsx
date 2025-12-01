import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Lexend_Deca } from "next/font/google";

import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

import "@/style/globals.css";
import "@/style/utils.css";
import "@/style/theme.css";
import "@/style/misc.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Main Page",
  description: "My Template for Next.js Projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lexendDeca.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
