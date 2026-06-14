// app/intent/page.tsx - Intent Input Page
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { HouseholdProfile } from "@/lib/types";
import IntentInput from "@/components/IntentInput";
import PipelineProgress from "@/components/PipelineProgress";
import VoiceButton from "@/components/VoiceButton";

export default function IntentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <IntentPageContent />
    </Suspense>
  );
}

const PLACEHOLDERS: Record<string, string> = {
  intent: "e.g., Movie night for 5 people tonight",
  cooking: "e.g., Aglio olio for 3 people",
  addon: "e.g., Spaghetti",
  predictive: "Select a situation below",
};

const SITUATIONS = [
  { id: "new_baby", label: "New baby at home", icon: "👶", desc: "Newborn essentials kit" },
  { id: "new_home", label: "Just moved in", icon: "🏠", desc: "Kitchen and cleaning basics" },
  { id: "home_office", label: "Setting up home office", icon: "💻", desc: "WFH setup essentials" },
  { id: "sick_person", label: "Someone sick at home", icon: "🤒", desc: "OTC comfort items" },
  { id: "college_first_week", label: "First week of college", icon: "🎓", desc: "Hostel survival kit" },
];

function IntentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = useAppStore((s) => s.selectedMode);
  const isPipelineRunning = useAppStore((s) => s.isPipelineRunning);
  const setPipelineRunning = useAppStore((s) => s.setPipelineRunning);
  const setCartResult = useAppStore((s) => s.setCartResult);
  const setMode = useAppStore((s) => s.setMode);
  const prefillIntent = useAppStore((s) => s.prefillIntent);
  const setPrefillIntent = useAppStore((s) => s.setPrefillIntent);

  const [intentText, setIntentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);

  // Detect predictive mode from URL params
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "predictive" && mode !== "predictive") {
      setMode("predictive");
    }
  }, [searchParams, mode, setMode]);

  useEffect(() => {
    if (prefillIntent) {
      setIntentText(prefillIntent);
      setPrefillIntent(null);
      // Auto-submit when voice transcript arrives
      setTimeout(() => {
        const submitBtn = document.querySelector('[data-auto-submit]') as HTMLButtonElement;
        if (submitBtn) submitBtn.click();
      }, 300);
    }
  }, [prefillIntent, setPrefillIntent]);

  // Also check URL query param for voice navigation
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !intentText) {
      setIntentText(q);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVoiceTranscript = (text: string) => {
    setIntentText(text);
    // Auto-submit after a brief delay for the UI to update
    setTimeout(() => handleSubmit(), 200);
  };

  const handleSubmit = async () => {
    if (mode === "predictive" && !selectedSituation) return;
    if (mode !== "predictive" && !intentText.trim()) return;
    setError(null);
    setPipelineRunning(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      let profile: HouseholdProfile;
      try {
        profile = JSON.parse(localStorage.getItem("household_profile") || "{}");
      } catch {
        profile = { pinCode: "110001", servingCount: 2, dietary: "No restriction", budget: null };
      }

      const effectiveText = mode === "predictive" 
        ? (SITUATIONS.find(s => s.id === selectedSituation)?.label || intentText)
        : intentText;

      const res = await fetch("/api/generate-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentText: effectiveText,
          householdProfile: profile,
          mode: mode || "intent",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate cart");
        setPipelineRunning(false);
        return;
      }

      const result = await res.json();
      setCartResult(result);
      setPipelineRunning(false);
      router.push("/cart");
    } catch (e: unknown) {
      clearTimeout(timeout);
      setPipelineRunning(false);
      if (e instanceof Error && e.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const placeholder = PLACEHOLDERS[mode || "intent"] || PLACEHOLDERS.intent;
  const isPredictive = mode === "predictive";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-[13px] font-medium text-[#007185] dark:text-[#5EB6C6] hover:text-[#C7511F] dark:hover:text-[#E47911] hover:underline mb-8"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Mode Selection
        </button>

        {/* Pipeline progress */}
        {isPipelineRunning ? (
          <PipelineProgress />
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">
                {isPredictive
                  ? "What's your situation?"
                  : mode === "cooking" ? "What are you cooking?" : mode === "addon" ? "What do you need?" : "What's the occasion?"}
              </h1>
              {isPredictive && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Select your situation - we will figure out exactly what you need.
                </p>
              )}
            </div>

            {/* Predictive mode: situation selector */}
            {isPredictive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SITUATIONS.map(situation => (
                    <button
                      key={situation.id}
                      onClick={() => {
                        setIntentText(situation.label);
                        setSelectedSituation(situation.id);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        selectedSituation === situation.id
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                          : "border-gray-200 dark:border-[#3A4553] hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-[#1A2332]"
                      }`}
                    >
                      <span className="text-2xl">{situation.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{situation.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{situation.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  For medicine suggestions: always consult a doctor. We only show common OTC comfort items.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedSituation || isPipelineRunning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-[#2B3645] text-white disabled:text-gray-400 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  {isPipelineRunning ? "Building your kit..." : "Build my kit"}
                </button>
              </div>
            ) : (
              <>
                {/* Standard intent input with voice */}
                <div className="relative">
                  <IntentInput
                    value={intentText}
                    onChange={setIntentText}
                    onSubmit={handleSubmit}
                    placeholder={placeholder}
                    disabled={isPipelineRunning}
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <VoiceButton
                      onTranscript={handleVoiceTranscript}
                      disabled={isPipelineRunning}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Quick examples */}
                <div className="mt-10">
                  <p className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {["Movie night for 5", "Aglio olio for 3", "Birthday party for 20 kids", "Quick breakfast for 2"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setIntentText(ex)}
                        className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#F7F8FA] dark:bg-[#2B3645] border border-[#D5D9D9] dark:border-[#3A4553] text-amazon-text-primary-light dark:text-amazon-text-primary-dark hover:bg-[#E3E6E6] dark:hover:bg-[#3A4553] shadow-subtle transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-[#FDF4F4] dark:bg-[#3B1D1D] border-l-4 border-[#C40000] dark:border-[#FF6B6B] text-sm text-[#C40000] dark:text-[#FF6B6B] font-medium">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
