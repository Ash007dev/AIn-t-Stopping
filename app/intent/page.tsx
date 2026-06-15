// app/intent/page.tsx - Intent processing page with skeleton loading
'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import SkeletonCard from '@/components/SkeletonCard';
import type { HouseholdProfile } from '@/lib/types';

export default function IntentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-[#565959]">Loading...</p>
    </div>}>
      <IntentPageContent />
    </Suspense>
  );
}

function IntentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPipelineRunning = useAppStore(s => s.setPipelineRunning);
  const setCartResult = useAppStore(s => s.setCartResult);
  const setMode = useAppStore(s => s.setMode);
  const scannedImageBase64 = useAppStore(s => s.scannedImageBase64);
  const setScannedImageBase64 = useAppStore(s => s.setScannedImageBase64);
  const pinCode = useAppStore(s => s.pinCode);
  const customerLocation = useAppStore(s => s.customerLocation);

  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0); // 0-3 for animated steps
  const hasFired = useRef(false); // Prevent React StrictMode double-fire

  const mode = searchParams.get('mode') || 'intent';
  const preset = searchParams.get('preset') || '';
  const count = parseInt(searchParams.get('count') || '5', 10);
  const time = searchParams.get('time') || 'Tonight';
  const diet = searchParams.get('diet') || 'No restriction';

  useEffect(() => {
    if (preset && !hasFired.current) {
      hasFired.current = true;
      setMode(mode as 'intent' | 'cooking' | 'addon' | 'predictive');
      handleGenerate(preset, count, time, diet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  // Animate steps
  useEffect(() => {
    if (error) return;
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [error]);

  async function handleGenerate(text: string, personCount: number, timeCtx: string, dietary: string) {
    setPipelineRunning(true);
    setError(null);

    // Retry up to 2 times with backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const profile: HouseholdProfile = {
          pinCode,
          servingCount: personCount,
          dietary: dietary as "No restriction" | "Vegetarian" | "Jain",
          budget: null,
          location: customerLocation,
        };

        const res = await fetch('/api/generate-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intentText: text,
            householdProfile: profile,
            mode,
            imageBase64: scannedImageBase64,
          }),
        });

        if (!res.ok) {
          if (attempt < 2 && res.status >= 500) {
            // Retry on server errors
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(`Server error: ${res.status}`);
        }

        const result = await res.json();
        setCartResult(result);
        setPipelineRunning(false);
        setScannedImageBase64(null); // Clear image after success
        router.push('/cart');
        return; // Success - exit
      } catch {
        if (attempt === 2) {
          // Final attempt failed
          setPipelineRunning(false);
          setError('Something went wrong. Please try again.');
        }
        // Otherwise retry
      }
    }
  }

  const STEPS = [
    'Parsing your request...',
    'Selecting best products...',
    `Calculating quantities for ${count}...`,
    'Finding nearby stock...',
  ];

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-40">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Status card */}
        <div className="bg-white border border-[#D5D9D9] rounded-lg p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4 border-b border-[#D5D9D9] pb-3">
            <button onClick={() => window.history.back()} className="text-[#007185] text-[14px] font-medium flex-shrink-0 hover:text-[#004B6E] transition-colors">
              ← Back
            </button>
            <h2 className="text-[18px] font-bold text-[#0F1111]">
              Building cart for &quot;{preset}&quot;
            </h2>
          </div>

          {error ? (
            <div className="p-4 bg-[#FFF0F0] border border-[#F5C6CB] rounded-lg">
              <p className="text-[14px] text-[#CC0C39] font-medium mb-3">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    hasFired.current = false;
                    setError(null);
                    setStep(0);
                    handleGenerate(preset, count, time, diet);
                  }}
                  className="bg-[#FF9900] hover:bg-[#E47911] text-white font-bold
                             px-5 py-2 rounded-lg text-[14px] transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-[#F0F2F2] hover:bg-[#E3E6E6] text-[#0F1111] font-bold
                             px-5 py-2 rounded-lg text-[14px] border border-[#D5D9D9] transition-colors"
                >
                  Go back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-[14px] text-[#565959]">
              {STEPS.map((label, i) => (
                <p key={i} className={`flex items-center gap-2 transition-opacity duration-500
                  ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                  <span className={`w-4 h-4 rounded-full inline-block flex-shrink-0
                    ${i < step ? 'bg-[#007600]' : i === step ? 'bg-[#FF9900] animate-pulse' : 'bg-[#D5D9D9]'}`} />
                  {i < step && (
                    <svg className="w-3 h-3 text-[#007600] -ml-6 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {label}
                </p>
              ))}
            </div>
          )}

          {!error && (
            <div className="mt-6 p-4 bg-[#F0F2F2] rounded-lg">
              <p className="text-[13px] text-[#007185] italic">
                AI is analyzing your request to find the best products...
              </p>
            </div>
          )}
        </div>

        {/* Skeleton grid */}
        {!error && (
          <>
            <h3 className="text-[16px] font-bold text-[#0F1111] mb-3">
              Fetching best matches...
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#D5D9D9] border border-[#D5D9D9]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
