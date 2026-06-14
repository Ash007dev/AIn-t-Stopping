"use client";

const ICONS: Record<string, React.ReactNode> = {
  intent: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
    </svg>
  ),
  cooking: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/>
    </svg>
  ),
  addon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

interface ModeCardProps {
  type: "intent" | "cooking" | "addon";
  title: string;
  description: string;
  onClick: () => void;
}

export default function ModeCard({ type, title, description, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      id={`mode-card-${type}`}
      className="group flex items-start gap-4 p-5 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-[#3A4553] rounded-2xl hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all duration-200 text-left w-full"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 transition-colors">
        {ICONS[type]}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <svg className="flex-shrink-0 w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-orange-400 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}
