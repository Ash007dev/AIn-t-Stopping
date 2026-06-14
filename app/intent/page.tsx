// app/intent/page.tsx - Intent Input Page
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { HouseholdProfile } from "@/lib/types";
import IntentInput from "@/components/IntentInput";
import PipelineProgress from "@/components/PipelineProgress";

const PLACEHOLDERS: Record<string, string> = {
  intent: "e.g., Movie night for 5 people tonight",
  cooking: "e.g., Aglio olio for 3 people",
  addon: "e.g., Spaghetti",
};

export default function IntentPage() {
  const router = useRouter();
  const mode = useAppStore((s) => s.selectedMode);
  const isPipelineRunning = useAppStore((s) => s.isPipelineRunning);
  const setPipelineRunning = useAppStore((s) => s.setPipelineRunning);
  const setCartResult = useAppStore((s) => s.setCartResult);
  const prefillIntent = useAppStore((s) => s.prefillIntent);
  const setPrefillIntent = useAppStore((s) => s.setPrefillIntent);

  const [intentText, setIntentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefillIntent) {
      setIntentText(prefillIntent);
      setPrefillIntent(null);
    }
  }, [prefillIntent, setPrefillIntent]);

  const handleSubmit = async () => {
    if (!intentText.trim()) return;
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

      const res = await fetch("/api/generate-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentText,
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
                {mode === "cooking" ? "What are you cooking?" : mode === "addon" ? "What do you need?" : "What's the occasion?"}
              </h1>
            </div>

            {/* Intent input */}
            <IntentInput
              value={intentText}
              onChange={setIntentText}
              onSubmit={handleSubmit}
              placeholder={placeholder}
              disabled={isPipelineRunning}
            />

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-[#FDF4F4] dark:bg-[#3B1D1D] border-l-4 border-[#C40000] dark:border-[#FF6B6B] text-sm text-[#C40000] dark:text-[#FF6B6B] font-medium">
                {error}
              </div>
            )}

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
          </div>
        )}
      </div>
    </main>
  );
}
