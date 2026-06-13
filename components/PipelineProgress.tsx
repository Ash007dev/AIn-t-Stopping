"use client";
import { useState, useEffect } from "react";

const STEPS = [
  { label: "Understanding your request...", icon: "🤔" },
  { label: "Searching Amazon catalog...", icon: "🔍" },
  { label: "Selecting best products...", icon: "🛒" },
  { label: "Calculating quantities...", icon: "📦" },
  { label: "Building your cart...", icon: "✨" },
];

export default function PipelineProgress() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12 bg-white dark:bg-[#131921] rounded-card border border-amazon-border-light dark:border-[#3A4553] shadow-subtle p-8">
      {/* Amazon style loading spinner */}
      <div className="relative w-16 h-16">
        <svg className="animate-spin w-full h-full text-[#FF9900]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          {STEPS[step].icon}
        </div>
      </div>

      {/* Step label */}
      <div className="text-center w-full max-w-xs">
        <p className="text-base font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">
          {STEPS[step].label}
        </p>
        <div className="h-1.5 w-full bg-[#E3E6E6] dark:bg-[#3A4553] rounded-full overflow-hidden mt-3">
          <div 
            className="h-full bg-[#007185] dark:bg-[#5EB6C6] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
