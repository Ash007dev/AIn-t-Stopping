// components/ui/Button.tsx
"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8170A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary: [
      "bg-[#E8170A] text-white rounded-[8px] px-5 py-2.5",
      "hover:bg-[#FF2010] hover:-translate-y-[1px] hover:red-glow",
      "active:translate-y-0 active:bg-[#D01308]",
      "red-glow",
    ].join(" "),

    secondary: [
      "bg-transparent text-[#A0A0A0] rounded-[8px] px-5 py-2.5",
      "border border-[#2a2a2a]",
      "hover:border-[#E8170A] hover:text-white",
      "active:scale-[0.98]",
    ].join(" "),

    text: [
      "bg-transparent text-[#E8170A] rounded-[6px] px-2 py-1",
      "hover:text-[#FF2010] hover:bg-[rgba(232,23,10,0.08)]",
      "active:scale-[0.97]",
    ].join(" "),
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin shrink-0" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
