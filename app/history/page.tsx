// app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ShoppingBag, Clock, ChevronRight, RotateCcw, PackageOpen } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const purchaseHistory = useAppStore((s) => s.purchaseHistory);
  const setCartResult = useAppStore((s) => s.setCartResult);
  const setMode = useAppStore((s) => s.setMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profile = localStorage.getItem("household_profile");
    if (!profile) router.replace("/setup");
  }, [router]);

  const handleReorder = (record: typeof purchaseHistory[0]) => {
    setCartResult({
      cart: record.cartSnapshot,
      regionalProducts: [],
      occasionTitle: record.occasionTitle,
      parsedIntent: {
        occasion: record.occasionTitle,
        person_count: 1,
        time_context: "",
        dietary: [],
        exclusions: [],
      },
    });
    setMode("intent");
    router.push("/cart");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const totalSpent = (record: typeof purchaseHistory[0]) =>
    record.cartSnapshot?.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) ?? 0;

  if (!mounted) return null;

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
          aria-label="Go back"
        >
          <ChevronRight size={18} className="text-[#666666] rotate-180" />
        </button>
        <div>
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Order History
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            {purchaseHistory.length} past order{purchaseHistory.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {purchaseHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <PackageOpen size={36} className="text-[#333333]" />
          </div>
          <h2 className="text-base font-semibold text-[#A0A0A0] mb-2">No orders yet</h2>
          <p className="text-sm text-[#666666] mb-6 max-w-xs leading-relaxed">
            Your cart orders will appear here once you complete a shopping session.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-[8px] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-[1px]"
            style={{ background: "#E8170A", boxShadow: "0 4px 20px rgba(232,23,10,0.3)" }}
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* History list */}
      {purchaseHistory.length > 0 && (
        <div className="flex flex-col gap-3">
          {purchaseHistory.map((record, i) => (
            <div
              key={record.orderId || i}
              className="rounded-[14px] overflow-hidden transition-all duration-200"
              style={{
                background: "#111111",
                border: "1px solid #1f1f1f",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-start justify-between px-4 py-3"
                style={{ borderBottom: "1px solid #1a1a1a" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: "#1a1a1a" }}
                  >
                    <ShoppingBag size={16} className="text-[#E8170A]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">
                      {record.occasionTitle}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} className="text-[#666666]" />
                      <span className="text-[11px] text-[#666666]">
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    ₹{totalSpent(record).toFixed(0)}
                  </p>
                  <p className="text-[11px] text-[#666666]">
                    {record.cartSnapshot?.length ?? 0} items
                  </p>
                </div>
              </div>

              {/* Item preview */}
              <div className="px-4 py-2.5">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(record.cartSnapshot ?? []).slice(0, 4).map((item, j) => (
                    <span
                      key={j}
                      className="text-[11px] px-2 py-0.5 rounded-full text-[#A0A0A0]"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      {item.name.length > 20 ? item.name.slice(0, 20) + "…" : item.name}
                      {item.quantity > 1 && (
                        <span className="text-[#666666] ml-1">×{item.quantity}</span>
                      )}
                    </span>
                  ))}
                  {(record.cartSnapshot?.length ?? 0) > 4 && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full text-[#666666]"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      +{(record.cartSnapshot?.length ?? 0) - 4} more
                    </span>
                  )}
                </div>

                {/* Reorder button */}
                <button
                  onClick={() => handleReorder(record)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-xs font-semibold transition-all duration-150"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    color: "#A0A0A0",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8170A";
                    (e.currentTarget as HTMLButtonElement).style.color = "#E8170A";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
                    (e.currentTarget as HTMLButtonElement).style.color = "#A0A0A0";
                  }}
                >
                  <RotateCcw size={12} />
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
