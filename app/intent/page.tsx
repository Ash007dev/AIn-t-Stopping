// app/intent/page.tsx — IntentCart Intent Input Screen
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, ChefHat, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Button, Pill, Chip } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { HouseholdProfile } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maps chip label → mockScenario slug used by the cart page */
const CHIP_TO_SLUG: Record<string, string> = {
  "Movie night":          "movie-night",
  "Party for 20":         "diwali",
  "Study session":        "study-session",
  "Breakfast for guests": "breakfast",
  "Diwali celebration":   "diwali",
  "Aglio olio":           "aglio-olio",
  "Dal tadka":            "movie-night",   // fallback — no dal scenario yet
  "Pancakes":             "breakfast",
  "Ramen":                "movie-night",
  "Caesar salad":         "movie-night",
};

const INTENT_CHIPS = [
  { emoji: "🎬", label: "Movie night" },
  { emoji: "🎉", label: "Party for 20", personCount: 20 },
  { emoji: "📚", label: "Study session" },
  { emoji: "🌅", label: "Breakfast for guests" },
  { emoji: "🕯️", label: "Diwali celebration", personCount: 20 },
];

const COOKING_CHIPS = [
  { emoji: "🍝", label: "Aglio olio" },
  { emoji: "🍛", label: "Dal tadka" },
  { emoji: "🥞", label: "Pancakes" },
  { emoji: "🍜", label: "Ramen" },
  { emoji: "🥗", label: "Caesar salad" },
];

const TIME_OPTIONS = ["Tonight", "Tomorrow morning", "This weekend"] as const;
type TimeOption = typeof TIME_OPTIONS[number];

const DIET_OPTIONS = ["No restriction", "Vegetarian", "Jain"] as const;
type DietOption = typeof DIET_OPTIONS[number];

/** Expand chip label into a full sentence */
function chipToSentence(label: string, count: number): string {
  const map: Record<string, (n: number) => string> = {
    "Movie night":          (n) => `Movie night for ${n} people tonight`,
    "Party for 20":         (n) => `Party for ${n} people`,
    "Study session":        (n) => `Study session snacks for ${n} people`,
    "Breakfast for guests": (n) => `Breakfast for ${n} guests tomorrow morning`,
    "Diwali celebration":   (n) => `Diwali celebration for ${n} people`,
    "Aglio olio":           (n) => `Aglio olio for ${n} people`,
    "Dal tadka":            (n) => `Dal tadka for ${n} people`,
    "Pancakes":             (n) => `Pancakes for ${n} people`,
    "Ramen":                (n) => `Ramen for ${n} people`,
    "Caesar salad":         (n) => `Caesar salad for ${n} people`,
  };
  return map[label]?.(count) ?? `${label} for ${count} people`;
}

// ─── Waveform (visual-only, CSS keyframe bars) ────────────────────────────────

const BAR_DELAYS = [0, 0.15, 0.07, 0.22, 0.1];

function Waveform() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center justify-center gap-[3px] py-3"
    >
      {BAR_DELAYS.map((delay, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[#E8170A]"
          style={{
            animation: `waveBar 0.7s ease-in-out ${delay}s infinite alternate`,
            height: 6,
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Main component (inner — uses useSearchParams) ────────────────────────────

function IntentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode") ?? "intent";
  const mode: "intent" | "cooking" = rawMode === "cooking" ? "cooking" : "intent";

  const setMode     = useAppStore((s) => s.setMode);
  const setPipelineRunning = useAppStore((s) => s.setPipelineRunning);
  const setCartResult = useAppStore((s) => s.setCartResult);
  const prefillIntent = useAppStore((s) => s.prefillIntent);
  const setPrefillIntent = useAppStore((s) => s.setPrefillIntent);

  const [text, setText] = useState("");
  const [personCount, setPersonCount] = useState(5);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [time, setTime] = useState<TimeOption>("Tonight");
  const [diet, setDiet] = useState<DietOption>("No restriction");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const chips = mode === "cooking" ? COOKING_CHIPS : INTENT_CHIPS;

  // Sync mode into Zustand
  useEffect(() => {
    setMode(mode);
  }, [mode, setMode]);

  // Handle prefill from store (e.g. reorder)
  useEffect(() => {
    if (prefillIntent) {
      setText(prefillIntent);
      setPrefillIntent(null);
    }
  }, [prefillIntent, setPrefillIntent]);

  // ── Mic / Web Speech API ──────────────────────────────────────────────────
  const handleMic = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      // Visual-only fallback
      setIsRecording(true);
      setTimeout(() => setIsRecording(false), 3000);
      return;
    }

    const recognition = new SR() as any;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      setText(e.results[0][0].transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // ── Chip select ───────────────────────────────────────────────────────────
  const handleChipClick = (chip: { emoji: string; label: string; personCount?: number }) => {
    setSelectedChip(chip.label);
    if (chip.personCount) setPersonCount(chip.personCount);
    const count = chip.personCount ?? personCount;
    setText(chipToSentence(chip.label, count));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const intent = text.trim();
    if (!intent) return;
    setLoading(true);

    // Derive mock scenario slug for immediate navigation (while real API is slow/rate-limited)
    const slug = CHIP_TO_SLUG[selectedChip ?? ""] ?? "movie-night";

    // Build query params for future backend use
    const params = new URLSearchParams({
      scenario:  slug,
      persons:   String(personCount),
      time:      time,
      diet:      diet,
      intent:    intent,
    });

    // Attempt real API call; fall back to mock cart on failure
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      let profile: HouseholdProfile;
      try {
        profile = JSON.parse(localStorage.getItem("household_profile") || "{}");
      } catch {
        profile = { pinCode: "641112", servingCount: personCount, dietary: diet as HouseholdProfile["dietary"], budget: null };
      }

      setPipelineRunning(true);

      const res = await fetch("/api/generate-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentText: intent,
          householdProfile: {
            ...profile,
            servingCount: personCount,
            dietary: diet as HouseholdProfile["dietary"],
          },
          mode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const result = await res.json();
        setCartResult(result);
        setPipelineRunning(false);
        router.push(`/cart?${params.toString()}`);
        return;
      }
    } catch {
      // rate-limit / network error — fall through to mock
    }

    clearTimeout(timeout);
    setPipelineRunning(false);
    // Navigate to mock cart (LoadingScreen will play, then show mock data)
    router.push(`/cart?${params.toString()}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Waveform keyframe injection */}
      <style>{`
        @keyframes waveBar {
          from { height: 4px; }
          to   { height: 20px; }
        }
      `}</style>

      <main
        className="min-h-screen flex items-start justify-center px-4 pt-8 pb-24"
        style={{ background: "#0a0a0a" }}
      >
        <div className="w-full max-w-[640px] flex flex-col gap-7">

          {/* ── Back link ── */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[14px] text-[#666666] hover:text-[#A0A0A0] transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          {/* ── Mode pill ── */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(232,23,10,0.1)",
                border: "1px solid rgba(232,23,10,0.3)",
                color: "#E8170A",
              }}
            >
              {mode === "cooking" ? (
                <><ChefHat size={12} /> Cooking Mode</>
              ) : (
                <><Sparkles size={12} /> Shopping by Intent</>
              )}
            </span>
          </div>

          {/* ── Heading ── */}
          <div className="flex flex-col gap-1">
            <h1
              className="text-2xl sm:text-3xl font-bold text-white leading-tight"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              {mode === "cooking" ? "What are you cooking?" : "What's the occasion?"}
            </h1>
            <p className="text-sm text-[#666666]">
              {mode === "cooking"
                ? "Tell us the recipe — we'll pick the exact ingredients."
                : "Describe the moment. We'll handle the cart."}
            </p>
          </div>

          {/* ── Big text input ── */}
          <div className="flex flex-col gap-0">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  mode === "cooking"
                    ? "e.g. Aglio olio for 3 people..."
                    : "e.g. Movie night for 5 people tonight..."
                }
                rows={3}
                className="w-full resize-none text-white placeholder-[#444] outline-none pr-14 leading-relaxed"
                style={{
                  background: "#111111",
                  border: "1px solid #333333",
                  borderRadius: "16px",
                  padding: "18px 52px 18px 18px",
                  fontSize: "20px",
                  fontWeight: 500,
                  minHeight: "80px",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#E8170A";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,23,10,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#333333";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              {/* Mic button inside input */}
              <button
                type="button"
                onClick={handleMic}
                className="absolute right-3 top-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: isRecording ? "#E8170A" : "#1a1a1a",
                  border: `1px solid ${isRecording ? "#E8170A" : "#333333"}`,
                }}
                aria-label={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ background: "#E8170A" }}
                  />
                )}
                {isRecording
                  ? <MicOff size={15} className="text-white" />
                  : <Mic size={15} className="text-[#A0A0A0]" />
                }
              </button>
            </div>

            {/* Waveform below input */}
            <AnimatePresence>
              {isRecording && <Waveform />}
            </AnimatePresence>
          </div>

          {/* ── Person count stepper ── */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setPersonCount((c) => Math.max(1, c - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-150"
                style={{ border: "1px solid #333333", background: "#111111" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E8170A")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333333")}
                aria-label="Decrease person count"
              >
                −
              </button>

              <div className="text-center w-12">
                <motion.span
                  key={personCount}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-white font-bold block"
                  style={{ fontSize: "40px", lineHeight: 1 }}
                >
                  {personCount}
                </motion.span>
              </div>

              <button
                type="button"
                onClick={() => setPersonCount((c) => Math.min(50, c + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-150"
                style={{ border: "1px solid #333333", background: "#111111" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E8170A")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333333")}
                aria-label="Increase person count"
              >
                +
              </button>
            </div>
            <p className="text-xs text-[#666666] text-center">
              Quantities will be calculated for this many people
            </p>
          </div>

          {/* ── Quick chips ── */}
          <div>
            <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-2.5">
              Quick picks
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {chips.map((chip) => (
                <Chip
                  key={chip.label}
                  selected={selectedChip === chip.label}
                  onClick={() => handleChipClick(chip)}
                  className="shrink-0"
                >
                  {chip.emoji} {chip.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* ── Time context ── */}
          <div>
            <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-2.5">
              When?
            </p>
            <div className="flex gap-2 flex-wrap">
              {TIME_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  selected={time === opt}
                  onClick={() => setTime(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </div>
          </div>

          {/* ── Dietary ── */}
          <div>
            <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-2.5">
              Diet?
            </p>
            <div className="flex gap-2 flex-wrap">
              {DIET_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  selected={diet === opt}
                  onClick={() => setDiet(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </div>
          </div>

          {/* ── Build My Cart button ── */}
          <Button
            variant="primary"
            loading={loading}
            disabled={!text.trim() || loading}
            onClick={handleSubmit}
            className="w-full justify-center font-bold text-[18px]"
            style={{
              height: "56px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {loading ? "Building your cart..." : "Build My Cart →"}
          </Button>

          {/* ── Hint ── */}
          <p className="text-[11px] text-[#444444] text-center">
            Press Enter or tap the button · AI-curated · typically takes 3–6 seconds
          </p>
        </div>
      </main>
    </>
  );
}

// ─── Page export (Suspense boundary for useSearchParams) ──────────────────────

export default function IntentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[#666666] text-sm">Loading…</p>
        </div>
      }
    >
      <IntentPageContent />
    </Suspense>
  );
}
