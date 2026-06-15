// components/loading/LoadingScreen.tsx
"use client";
import { useEffect, useState } from "react";
import SkeletonCard from "./SkeletonCard";
import PipelineStepper from "./PipelineStepper";
import RotatingTip from "./RotatingTip";

interface LoadingScreenProps {
  occasionTitle: string;
  personCount: number;
  onComplete: () => void;
}

export default function LoadingScreen({ occasionTitle, personCount, onComplete }: LoadingScreenProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Step 0: 0s -> "Understanding your occasion..."
    // Step 1: 2s -> "Selecting the best products..."
    // Step 2: 3s -> "Calculating quantities..."
    // Step 3: 4s -> "Finding popular items..."
    // Step 4: 5s -> "Cart ready!"
    const t1 = setTimeout(() => setActiveStep(1), 2000);
    const t2 = setTimeout(() => setActiveStep(2), 3000);
    const t3 = setTimeout(() => setActiveStep(3), 4000);
    const t4 = setTimeout(() => {
      setActiveStep(4);
      // Fire onComplete after a brief delay so they see the final green step completed
      const t5 = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(t5);
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const steps = [
    "Understanding your occasion...",
    "Selecting the best products...",
    `Calculating quantities for ${personCount} guests...`,
    "Finding popular items near you...",
    "Cart ready!",
  ];

  const tips = [
    `Checking which chip bag serves ${personCount} people best...`,
    "Verifying best-before dates so nothing expires soon...",
    "Surfacing what's popular in Coimbatore right now...",
    "Ranking by ratings, not ads...",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6 bg-bg-primary min-h-[70vh] justify-center">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-primary tracking-tight">
          ✨ Building cart for: <span className="text-accent-primary">&ldquo;{occasionTitle}&rdquo;</span>
        </h2>
      </div>

      {/* Stepper */}
      <PipelineStepper steps={steps} activeStep={activeStep} />

      {/* Rotating Tip */}
      <RotatingTip tips={tips} />

      {/* Skeleton cards container */}
      <div className="space-y-4 mt-6">
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">
          Curation Preview
        </p>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
