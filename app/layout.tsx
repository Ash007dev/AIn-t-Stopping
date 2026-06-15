import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingCartButton from "@/components/FloatingCartButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazon-Intent — Shop Smarter with AI",
  description: "AI-powered shopping that understands your needs. Speak, type, or scan — we deliver in 30 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-[#0F1111]`}>
        {children}
        <FloatingCartButton />
      </body>
    </html>
  );
}
