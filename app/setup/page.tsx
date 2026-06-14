// app/setup/page.tsx - Household Profile Setup
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HouseholdProfile } from "@/lib/types";
import { validatePinCode, validateServingCount, validateBudget } from "@/lib/validation";

const DIETARY_OPTIONS = ["No restriction", "Vegetarian", "Jain"] as const;

export default function SetupPage() {
  const router = useRouter();
  const [pinCode, setPinCode] = useState("");
  const [servingCount, setServingCount] = useState(2);
  const [budget, setBudget] = useState("");
  const [dietary, setDietary] = useState<HouseholdProfile["dietary"]>("No restriction");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("household_profile");
      if (stored) {
        const profile = JSON.parse(stored) as HouseholdProfile;
        setPinCode(profile.pinCode);
        setServingCount(profile.servingCount);
        setBudget(profile.budget ? String(profile.budget) : "");
        setDietary(profile.dietary);
      }
    } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const pinResult = validatePinCode(pinCode);
    if (!pinResult.valid) newErrors.pinCode = pinResult.error!;

    const servingResult = validateServingCount(servingCount);
    if (!servingResult.valid) newErrors.servingCount = servingResult.error!;

    const budgetValue = budget.trim() === "" ? null : Number(budget);
    if (budgetValue !== null) {
      const budgetResult = validateBudget(budgetValue);
      if (!budgetResult.valid) newErrors.budget = budgetResult.error!;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const profile: HouseholdProfile = {
      pinCode,
      servingCount,
      dietary,
      budget: budgetValue,
    };

    localStorage.setItem("household_profile", JSON.stringify(profile));
    router.push("/");
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 pb-12 px-4 bg-amazon-background-light dark:bg-amazon-background-dark">
      {/* Authentic Amazon Logo placement */}
      <div className="mb-6 flex flex-col items-center justify-center">
        <div className="flex items-end text-amazon-text-primary-light dark:text-amazon-text-primary-dark tracking-tighter">
          <span className="font-bold text-4xl">amazon</span>
          <span className="text-amazon font-bold text-xl ml-1 mb-1 tracking-normal">cart</span>
        </div>
      </div>

      {/* Amazon Sign-in Style Container (348px width) */}
      <div className="w-full max-w-[348px] bg-amazon-card-light dark:bg-amazon-card-dark p-5 sm:p-6 rounded-card border border-amazon-border-light dark:border-amazon-border-dark shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none">
        
        <h1 className="text-[28px] font-normal text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-4 leading-tight">
          Household Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pin Code */}
          <div>
            <label className="block text-[13px] font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-[2px] pl-[2px]">
              Delivery Pin Code
            </label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => { setPinCode(e.target.value); setErrors((p) => ({ ...p, pinCode: "" })); }}
              placeholder="e.g. 560001"
              maxLength={6}
              className={`w-full px-3 py-[6px] text-sm rounded border bg-amazon-background-light dark:bg-[#131A22] text-amazon-text-primary-light dark:text-amazon-text-primary-dark focus:outline-none focus:border-amazon focus:shadow-[0_0_0_2px_rgba(255,153,0,0.3)] transition-all ${
                errors.pinCode ? "border-[#C40000] dark:border-[#FF6B6B] shadow-[0_0_0_1px_#C40000]" : "border-[#A6A6A6] dark:border-[#565959]"
              }`}
            />
            {errors.pinCode && (
              <p className="mt-1 text-[12px] text-[#C40000] dark:text-[#FF6B6B] flex items-start gap-1 leading-snug">
                <span className="text-sm font-bold leading-none mt-[1px]">!</span> {errors.pinCode}
              </p>
            )}
          </div>

          {/* Serving Count */}
          <div>
            <label className="block text-[13px] font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-[2px] pl-[2px]">
              Default Household Size
            </label>
            <div className="flex items-center gap-0 w-full h-[31px]">
              <button
                type="button"
                onClick={() => { setServingCount(Math.max(1, servingCount - 1)); setErrors((p) => ({ ...p, servingCount: "" })); }}
                className="w-10 h-full rounded-l border border-r-0 border-[#A6A6A6] dark:border-[#565959] bg-[#F3F3F3] dark:bg-[#2B3645] hover:bg-[#E3E6E6] dark:hover:bg-[#3A4553] text-amazon-text-primary-light dark:text-amazon-text-primary-dark font-bold flex items-center justify-center transition-colors shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]"
              >
                −
              </button>
              <input
                type="text"
                readOnly
                value={servingCount}
                className="flex-1 h-full text-center border border-[#A6A6A6] dark:border-[#565959] bg-amazon-background-light dark:bg-[#131A22] text-amazon-text-primary-light dark:text-amazon-text-primary-dark font-bold focus:outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
              />
              <button
                type="button"
                onClick={() => { setServingCount(Math.min(50, servingCount + 1)); setErrors((p) => ({ ...p, servingCount: "" })); }}
                className="w-10 h-full rounded-r border border-l-0 border-[#A6A6A6] dark:border-[#565959] bg-[#F3F3F3] dark:bg-[#2B3645] hover:bg-[#E3E6E6] dark:hover:bg-[#3A4553] text-amazon-text-primary-light dark:text-amazon-text-primary-dark font-bold flex items-center justify-center transition-colors shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]"
              >
                +
              </button>
            </div>
            {errors.servingCount && (
              <p className="mt-1 text-[12px] text-[#C40000] dark:text-[#FF6B6B] flex items-start gap-1 leading-snug">
                <span className="text-sm font-bold leading-none mt-[1px]">!</span> {errors.servingCount}
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[13px] font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-[2px] pl-[2px]">
              Max Spend Limit (₹) <span className="font-normal text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">- Optional</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => { setBudget(e.target.value); setErrors((p) => ({ ...p, budget: "" })); }}
              placeholder="Leave empty for no limit"
              min="1"
              className={`w-full px-3 py-[6px] text-sm rounded border bg-amazon-background-light dark:bg-[#131A22] text-amazon-text-primary-light dark:text-amazon-text-primary-dark focus:outline-none focus:border-amazon focus:shadow-[0_0_0_2px_rgba(255,153,0,0.3)] transition-all ${
                errors.budget ? "border-[#C40000] dark:border-[#FF6B6B] shadow-[0_0_0_1px_#C40000]" : "border-[#A6A6A6] dark:border-[#565959]"
              }`}
            />
            {errors.budget && (
              <p className="mt-1 text-[12px] text-[#C40000] dark:text-[#FF6B6B] flex items-start gap-1 leading-snug">
                <span className="text-sm font-bold leading-none mt-[1px]">!</span> {errors.budget}
              </p>
            )}
          </div>

          {/* Dietary */}
          <div className="pt-2">
            <label className="block text-[13px] font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-2 pl-[2px]">
              Dietary Preference
            </label>
            <div className="flex flex-col gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="dietary"
                    value={opt}
                    checked={dietary === opt}
                    onChange={() => setDietary(opt)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    dietary === opt 
                      ? "border-amazon bg-amazon" 
                      : "border-[#8D98A6] bg-white dark:bg-[#131A22] group-hover:border-amazon"
                  }`}>
                    {dietary === opt && <div className="w-1.5 h-1.5 bg-white dark:bg-[#0F1111] rounded-full" />}
                  </div>
                  <span className={`text-[13px] ${dietary === opt ? "font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark" : "text-amazon-text-primary-light dark:text-amazon-text-primary-dark"}`}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-[6px] rounded-button text-[13px] font-normal bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shadow-[0_2px_5px_0_rgba(213,217,217,0.5)] transition-all"
            >
              Continue
            </button>
            <p className="mt-4 text-[12px] text-amazon-text-primary-light dark:text-amazon-text-primary-dark leading-snug">
              By continuing, you agree to Amazon&apos;s <span className="text-amazon-blue hover:text-amazon-hover hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-amazon-blue hover:text-amazon-hover hover:underline cursor-pointer">Privacy Notice</span>.
            </p>
          </div>
        </form>
      </div>

      {/* Footer divider */}
      <div className="w-full max-w-[348px] mt-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-amazon-border-light dark:border-amazon-border-dark"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">HackOn Season 6.0</span>
          <div className="flex-grow border-t border-amazon-border-light dark:border-amazon-border-dark"></div>
        </div>
      </div>
    </main>
  );
}
