"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0a0a] opacity-0">{children}</div>;
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-bg-card border-b border-border-default px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <span className="text-text-primary font-bold text-sm">i</span>
            </div>
            <div>
              <span className="font-bold text-text-primary text-base">IntentCart</span>
              <span className="text-text-secondary text-xs ml-2 hidden sm:inline">for Amazon HackOn</span>
            </div>
          </Link>
        </div>
      </nav>
      <div className="flex-1 bg-bg-primary">{children}</div>
    </>
  );
}
