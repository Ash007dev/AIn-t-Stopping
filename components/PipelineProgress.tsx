"use client";
import { useState, useEffect } from "react";

const STEP_ICONS = [
  // Brain - Understanding
  <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M10 21v1h4v-1"/></svg>,
  // Search - Searching
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  // Cart - Selecting
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  // Package - Calculating
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  // Sparkle - Building
  <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
];

const STEPS = [
  { label: "Understanding your request..." },
  { label: "Searching Amazon catalog..." },
  { label: "Selecting best products..." },
  { label: "Calculating quantities..." },
  { label: "Building your cart..." },
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
        <div className="absolute inset-0 flex items-center justify-center text-[#FF9900]">
          {STEP_ICONS[step]}
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
