"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return <div className="min-h-screen opacity-0">{children}</div>; // Prevent hydration mismatch flash
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#131921] text-white py-3 px-4 shadow-subtle flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:ring-1 hover:ring-white p-1 rounded transition-all">
          <div className="w-8 h-8 bg-amazon rounded-sm flex items-center justify-center font-bold text-[#131921] text-xl">
            i
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight leading-tight block">IntentCart</span>
            <span className="text-[10px] text-gray-300 block -mt-1">by Amazon HackOn</span>
          </div>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-button hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>
      <div className="flex-1">
        {children}
      </div>
    </>
  );
}
