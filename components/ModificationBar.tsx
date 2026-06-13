"use client";
import { useState } from "react";
import { CartDiff } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import HintChip from "./HintChip";
import VoiceButton from "./VoiceButton";

const HINTS = [
  "Make it vegetarian",
  "Add 2 more people",
  "Remove soft drinks",
  "Add more snacks",
  "Switch to healthier options",
];

interface ModificationBarProps {
  onApplyDiff: (diff: CartDiff) => void;
}

export default function ModificationBar({ onApplyDiff }: ModificationBarProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cart = useAppStore((s) => s.cart);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch("/api/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modificationText: text, currentCart: cart }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Modification failed");
        return;
      }

      const diff: CartDiff = await res.json();
      onApplyDiff(diff);
      setText("");
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Request timed out. Try again.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amazon-background-light dark:bg-[#131921] border-t border-amazon-border-light dark:border-amazon-border-dark shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {/* Hint chips */}
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide bg-[#F7F8FA] dark:bg-[#1E2530] border-b border-[#E3E6E6] dark:border-[#3A4553]">
        <span className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark whitespace-nowrap self-center mr-2">
          Suggestions:
        </span>
        {HINTS.map((hint) => (
          <HintChip key={hint} label={hint} onClick={() => setText(hint)} />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-[#FDF4F4] dark:bg-[#3B1D1D] border-b border-[#F5CACA] dark:border-[#5C2B2B]">
          <p className="text-sm text-[#C40000] dark:text-[#FF6B6B] font-medium flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 py-3 max-w-5xl mx-auto">
        <VoiceButton onTranscript={(t) => setText(t)} />
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Search to add or type instructions to modify cart..."
            className="w-full pl-4 pr-12 py-2.5 rounded-l-md border border-[#8D98A6] focus:outline-none focus:ring-2 focus:ring-amazon focus:border-transparent bg-white dark:bg-amazon-background-dark text-amazon-text-primary-light dark:text-amazon-text-primary-dark placeholder-[#767676] dark:placeholder-[#AAB7B8] text-sm shadow-inner"
            maxLength={300}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="px-5 py-2.5 rounded-r-md bg-[#FEBD69] hover:bg-[#F3A847] text-[#0F1111] border border-[#8D98A6] border-l-0 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5 text-[#0F1111]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="20" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
