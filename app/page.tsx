// app/page.tsx — Home / Mode Selection
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import ModeCard from "@/components/ModeCard";

const MODES = [
  {
    key: "intent" as const,
    title: "Shopping by Intent",
    description: "Describe an occasion — movie night, birthday party, study session — and we'll build the perfect cart.",
    icon: "🎯",
    gradient: "", // Deprecated in Amazon theme
  },
  {
    key: "cooking" as const,
    title: "Cooking / Fresh",
    description: "Name a recipe and serving count. We'll pick exact ingredients at the right quantities.",
    icon: "👨‍🍳",
    gradient: "",
  },
  {
    key: "addon" as const,
    title: "Frictionless Add-on",
    description: "Add one product — we'll suggest 2-5 complementary items you might need.",
    icon: "⚡",
    gradient: "",
  },
];

export default function Home() {
  const router = useRouter();
  const setMode = useAppStore((s) => s.setMode);
  const purchaseHistory = useAppStore((s) => s.purchaseHistory);
  const setPrefillIntent = useAppStore((s) => s.setPrefillIntent);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const profile = localStorage.getItem("household_profile");
    if (!profile) router.replace("/setup");
  }, [router]);

  const handleModeSelect = (mode: "intent" | "cooking" | "addon") => {
    setMode(mode);
    router.push("/intent");
  };

  const handleHistoryChip = (occasionTitle: string) => {
    setPrefillIntent(occasionTitle);
    router.push("/intent");
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16 max-w-5xl mx-auto flex flex-col pt-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-2">
          How would you like to shop today?
        </h1>
        <p className="text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark text-sm">
          Select a shopping mode below. Our AI assistant will curate the best Amazon products for your needs.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {MODES.map((mode) => (
          <ModeCard
            key={mode.key}
            title={mode.title}
            description={mode.description}
            icon={mode.icon}
            gradient={mode.gradient}
            onSelect={() => handleModeSelect(mode.key)}
          />
        ))}
      </div>

      {/* Recent orders */}
      {isMounted && purchaseHistory.length > 0 && (
        <div className="pt-8 border-t border-amazon-border-light dark:border-amazon-border-dark">
          <h2 className="text-lg font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-4">
            Buy it again
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
            {purchaseHistory.slice(0, 4).map((record) => (
              <button
                key={record.orderId}
                onClick={() => handleHistoryChip(record.occasionTitle)}
                className="flex-shrink-0 w-[140px] h-[100px] p-3 rounded-md border border-[#D5D9D9] dark:border-[#3A4553] bg-white dark:bg-amazon-card-dark hover:bg-[#F7F8FA] dark:hover:bg-[#2B3645] transition-colors flex flex-col items-center justify-center text-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[#E7F4F5] dark:bg-[#1E2E3E] text-amazon-blue dark:text-amazon-blueDark flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </div>
                <span className="text-xs font-medium text-amazon-text-primary-light dark:text-amazon-text-primary-dark line-clamp-2 leading-tight">
                  {record.occasionTitle}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
