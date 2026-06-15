// app/checkout/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Zap, CheckCircle2 } from "lucide-react";

import { Button, Pill, Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { mockScenarios } from "@/data/mockCart";

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const PAYMENT_METHODS = ["UPI", "Credit / Debit Card", "Cash on Delivery"];

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("scenario") ?? "movie-night";
  const mockScenario = mockScenarios[slug] ?? mockScenarios["movie-night"];

  const storeCart = useAppStore((s) => s.cart);
  const storeTitle = useAppStore((s) => s.occasionTitle);

  // Use real AI cart if available, otherwise fallback to mock scenario
  const scenario = storeCart.length > 0
    ? {
        ...mockScenario,
        occasionTitle: storeTitle || mockScenario.occasionTitle,
        products: storeCart,
      }
    : mockScenario;

  const total = scenario.products.reduce((s, p) => s + p.price * p.quantity, 0);
  const tax = Math.round(total * 0.05);
  const grandTotal = total + tax;

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      // Generate a mock order ID
      setOrderId(`#IC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsPlacingOrder(false);
      setOrderPlaced(true);
      
      // If we were using the store, we might want to clear it or record the purchase
      // but for this UI, we just show the success state.
    }, 1200);
  };

  // ── Success State ──
  if (orderPlaced) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0a0a0a" }}>
        <div className="w-full max-w-[400px] flex flex-col items-center text-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 150,
              duration: 0.6
            }}
            className="flex items-center justify-center w-24 h-24 rounded-full"
            style={{ background: "rgba(34,197,94,0.15)" }}
          >
            <CheckCircle2 size={48} className="text-[#22C55E]" />
          </motion.div>
          
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Order placed!
            </h2>
            <p className="text-[#A0A0A0]">
              Order {orderId}
            </p>
          </div>

          <Pill variant="orange" className="mt-2 text-sm px-4 py-2">
            <Zap size={14} /> Arriving in {scenario.eta} mins
          </Pill>

          <Button 
            variant="secondary" 
            className="w-full mt-6 rounded-full py-3 font-semibold"
            onClick={() => router.push("/")}
          >
            Back to home
          </Button>
        </div>
      </main>
    );
  }

  // ── Checkout Form ──
  return (
    <main className="min-h-screen pb-32 pt-8 px-4" style={{ background: "#0a0a0a" }}>
      <div className="max-w-[640px] mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[14px] text-[#666666] hover:text-[#A0A0A0] transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to cart
          </button>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>Checkout</h1>
        </div>

        {/* Delivery Details */}
        <section>
          <h2 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Delivery Details
          </h2>
          <Card className="p-4 rounded-[16px] flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <MapPin size={16} className="text-[#E8170A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Home</p>
                  <p className="text-[13px] text-[#A0A0A0] mt-0.5 leading-relaxed">
                    42 Main St, Coimbatore,<br />
                    Tamil Nadu - 641001
                  </p>
                </div>
              </div>
              <button className="text-xs font-semibold text-[#E8170A] hover:underline">
                Edit
              </button>
            </div>
            <div className="pt-3 mt-1" style={{ borderTop: "1px solid #1f1f1f" }}>
              <Pill variant="orange">
                <Zap size={10} /> Arriving in {scenario.eta} mins
              </Pill>
            </div>
          </Card>
        </section>

        {/* Order Summary */}
        <section>
          <h2 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Order Summary
          </h2>
          <Card className="p-5 rounded-[16px] flex flex-col gap-4">
            {/* Line items */}
            <div className="flex flex-col gap-2.5">
              {scenario.products.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 text-[13px]">
                  <span className="text-[#A0A0A0] line-clamp-2 flex-1">
                    {p.quantity} × {p.name}
                  </span>
                  <span className="text-white font-medium shrink-0">
                    {formatPrice(p.price * p.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #1f1f1f" }} className="pt-3 flex flex-col gap-2">
              <div className="flex justify-between text-[13px] text-[#A0A0A0]">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#A0A0A0]">
                <span>Delivery</span><span className="text-[#22C55E]">₹0 Free</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#A0A0A0]">
                <span>Tax (5%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold text-white mt-1.5 pt-3" style={{ borderTop: "1px solid #1f1f1f" }}>
                <span>Total</span><span className="text-[#FF9900]">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Payment Method
          </h2>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method}
                className="flex items-center gap-3 p-4 rounded-[12px] cursor-pointer transition-colors"
                style={{
                  background: paymentMethod === method ? "rgba(232,23,10,0.08)" : "#111111",
                  border: `1px solid ${paymentMethod === method ? "#E8170A" : "#1f1f1f"}`,
                }}
              >
                <div
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    border: `5px solid ${paymentMethod === method ? "#E8170A" : "#333333"}`,
                    background: "#1a1a1a" // inner hole color
                  }}
                />
                <span className={`text-sm font-semibold ${paymentMethod === method ? "text-white" : "text-[#A0A0A0]"}`}>
                  {method}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Bottom Sticky Action Bar */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 p-4"
          style={{ 
            background: "rgba(10,10,10,0.9)", 
            backdropFilter: "blur(12px)",
            borderTop: "1px solid #1f1f1f" 
          }}
        >
          <div className="max-w-[640px] mx-auto">
            <Button
              variant="primary"
              loading={isPlacingOrder}
              disabled={isPlacingOrder}
              onClick={handlePlaceOrder}
              className="w-full justify-center text-lg font-bold"
              style={{
                height: "56px",
                borderRadius: "14px",
              }}
            >
              {isPlacingOrder ? "Processing..." : `Place Order — ${formatPrice(grandTotal)}`}
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[#666666]">
          Loading checkout...
        </div>
      }
    >
      <CheckoutPageInner />
    </Suspense>
  );
}
