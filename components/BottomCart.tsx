// components/BottomCart.tsx - Sticky bottom bar showing cart summary + Proceed button
"use client";

import { ShoppingCart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface BottomCartProps {
  onProceed: () => void;
}

export default function BottomCart({ onProceed }: BottomCartProps) {
  const cart = useAppStore((s) => s.cart);
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const totalRupees = Math.round(cartTotal / 100);

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 bg-white dark:bg-amazon-card-dark border-t border-gray-200 dark:border-amazon-border-dark px-3 py-2 shadow-large">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-[#0F1111] dark:text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amazon text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F1111] dark:text-white leading-tight">
              ₹{totalRupees}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {cartCount} item{cartCount > 1 ? "s" : ""} in cart
            </p>
          </div>
        </div>

        <button
          onClick={onProceed}
          className="bg-[#FFD814] hover:bg-[#F0C000] text-[#0F1111] border border-[#F0C000] rounded-lg px-5 py-2 font-bold text-sm flex items-center gap-1.5 active:scale-[0.97] transition-all shadow-sm"
        >
          Proceed
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
