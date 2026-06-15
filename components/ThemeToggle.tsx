// components/ThemeToggle.tsx — light/dark theme switch
'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // sync class with persisted store value on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                   hover:bg-[#F0F2F2] dark:hover:bg-white/10 transition-colors"
      >
        {mounted && isDark
          ? <Sun size={19} className="text-[#FFD814]" />
          : <Moon size={19} className="text-[#0F1111]" />}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative inline-flex items-center h-8 w-[58px] rounded-full transition-colors
                 bg-[#E3E6E6] dark:bg-[#3A3D3F] border border-[#D5D9D9]"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
                    flex items-center justify-center transition-transform
                    ${mounted && isDark ? 'translate-x-[26px]' : 'translate-x-0'}`}
      >
        {mounted && isDark
          ? <Moon size={13} className="text-[#232F3E]" />
          : <Sun size={13} className="text-[#FF9900]" />}
      </span>
    </button>
  );
}
