// components/ui/Chip.tsx
"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Chip({
  selected = false,
  children,
  className = "",
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium",
        "transition-all duration-150 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8170A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
        selected
          ? // Selected state: red bg, red border, white text
            "bg-[#E8170A] border border-[#E8170A] text-white shadow-sm"
          : // Default state: elevated bg, bright border, muted text
            "bg-[#1a1a1a] border border-[#2a2a2a] text-[#A0A0A0] hover:border-[#E8170A] hover:text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}
