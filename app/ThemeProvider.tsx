"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen opacity-0">{children}</div>;
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#131921] border-b border-gray-100 dark:border-[#3A4553] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">i</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base">IntentCart</span>
              <span className="text-gray-400 text-xs ml-2 hidden sm:inline">for Amazon HackOn</span>
            </div>
          </Link>
        </div>
      </nav>
      <div className="flex-1">{children}</div>
    </>
  );
}
