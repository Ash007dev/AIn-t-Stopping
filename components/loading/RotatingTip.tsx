// components/loading/RotatingTip.tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingTipProps {
  tips: string[];
}

export default function RotatingTip({ tips }: RotatingTipProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tips.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [tips]);

  return (
    <div className="h-10 flex items-center justify-center overflow-hidden my-2 px-4 bg-[#111111] border border-border-default rounded-xl w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-text-secondary text-center italic"
        >
          💡 {tips[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
