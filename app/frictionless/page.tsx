// app/frictionless/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Check, Plus, Zap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip } from "@/components/ui";

const SUGGESTIONS = [
  { id: "s1", name: "Pasta Sauce", qty: "×1", price: "₹99", image: "https://placehold.co/100x100/1a1a1a/ffffff?text=Sauce" },
  { id: "s2", name: "Garlic", qty: "4 cloves", price: "₹30", image: "https://placehold.co/100x100/1a1a1a/ffffff?text=Garlic" },
  { id: "s3", name: "Parmesan", qty: "100g", price: "₹199", image: "https://placehold.co/100x100/1a1a1a/ffffff?text=Cheese" },
  { id: "s4", name: "Olive Oil", qty: "250ml", price: "₹299", image: "https://placehold.co/100x100/1a1a1a/ffffff?text=Oil" },
];

export default function FrictionlessPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isAddingPrimary, setIsAddingPrimary] = useState(false);
  const [hasAddedPrimary, setHasAddedPrimary] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);

  const showResult = searchText.toLowerCase() === "spaghetti";

  const handlePrimaryAdd = () => {
    setIsAddingPrimary(true);
    setTimeout(() => {
      setIsAddingPrimary(false);
      setHasAddedPrimary(true);
      setTimeout(() => {
        setShowBanner(true);
      }, 300);
    }, 600);
  };

  const handleAddAll = () => {
    setIsAddingAll(true);
    setTimeout(() => {
      // Reusing aglio-olio mock scenario as a stand-in for the completed add-on cart
      router.push("/cart?scenario=aglio-olio&mode=addon");
    }, 800);
  };

  return (
    <main className="min-h-screen pb-40 px-4 pt-8" style={{ background: "#0a0a0a" }}>
      <div className="max-w-[640px] mx-auto flex flex-col gap-6">
        
        {/* ── Back link ── */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[14px] text-[#666666] hover:text-[#A0A0A0] transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        {/* ── Heading ── */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Sora, sans-serif" }}>Frictionless Add-on</h1>
          <p className="text-sm text-[#666666]">Add a single item. We will figure out what else you need.</p>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search Amazon Fresh..."
            className="w-full bg-[#111111] text-white placeholder-[#666666] outline-none transition-all duration-200"
            style={{
              border: "1px solid #333333",
              borderRadius: "12px",
              padding: "14px 16px 14px 44px",
              fontSize: "16px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#E8170A";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#333333";
            }}
          />
        </div>

        {/* ── Chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["spaghetti", "pasta sauce", "rice"].map((chip) => (
            <Chip
              key={chip}
              selected={searchText.toLowerCase() === chip}
              onClick={() => setSearchText(chip)}
              className="shrink-0 text-xs"
            >
              {chip}
            </Chip>
          ))}
        </div>

        {/* ── Search Result ── */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-3 rounded-[16px] transition-colors"
            style={{ background: "#111111", border: "1px solid #2a2a2a" }}
          >
            <img
              src="https://placehold.co/120x120/1a1a1a/ffffff?text=Barilla+Spaghetti"
              alt="Barilla Spaghetti"
              className="w-[60px] h-[60px] rounded-lg object-contain shrink-0"
              style={{ background: "#1a1a1a" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Barilla Spaghetti</p>
              <div className="flex items-center gap-2 text-xs text-[#666666] mt-0.5">
                <span>500g</span>
                <span>·</span>
                <span className="text-[#FBBF24]">★4.7</span>
              </div>
              <p className="text-sm font-bold text-[#FF9900] mt-1">₹149</p>
            </div>
            
            <div className="shrink-0">
              <Button
                variant={hasAddedPrimary ? "secondary" : "primary"}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  hasAddedPrimary ? "!border-[#22C55E] !text-[#22C55E] !bg-transparent" : ""
                }`}
                onClick={handlePrimaryAdd}
                disabled={isAddingPrimary || hasAddedPrimary}
              >
                {hasAddedPrimary ? (
                  <span className="flex items-center gap-1"><Check size={14} /> Added</span>
                ) : isAddingPrimary ? (
                  <span className="flex items-center gap-1 justify-center w-[45px]"><Check size={14} className="animate-pulse" /></span>
                ) : (
                  <span className="flex items-center gap-1 justify-center w-[45px]">Add +</span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── AI Suggestion Banner ── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] shadow-2xl"
            style={{
              background: "#1a1a1a",
              borderTop: "1px solid #E8170A",
              padding: "16px",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))"
            }}
          >
            <div className="max-w-[640px] mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-[#FF9900]" />
                <h3 className="text-sm font-bold text-white">Complete your pasta dish — you'll also need:</h3>
              </div>

              {/* Suggestions row */}
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {SUGGESTIONS.map((s) => (
                  <div
                    key={s.id}
                    className="shrink-0 w-[130px] rounded-[12px] p-2.5 flex flex-col gap-2"
                    style={{ background: "#111111", border: "1px solid #2a2a2a" }}
                  >
                    <img src={s.image} alt={s.name} className="w-12 h-12 object-cover rounded-md bg-[#2a2a2a] mx-auto mb-1" />
                    <div>
                      <p className="text-xs font-bold text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-[#666666]">{s.qty}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#1f1f1f]">
                      <span className="text-xs font-bold text-[#FF9900]">{s.price}</span>
                      <button className="w-6 h-6 rounded-full flex items-center justify-center bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add All Button */}
              <Button
                variant="primary"
                loading={isAddingAll}
                className="w-full justify-center rounded-[12px] py-3.5 text-sm font-bold mt-2 border-none"
                style={{ background: "#FF9900", color: "#ffffff", boxShadow: "0 4px 14px rgba(255,153,0,0.3)" }}
                onClick={handleAddAll}
              >
                + Add All Suggested Items
              </Button>
              <div className="text-center mt-3">
                <button className="text-[11px] text-[#A0A0A0] flex items-center gap-1 mx-auto hover:text-white transition-colors">
                  Quantities for 2 servings <ChevronDown size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
