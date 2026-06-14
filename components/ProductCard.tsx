"use client";
import { CartProduct } from "@/lib/types";
import StarRating from "./StarRating";
import AlternativeCard from "./AlternativeCard";

interface ProductCardProps {
  product: CartProduct;
  index: number;
  onSwitch: (cardIndex: number, alternativeId: string) => void;
  highlighted?: boolean;
  onAdd?: () => void;
}

const DARK_STORE_NAMES: Record<string, string> = {
  "DS-North": "North Fulfillment Center - 1.2km",
  "DS-Central": "Central Dark Store - 2.8km",
  "DS-East": "East Fulfillment Hub - 4.1km",
};

export default function ProductCard({ product, index, onSwitch, highlighted, onAdd }: ProductCardProps) {
  const lineTotal = (typeof product.price === "number" ? product.price : 0) * (typeof product.quantity === "number" ? product.quantity : 1);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-[#1A2332] ${
        highlighted
          ? "border-orange-400 shadow-lg ring-2 ring-orange-300 ring-offset-2"
          : "border-gray-200 dark:border-[#3A4553] hover:shadow-md"
      }`}
    >
      {/* Main content */}
      <div className="p-5 flex gap-4">
        {/* Product Image */}
        <div className="w-28 h-28 flex-shrink-0 bg-gray-50 dark:bg-[#0F1923] rounded-xl border border-gray-100 dark:border-[#2B3645] flex items-center justify-center p-2">
          <img
            src={product.image_url}
            alt={product.name}
            className="max-w-full max-h-full object-contain mix-blend-multiply"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{product.brand}</p>

            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={product.rating} />
              <span className="text-sm text-[#007185] dark:text-[#5EB6C6] cursor-pointer hover:underline">
                {product.review_count.toLocaleString()} ratings
              </span>
              {product.is_bestseller && (
                <span className="inline-flex items-center gap-0.5 text-xs text-orange-600 dark:text-orange-400 font-medium ml-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  Top Seller
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{Math.floor(product.price)}</span>
              {product.price % 1 > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">{(product.price % 1).toFixed(2).substring(1)}</span>
              )}
            </div>
            {product.quantity > 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Qty: {product.quantity} · Total: <span className="font-semibold text-gray-700 dark:text-gray-300">₹{lineTotal.toFixed(0)}</span>
              </p>
            )}
            {product.quantity === 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Qty: 1</p>
            )}

            {/* Delivery/stock indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${product.in_stock ? "bg-green-500" : "bg-red-400"}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.in_stock ? `In stock · Arrives in ${product.eta_minutes} min` : "Currently unavailable"}
              </span>
            </div>

            {/* Dark store badge */}
            {product.dark_store && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-xs text-gray-400">Ships from {DARK_STORE_NAMES[product.dark_store] || product.dark_store}</span>
              </div>
            )}

            {/* Return policy badge */}
            {product.return_policy && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1.5 ${
                product.return_policy === "no_return"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : product.return_policy === "free_returns"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              }`}>
                {product.return_policy === "no_return" && "No returns - perishable"}
                {product.return_policy === "7_day_return" && "7-day returns eligible"}
                {product.return_policy === "free_returns" && "Free returns"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Why this? section */}
      {product.ai_reasoning && (
        <div className="px-5 pb-4">
          <div className="p-3 bg-gray-50 dark:bg-[#0F1923] rounded-lg border-l-[3px] border-orange-400">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 text-xs font-semibold uppercase tracking-wide flex-shrink-0 mt-0.5">Why this?</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{product.ai_reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Other options or Add Button */}
      {onAdd ? (
        <div className="px-5 pb-4">
          <button
            onClick={onAdd}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold py-2.5 px-4 rounded-xl text-sm border border-[#FCD200] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      ) : (
        product.alternatives && product.alternatives.length > 0 && (
          <div className="px-5 pb-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Other options</p>
            <div className="space-y-2">
              {product.alternatives.slice(0, 2).map((alt) => (
                <AlternativeCard
                  key={alt.id}
                  product={alt}
                  onSwitch={() => onSwitch(index, alt.id)}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
