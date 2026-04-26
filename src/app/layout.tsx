import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

import "@/style/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/* TOMO Bossa Black — copied from Olympole via scripts/copy-assets.cjs */
const tomoBossa = localFont({
  src: "../../public/fonts/TOMO Bossa Black.ttf",
  variable: "--font-tomo-bossa",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Olympole Chess",
    template: "%s | Olympole Chess",
  },
  description:
    "Olympole Chess Tournament — Mind sport inside a global cyber-stadium. Where athletics, strategy, and digital culture collide.",
  keywords: [
    "Olympole Chess",
    "chess tournament",
    "Swiss System",
    "Knockout",
    "online chess",
    "Olympole 2026",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Olympole Chess",
    title: "Olympole Chess",
    description:
      "Mind sport inside a global cyber-stadium. Where athletics, strategy, and digital culture collide.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Olympole Chess",
    description:
      "Mind sport inside a global cyber-stadium. Where athletics, strategy, and digital culture collide.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${tomoBossa.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
