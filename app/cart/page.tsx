// app/cart/page.tsx — Smart Cart Page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { CartDiff } from "@/lib/types";
import { computeCartTotal, getMaxEta } from "@/lib/cart-utils";
import { resolveRegion } from "@/lib/region-map";
import ProductCard from "@/components/ProductCard";
import RegionalCard from "@/components/RegionalCard";
import ModificationBar from "@/components/ModificationBar";

export default function CartPage() {
  const router = useRouter();
  const cart = useAppStore((s) => s.cart);
  const regionalProducts = useAppStore((s) => s.regionalProducts);
  const occasionTitle = useAppStore((s) => s.occasionTitle);
  const switchProduct = useAppStore((s) => s.switchProduct);
  const applyDiff = useAppStore((s) => s.applyDiff);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  const total = computeCartTotal(cart);
  const maxEta = getMaxEta(cart);

  // Get region for regional section header
  let regionName: string | null = null;
  try {
    const profile = JSON.parse(localStorage.getItem("household_profile") || "{}");
    regionName = resolveRegion(profile.pinCode || "");
  } catch {}

  const handleApplyDiff = (diff: CartDiff) => {
    applyDiff(diff);
    // Highlight affected cards
    const affectedIds = new Set<string>([
      ...diff.remove,
      ...diff.modify.map((m) => m.id),
      ...diff.add.map((a) => a.product.id),
    ]);
    setHighlightedIds(affectedIds);
    setTimeout(() => setHighlightedIds(new Set()), 3000);
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-amazon-secondaryBg-light dark:bg-amazon-secondaryBg-dark">
        <div className="text-center bg-white dark:bg-amazon-card-dark p-10 rounded-card border border-amazon-border-light dark:border-amazon-border-dark shadow-medium max-w-lg w-full">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-amazon-text-muted-light dark:text-amazon-text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-3">Your Amazon Cart is empty</h2>
          <p className="text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark mb-8">Try searching for an occasion or recipe to get started.</p>
          <button
            onClick={() => router.push("/intent")}
            className="w-full py-2.5 rounded-button font-medium bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shadow-subtle transition-all"
          >
            Start Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-40 bg-amazon-secondaryBg-light dark:bg-amazon-secondaryBg-dark">
      {/* Modification bar - Sticky Top */}
      <ModificationBar onApplyDiff={handleApplyDiff} />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 mt-4">
        
        {/* Main Content (Left) */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-amazon-card-dark rounded-card p-4 sm:p-6 mb-6 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-medium text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-1">
              Shopping Cart
            </h1>
            <p className="text-sm text-[#007185] dark:text-[#5EB6C6] mb-4">
              Generated for: <span className="font-medium text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{occasionTitle}</span>
            </p>
            <div className="border-b border-amazon-border-light dark:border-amazon-border-dark mb-4" />
            
            <div className="flex justify-end mb-2">
              <span className="text-sm text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">Price</span>
            </div>

            {/* Product cards */}
            <div className="space-y-6">
              {cart.map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard
                    product={product}
                    index={index}
                    onSwitch={switchProduct}
                    highlighted={highlightedIds.has(product.id)}
                  />
                  {index < cart.length - 1 && (
                    <div className="border-b border-amazon-border-light dark:border-amazon-border-dark mt-6" />
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-amazon-border-light dark:border-amazon-border-dark mt-6 pt-4 flex justify-end">
              <div className="text-lg">
                Subtotal ({cart.length} items): <span className="font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Regional section */}
          {regionalProducts.length > 0 && regionName && (
            <div className="bg-white dark:bg-amazon-card-dark rounded-card p-4 sm:p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-1">
                Frequently bought in {regionName}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {regionalProducts.map((product) => (
                  <RegionalCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Checkout (Right) */}
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="bg-white dark:bg-amazon-card-dark rounded-card p-5 shadow-sm border border-amazon-border-light dark:border-amazon-border-dark sticky top-32">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amazon-success-light dark:text-amazon-success-dark">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-amazon-success-light dark:text-amazon-success-dark font-medium">Eligible for FREE Delivery</span>
            </div>
            
            <div className="text-lg mb-4">
              Subtotal ({cart.length} items): <br/>
              <span className="font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark text-xl">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-2.5 rounded-button text-sm bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shadow-subtle transition-all font-medium mb-4"
            >
              Proceed to Buy
            </button>
            
            <div className="text-xs text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark flex flex-col gap-2">
              <p>Estimated fastest delivery: <span className="font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{maxEta} minutes</span></p>
              <p className="border-t border-amazon-border-light dark:border-amazon-border-dark pt-2">
                This order contains AI-curated products. Please review quantities before purchase.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
