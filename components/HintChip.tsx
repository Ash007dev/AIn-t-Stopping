"use client";
interface HintChipProps {
  label: string;
  onClick: () => void;
}
export default function HintChip({ label, onClick }: HintChipProps) {
  const trimmed = label.length > 30 ? label.slice(0, 27) + "..." : label;
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-[#2B3645] text-amazon-text-primary-light dark:text-amazon-text-primary-dark border border-[#D5D9D9] dark:border-[#3A4553] hover:bg-[#F7F8FA] dark:hover:bg-[#3A4553] shadow-subtle transition-colors whitespace-nowrap"
    >
      {trimmed}
    </button>
  );
}
