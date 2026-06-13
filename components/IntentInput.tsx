"use client";
import { useState } from "react";

interface IntentInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled: boolean;
}

export default function IntentInput({ value, onChange, onSubmit, placeholder, disabled }: IntentInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!value.trim()) {
      setError("Please describe what you're looking for.");
      return;
    }
    setError(null);
    onSubmit();
  };

  return (
    <div className="w-full">
      <div className="relative border-2 border-amazon-border-light dark:border-amazon-border-dark rounded-input bg-white dark:bg-[#131A22] focus-within:border-amazon focus-within:shadow-[0_0_0_2px_rgba(255,153,0,0.3)] transition-all">
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value.slice(0, 300));
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          maxLength={300}
          className={`w-full px-4 py-3 bg-transparent text-base text-amazon-text-primary-light dark:text-amazon-text-primary-dark placeholder-[#767676] dark:placeholder-[#AAB7B8] resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <div className="absolute bottom-2 right-3 text-xs font-medium text-[#767676] dark:text-[#AAB7B8]">
          {value.length}/300
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-[#C40000] dark:text-[#FF6B6B] flex items-center gap-1.5 font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="mt-4 w-full py-3 rounded-button text-base font-bold bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-subtle flex justify-center items-center gap-2"
      >
        {disabled ? (
          <>
            <svg className="animate-spin w-5 h-5 text-[#0F1111]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            Generating Cart...
          </>
        ) : (
          "Build My Cart"
        )}
      </button>
    </div>
  );
}
