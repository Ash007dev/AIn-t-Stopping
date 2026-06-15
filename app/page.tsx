// app/page.tsx - Home / Mode Selection
"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import ModeCard from "@/components/ModeCard";

interface ReplenishableItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  category: string;
  eta_minutes: number;
  in_stock: boolean;
  dark_store?: string;
  return_policy?: string;
}

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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setMode = useAppStore((s) => s.setMode);
  const purchaseHistory = useAppStore((s) => s.purchaseHistory);
  const setCartResult = useAppStore((s) => s.setCartResult);
  const [isMounted, setIsMounted] = useState(false);
  const [replenishables, setReplenishables] = useState<ReplenishableItem[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const profile = localStorage.getItem("household_profile");
    if (!profile) router.replace("/setup");

    fetch('/api/replenishables')
      .then(r => r.json())
      .then(data => setReplenishables(data.replenishables || []))
      .catch(() => {});
  }, [router]);

  // Scroll to Buy It Again when ?section=history
  useEffect(() => {
    if (searchParams.get("section") === "history" && historyRef.current) {
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [searchParams, isMounted]);

  const handleModeSelect = (mode: "intent" | "cooking" | "addon") => {
    setMode(mode);
    router.push("/intent");
  };

  const handlePredictiveSelect = () => {
    setMode("predictive");
    router.push("/intent?mode=predictive");
  };

  const handleHistoryChip = (record: typeof purchaseHistory[0]) => {
    setCartResult({
      cart: record.cartSnapshot,
      regionalProducts: [],
      occasionTitle: record.occasionTitle,
      parsedIntent: { occasion: record.occasionTitle, person_count: 1, time_context: "", dietary: [], exclusions: [] }
    });
    setMode("intent");
    router.push("/cart");
  };

  const handleQuickAdd = (item: ReplenishableItem) => {
    setCartResult({
      cart: [{
        ...item,
        category: item.category as import("@/lib/types").ProductCategory,
        quantity: 1,
        ai_reasoning: "Quick add - one tap reorder",
        alternatives: [],
        is_suggestion: false,
        rating: 4.5,
        review_count: 5000,
        is_bestseller: true,
        serving_size: 1,
        occasion_tags: [],
        region_tags: [],
        expiry_months: null,
        keywords: [],
        sample_reviews: [
          { author: "Customer", text: "Great product." },
          { author: "Buyer", text: "Fast delivery." },
        ] as [{ author: string; text: string }, { author: string; text: string }],
      }],
      regionalProducts: [],
      occasionTitle: `Quick order - ${item.name}`,
      parsedIntent: { occasion: "replenishable", person_count: 1, time_context: null, dietary: [], exclusions: [] }
    });
    router.push('/cart');
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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

      {/* 4th mode: Predictive & Confident */}
      <button
        id="mode-card-predictive"
        onClick={handlePredictiveSelect}
        className="group flex items-start gap-4 p-5 bg-white dark:bg-[#1A2332] border border-indigo-100 dark:border-indigo-900/40 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200 text-left w-full mb-10"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">Not sure what you need?</h3>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium px-2 py-0.5 rounded-full">AI guides you</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">New baby, new home, someone sick - tell us your situation and we will build the right kit.</p>
        </div>
        <svg className="flex-shrink-0 w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* Running Low? section */}
      {isMounted && replenishables.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Running Low?</h2>
            <span className="text-xs text-gray-400">Tap to add instantly</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {replenishables.map(item => (
              <button
                key={item.id}
                onClick={() => handleQuickAdd(item)}
                className="flex-shrink-0 w-32 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-[#3A4553] hover:border-orange-300 dark:hover:border-orange-500 rounded-xl p-3 text-left hover:shadow-sm transition-all"
              >
                <div className="w-full h-16 bg-gray-50 dark:bg-[#0F1923] rounded-lg flex items-center justify-center mb-2">
                  <img src={item.image_url || "/placeholder-product.png"} alt={item.name}
                    className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{item.name}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">Rs.{item.price}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.eta_minutes} min</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buy it again */}
      {isMounted && purchaseHistory.length > 0 && (
        <div ref={historyRef} className="mb-10">
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
