// app/cart/page.tsx - Smart Cart Page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { CartDiff } from "@/lib/types";
import { computeCartTotal, getMaxEta, formatPrice } from "@/lib/cart-utils";
import { resolveRegion } from "@/lib/region-map";
import ProductCard from "@/components/ProductCard";
import RegionalCard from "@/components/RegionalCard";
import ModificationBar from "@/components/ModificationBar";

const DARK_STORE_DISPLAY: Record<string, { name: string; distance: string }> = {
  "DS-North": { name: "Amazon Dark Store North", distance: "1.2km" },
  "DS-Central": { name: "Amazon Dark Store Central", distance: "2.8km" },
  "DS-East": { name: "Amazon Dark Store East", distance: "4.1km" },
};

export default function CartPage() {
  const router = useRouter();
  const cart = useAppStore((s) => s.cart);
  const regionalProducts = useAppStore((s) => s.regionalProducts);
  const occasionTitle = useAppStore((s) => s.occasionTitle);
  const parsedIntent = useAppStore((s) => s.parsedIntent);
  const switchProduct = useAppStore((s) => s.switchProduct);
  const applyDiff = useAppStore((s) => s.applyDiff);
  const addSuggestionToCart = useAppStore((s) => s.addSuggestionToCart);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  const isAddonMode = parsedIntent?.mode_override === "addon" ||
    useAppStore.getState().selectedMode === "addon";

  // Only split into suggestions in addon mode; in cooking/intent mode all items are main cart items
  const mainItems = isAddonMode
    ? cart.filter((p) => !p.is_suggestion)
    : cart;                                    // everything is a real cart item
  const suggestedItems = isAddonMode
    ? cart.filter((p) => p.is_suggestion)
    : [];                                      // no suggestions in non-addon mode

  const total = computeCartTotal(mainItems);
  const itemCount = mainItems.reduce((sum, i) => sum + i.quantity, 0);
  const maxEta = getMaxEta(mainItems);

  // Get region for regional section header
  let regionName: string | null = null;
  try {
    const profile = JSON.parse(localStorage.getItem("household_profile") || "{}");
    regionName = resolveRegion(profile.pinCode || "");
  } catch {}

  // Compute dark store summary from cart items
  const darkStoreGroups = new Map<string, number>();
  for (const item of mainItems) {
    const storeId = item.dark_store || "DS-Central";
    darkStoreGroups.set(storeId, (darkStoreGroups.get(storeId) || 0) + 1);
  }
  const darkStoreSummary = Array.from(darkStoreGroups.entries()).map(([storeId, count]) => ({
    store_id: storeId,
    item_count: count,
    ...(DARK_STORE_DISPLAY[storeId] || { name: storeId, distance: "?" }),
  }));

  const handleApplyDiff = (diff: CartDiff) => {
    applyDiff(diff);
    const affectedIds = new Set<string>([
      ...diff.remove,
      ...diff.modify.map((m) => m.id),
      ...diff.add.map((a) => a.product?.id || a.id || ""),
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
          {/* Predictive mode header */}
          {parsedIntent?.mode_override === "predictive" && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">AI-curated essentials kit</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Every item in this kit was chosen specifically for your situation. Remove anything you already have.
                </p>
              </div>
            </div>
          )}

          {/* Dark store delivery banner */}
          {darkStoreSummary.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    {darkStoreSummary.length === 1
                      ? `All items from ${darkStoreSummary[0].name}`
                      : `Consolidated delivery from ${darkStoreSummary.length} nearby stores`}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    {darkStoreSummary.length === 1
                      ? `${darkStoreSummary[0].distance} away - arriving together`
                      : darkStoreSummary.map(s => `${s.item_count} item${s.item_count > 1 ? 's' : ''} from ${s.distance}`).join(', ') + ' - all arriving together'}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              {mainItems.map((product, index) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard
                    product={product}
                    index={index}
                    onSwitch={switchProduct}
                    highlighted={highlightedIds.has(product.id)}
                  />
                  {index < mainItems.length - 1 && (
                    <div className="border-b border-amazon-border-light dark:border-amazon-border-dark mt-6" />
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-amazon-border-light dark:border-amazon-border-dark mt-6 pt-4 flex justify-end">
              <div className="text-lg">
                Subtotal ({itemCount} items): <span className="font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Suggested Add-ons section */}
          {suggestedItems.length > 0 && (
            <div className="bg-white dark:bg-amazon-card-dark rounded-card p-4 sm:p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark">
                  Suggested Add-ons
                </h2>
                <span className="text-xs bg-gray-100 dark:bg-[#2B3645] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  Customers who bought this also got
                </span>
              </div>
              <div className="space-y-6">
                {suggestedItems.map((product, index) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <ProductCard
                      product={product}
                      index={index}
                      onSwitch={switchProduct}
                      highlighted={highlightedIds.has(product.id)}
                      onAdd={() => addSuggestionToCart(product.id)}
                    />
                    {index < suggestedItems.length - 1 && (
                      <div className="border-b border-amazon-border-light dark:border-amazon-border-dark mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div className="sticky top-20 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-[#3A4553] rounded-2xl p-5">
            {/* Free delivery badge */}
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 mb-4 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Eligible for FREE Delivery
            </div>

            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal ({itemCount} items)</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Incl. all taxes · Free delivery</p>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-xl text-sm transition-colors"
            >
              Proceed to Buy
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Estimated fastest delivery: <span className="font-semibold text-gray-600 dark:text-gray-300">{maxEta} minutes</span>
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">
              This order contains AI-curated products. Please review quantities before purchase.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
