// app/page.tsx - Home / Mode Selection
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import ModeCard from "@/components/ModeCard";

const MODES = [
  {
    key: "intent" as const,
    title: "Shopping by Intent",
    description: "Describe an occasion - movie night, birthday party, study session - and we'll build the perfect cart.",
  },
  {
    key: "cooking" as const,
    title: "Cooking / Fresh",
    description: "Name a recipe and serving count. We'll pick exact ingredients at the right quantities.",
  },
  {
    key: "addon" as const,
    title: "Frictionless Add-on",
    description: "Add one product - we'll suggest 2-5 complementary items you might need.",
  },
];

export default function Home() {
  const router = useRouter();
  const setMode = useAppStore((s) => s.setMode);
  const purchaseHistory = useAppStore((s) => s.purchaseHistory);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const profile = localStorage.getItem("household_profile");
    if (!profile) router.replace("/setup");
  }, [router]);

  const setCartResult = useAppStore((s) => s.setCartResult);

  const handleModeSelect = (mode: "intent" | "cooking" | "addon") => {
    setMode(mode);
    router.push("/intent");
  };

  const handleHistoryChip = (record: typeof purchaseHistory[0]) => {
    // Actually repopulate the exact cart snapshot
    setCartResult({
      cart: record.cartSnapshot,
      regionalProducts: [],
      occasionTitle: record.occasionTitle,
      parsedIntent: { occasion: record.occasionTitle, person_count: 1, time_context: "", dietary: [], exclusions: [] }
    });
    setMode("intent"); // Default fallback
    router.push("/cart");
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16 max-w-5xl mx-auto flex flex-col pt-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          How would you like to shop today?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Select a shopping mode below. Our AI assistant will curate the best Amazon products for your needs.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {MODES.map((mode) => (
          <ModeCard
            key={mode.key}
            type={mode.key}
            title={mode.title}
            description={mode.description}
            onClick={() => handleModeSelect(mode.key)}
          />
        ))}
      </div>

      {/* Buy it again */}
      {isMounted && purchaseHistory.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Buy it again</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {purchaseHistory.slice(0, 3).map((record, i) => (
              <button
                key={record.orderId || i}
                onClick={() => handleHistoryChip(record)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-[#3A4553] rounded-xl hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2B3645] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{record.occasionTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {record.cartSnapshot?.length ?? 0} items · {new Date(record.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
