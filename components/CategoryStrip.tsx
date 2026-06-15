// components/CategoryStrip.tsx
"use client";

import { ReactNode } from "react";

// Inline SVGs to simulate illustrated icons (since we can't easily download from Flaticon automatically)
const StarSVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#F5A623"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>;
const VegSVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#007600"><path d="M17.3 2.7c-2.4-2.4-6.4-2.4-8.8 0L2.7 8.5c-2.4 2.4-2.4 6.4 0 8.8l5.8 5.8c2.4 2.4 6.4 2.4 8.8 0l5.8-5.8c2.4-2.4 2.4-6.4 0-8.8l-5.8-5.8zM12 19l-7-7 7-7 7 7-7 7z"/></svg>;
const DairySVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#4A90E2"><path d="M7 2v20h10V2H7zm8 18H9V6h6v14z"/><rect x="10" y="8" width="4" height="2" fill="#fff"/></svg>;
const FruitSVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#CC0C39"><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm0-18c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/><path d="M12 2v4M12 6c-2 0-3 1-3 3" stroke="#007600" strokeWidth="2"/></svg>;
const DrinksSVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#FF9900"><path d="M6 2h12v4H6zM7 6l2 16h6l2-16H7z"/><rect x="10" y="8" width="4" height="10" fill="#fff"/></svg>;
const CleanSVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#007185"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4 6H8v-1.5c0-1.33 2.67-2 4-2s4 .67 4 2V18z"/></svg>;
const BabySVG = () => <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#FFB6C1"><circle cx="12" cy="12" r="10"/><path d="M8 14h8M9 9h.01M15 9h.01" stroke="#0F1111" strokeWidth="2" strokeLinecap="round"/></svg>;

interface Category {
  id: string;
  icon: ReactNode;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: "",             icon: <StarSVG />,  label: "Top Picks" },
  { id: "vegetables",   icon: <VegSVG />,   label: "Vegetables" },
  { id: "dairy",        icon: <DairySVG />, label: "Dairy & Eggs" },
  { id: "fruits",       icon: <FruitSVG />, label: "Fruits" },
  { id: "drinks",       icon: <DrinksSVG />,label: "Drinks" },
  { id: "cleaning",     icon: <CleanSVG />, label: "Cleaners" },
  { id: "baby",         icon: <BabySVG />,  label: "Baby" },
];

interface CategoryStripProps {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryStrip({ active, onChange }: CategoryStripProps) {
  return (
    <div className="bg-white border-b border-border-light py-2">
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="flex flex-col items-center gap-1 flex-shrink-0 bg-transparent border-none cursor-pointer hover:bg-bg-light rounded-lg p-2 transition-colors relative"
            >
              <div className="w-[60px] h-[60px] flex items-center justify-center">
                {cat.icon}
              </div>
              <span
                className={`text-[12px] text-center leading-tight max-w-[70px] truncate ${
                  isActive ? "font-bold text-amazon-orange" : "font-normal text-text-primary"
                }`}
              >
                {cat.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-amazon-orange" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
