// components/SpeedCheckout.tsx - Slide-up checkout drawer with biometric + confirmed phases
"use client";

import { useState } from "react";
import { X, User, CheckCircle2, Clock, CreditCard, MapPin, Shield } from "lucide-react";

export interface SpeedCartItem {
  id: string;
  name: string;
  price: number; // in paise
  quantity: number;
  image_url?: string;
  category?: string;
}

interface SpeedCheckoutProps {
  cart: SpeedCartItem[];
  onClose: () => void;
  onOrderComplete: (orderId: string) => void;
}

type Phase = "review" | "biometric" | "confirmed";

export default function SpeedCheckout({ cart, onClose, onOrderComplete }: SpeedCheckoutProps) {
  const [phase, setPhase] = useState<Phase>("review");
  const [orderId] = useState(() => `AMZ-${Date.now().toString(36).toUpperCase()}`);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalRupees = Math.round(total / 100);
  const eta = 14 + Math.floor(Math.random() * 16); // 14-30 mins

  const handleOrderNow = async () => {
    setPhase("biometric");
    // Simulate biometric verification
    await new Promise((r) => setTimeout(r, 2000));
    setPhase("confirmed");
    onOrderComplete(orderId);
  };

  // ── Biometric animation ────────────────────────────────────────
  if (phase === "biometric") {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-amazon-card-dark rounded-3xl p-10 w-full max-w-xs text-center shadow-2xl">
          <div className="w-24 h-24 mx-auto mb-5 relative">
            <div className="absolute inset-0 border-4 border-amazon-blue/20 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-2 border-4 border-amazon-blue/40 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-amazon-blue rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Authenticating</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Face ID verification in progress...</p>
        </div>
      </div>
    );
  }

  // ── Order confirmed ────────────────────────────────────────────
  if (phase === "confirmed") {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-amazon-card-dark rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-amazon-success-light dark:text-amazon-success-dark" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Order Placed!</h2>
          <p className="text-gray-400 text-sm mb-5 font-mono">{orderId}</p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-2xl p-5 mb-5">
            <p className="text-4xl font-bold text-amazon-success-light dark:text-amazon-success-dark">{eta} min</p>
            <p className="text-sm text-green-700 dark:text-green-400 font-medium mt-1">Estimated delivery</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Total paid: <span className="font-semibold text-gray-900 dark:text-white">₹{totalRupees}</span>
          </p>
          <button
            onClick={onClose}
            className="w-full bg-amazon-blue text-white py-4 rounded-2xl font-bold text-base hover:bg-amazon-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Track Order
          </button>
        </div>
      </div>
    );
  }

  // ── Order review (slide-up drawer) ─────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-amazon-card-dark rounded-t-3xl w-full max-w-lg px-6 pt-6 pb-8 shadow-2xl animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-amazon-surface-dark flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 dark:bg-amazon-surface-dark rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white flex-shrink-0">
                ₹{Math.round((item.price * item.quantity) / 100)}
              </p>
            </div>
          ))}
        </div>

        {/* Total + ETA */}
        <div className="border-t border-gray-100 dark:border-amazon-border-dark pt-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRupees}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Delivery</p>
            <p className="text-2xl font-bold text-amazon-success-light dark:text-amazon-success-dark">{eta} min</p>
          </div>
        </div>

        {/* Order button */}
        <button
          onClick={handleOrderNow}
          className="w-full bg-amazon-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-amazon-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Order Now</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
            <MapPin className="w-3 h-3" /> Saved address
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
            <CreditCard className="w-3 h-3" /> Saved card
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
            <Shield className="w-3 h-3" /> Secured
          </div>
        </div>
      </div>
    </div>
  );
}
