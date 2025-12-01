import type { Metadata } from "next";

import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

import "@/style/globals.css";
import "@/style/utils.css";
import "@/style/theme.css";
import "@/style/misc.css";

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
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
