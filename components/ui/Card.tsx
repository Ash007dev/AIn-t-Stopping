// components/ui/Card.tsx
import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enables lift + shadow hover effect */
  interactive?: boolean;
  /** Shows a red border on hover in addition to the normal hover effect */
  accentHover?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Card({
  interactive = false,
  accentHover = false,
  children,
  className = "",
  ...props
}: CardProps) {
  const base =
    "bg-[#111111] border border-[#1f1f1f] rounded-[16px] card-shadow";

  const interactiveStyles = interactive
    ? [
        "transition-all duration-200 cursor-pointer",
        "hover:card-shadow-hover hover:border-[#2a2a2a] hover:-translate-y-1",
        accentHover ? "hover:border-[#E8170A]" : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div
      className={`${base} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
