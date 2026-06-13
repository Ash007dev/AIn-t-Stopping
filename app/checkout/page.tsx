// app/checkout/page.tsx — Checkout Confirmation
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { computeCartTotal, getMaxEta, generateOrderId } from "@/lib/cart-utils";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppStore((s) => s.cart);
  const occasionTitle = useAppStore((s) => s.occasionTitle);
  const clearCart = useAppStore((s) => s.clearCart);
  const addToHistory = useAppStore((s) => s.addToHistory);

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [finalEta, setFinalEta] = useState(0);

  useEffect(() => {
    if (cart.length === 0 && !orderConfirmed) {
      router.replace("/cart");
    }
  }, [cart, orderConfirmed, router]);

  useEffect(() => {
    if (orderConfirmed && orderId) {
      // Record purchase history
      addToHistory({
        orderId,
        occasionTitle,
        cartSnapshot: JSON.parse(JSON.stringify(cart)),
        createdAt: new Date().toISOString(),
      });
      // Clear cart
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderConfirmed]);

  const total = computeCartTotal(cart);
  const maxEta = getMaxEta(cart);

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    setFinalEta(maxEta); // Capture before cart clears
    setTimeout(() => {
      const id = generateOrderId();
      setOrderId(id);
      setIsPlacing(false);
      setOrderConfirmed(true);
    }, 1500);
  };

  if (orderConfirmed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-amazon-secondaryBg-light dark:bg-amazon-secondaryBg-dark">
        <div className="bg-white dark:bg-amazon-card-dark p-8 rounded-card border border-amazon-border-light dark:border-amazon-border-dark shadow-medium max-w-lg w-full">
          <div className="flex items-center gap-3 mb-6 border-b border-amazon-border-light dark:border-amazon-border-dark pb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-amazon-success-light dark:text-amazon-success-dark flex-shrink-0">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-amazon-success-light dark:text-amazon-success-dark">Order placed, thank you!</h1>
              <p className="text-sm text-amazon-text-primary-light dark:text-amazon-text-primary-dark">Confirmation will be sent to your email.</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-sm text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark font-bold">Order Number</span>
              <span className="text-sm font-medium text-[#007185] dark:text-[#5EB6C6]">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark font-bold">Estimated Delivery</span>
              <span className="text-sm font-bold text-amazon-success-light dark:text-amazon-success-dark">{finalEta} minutes</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full py-2 rounded-button text-sm bg-[#F7F8FA] dark:bg-[#2B3645] hover:bg-[#E3E6E6] dark:hover:bg-[#3A4553] text-amazon-text-primary-light dark:text-amazon-text-primary-dark border border-[#D5D9D9] dark:border-[#3A4553] shadow-subtle transition-colors font-medium"
          >
            Review or edit your recent orders
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-6 bg-amazon-secondaryBg-light dark:bg-amazon-secondaryBg-dark pb-40">
      <div className="max-w-[1000px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-medium text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-6">
          Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="bg-white dark:bg-amazon-card-dark rounded-card p-5 sm:p-6 shadow-sm border border-amazon-border-light dark:border-amazon-border-dark">
              <h2 className="text-xl font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-4">1 &nbsp; Review items and delivery</h2>
              <div className="border border-amazon-border-light dark:border-amazon-border-dark rounded p-4 mb-4">
                <h3 className="font-bold text-amazon-success-light dark:text-amazon-success-dark mb-1">Guaranteed delivery in {maxEta} mins</h3>
                <p className="text-sm text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark mb-4">Items shipped from Amazon Now</p>
                
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded border border-[#E3E6E6] p-1 flex-shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark truncate">{item.name}</p>
                        <p className="text-sm text-[#B12704] dark:text-[#FF6B6B] font-bold">₹{item.price}</p>
                        <p className="text-xs text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-white dark:bg-amazon-card-dark rounded-card p-5 shadow-sm border border-amazon-border-light dark:border-amazon-border-dark sticky top-6">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full py-2.5 rounded-button text-sm bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shadow-subtle transition-all font-medium mb-3 flex justify-center items-center gap-2"
              >
                {isPlacing ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-[#0F1111]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="20" /></svg>
                    Processing...
                  </>
                ) : (
                  "Place your order"
                )}
              </button>
              
              <p className="text-xs text-center text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark border-b border-amazon-border-light dark:border-amazon-border-dark pb-4 mb-4">
                By placing your order, you agree to Amazon's privacy notice and conditions of use.
              </p>

              <h3 className="font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-3">Order Summary</h3>
              
              <div className="space-y-1.5 text-sm text-amazon-text-primary-light dark:text-amazon-text-primary-dark border-b border-amazon-border-light dark:border-amazon-border-dark pb-3 mb-3">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>₹0.00</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-[#B12704] dark:text-[#FF6B6B]">Order Total:</span>
                <span className="font-bold text-[#B12704] dark:text-[#FF6B6B]">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
