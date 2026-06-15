// components/ui/Pill.tsx
import { ReactNode } from "react";

type PillVariant = "default" | "orange" | "green" | "red";

interface PillProps {
  variant?: PillVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<PillVariant, string> = {
  default:
    "bg-[#1a1a1a] border border-[#2a2a2a] text-[#A0A0A0]",
  orange:
    "bg-[rgba(255,153,0,0.12)] border border-[rgba(255,153,0,0.3)] text-[#FF9900]",
  green:
    "bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] text-[#22C55E]",
  red:
    "bg-[rgba(232,23,10,0.12)] border border-[rgba(232,23,10,0.3)] text-[#E8170A]",
};

export default function Pill({
  variant = "default",
  children,
  className = "",
}: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium leading-none tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
