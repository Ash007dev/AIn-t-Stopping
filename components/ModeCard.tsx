"use client";

interface ModeCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string; // Kept for prop compatibility but ignored in Amazon theme
  onSelect: () => void;
}

export default function ModeCard({ title, description, icon, onSelect }: ModeCardProps) {
  return (
    <button
      onClick={onSelect}
      className="group w-full p-5 bg-amazon-card-light dark:bg-amazon-card-dark border border-amazon-border-light dark:border-amazon-border-dark rounded-card hover:shadow-medium transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-amazon"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex-shrink-0 bg-[#F0F2F2] dark:bg-[#2B3645] rounded-full flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-base font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-1 group-hover:text-amazon transition-colors">
            {title}
          </h3>
          <p className="text-sm text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark leading-snug">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0 pt-2 text-[#007185] dark:text-[#5EB6C6]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </button>
  );
}
