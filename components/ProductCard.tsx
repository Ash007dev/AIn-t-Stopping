"use client";
import { CartProduct, Product } from "@/lib/types";
import StarRating from "./StarRating";
import BestsellerBadge from "./BestsellerBadge";
import AlternativeCard from "./AlternativeCard";

interface ProductCardProps {
  product: CartProduct;
  index: number;
  onSwitch: (cardIndex: number, alternativeId: string) => void;
  highlighted?: boolean;
}

export default function ProductCard({ product, index, onSwitch, highlighted }: ProductCardProps) {
  const lineTotal = product.price * product.quantity;
  const truncatedReasoning = product.ai_reasoning.length > 160
    ? product.ai_reasoning.slice(0, 157) + "..."
    : product.ai_reasoning;

  return (
    <div className={`rounded-card border transition-shadow duration-200 overflow-hidden bg-amazon-card-light dark:bg-amazon-card-dark text-amazon-text-primary-light dark:text-amazon-text-primary-dark ${
      highlighted
        ? "border-amazon shadow-medium ring-2 ring-amazon ring-offset-2 ring-offset-amazon-background-light dark:ring-offset-amazon-background-dark"
        : "border-amazon-border-light dark:border-amazon-border-dark hover:shadow-medium"
    }`}>
      {/* Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-white rounded flex items-center justify-center p-2 mx-auto sm:mx-0">
          <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain drop-shadow-sm mix-blend-multiply" />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] sm:text-base font-medium leading-snug line-clamp-2 text-[#007185] dark:text-[#5EB6C6] hover:underline cursor-pointer hover:text-[#C7511F] dark:hover:text-[#E47911]">
                {product.brand} {product.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={product.rating} />
              <span className="text-sm text-[#007185] dark:text-[#5EB6C6] cursor-pointer hover:underline hover:text-[#C7511F] dark:hover:text-[#E47911]">
                {product.review_count.toLocaleString()}
              </span>
            </div>
            <div className="mt-1">
              <BestsellerBadge show={product.is_bestseller} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-sm align-top text-amazon-text-primary-light dark:text-amazon-text-primary-dark mt-1">₹</span>
              <span className="text-[28px] leading-none font-medium text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{Math.floor(product.price)}</span>
              <span className="text-sm align-top text-amazon-text-primary-light dark:text-amazon-text-primary-dark mt-1">{(product.price % 1).toFixed(2).substring(1)}</span>
            </div>
            {product.quantity > 1 && (
              <p className="text-sm text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark mt-0.5">
                Total for {product.quantity}: <span className="font-bold">₹{lineTotal.toFixed(2)}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark font-bold">
                Qty: {product.quantity}
              </span>
              <span className="text-xs text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark">
                • Delivery in <span className="font-bold">{product.eta_minutes} mins</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning (Amazon Style "Expert Choice") */}
      <div className="px-4 sm:px-5 pb-3">
        <div className="bg-[#F0F2F2] dark:bg-[#2B3645] p-3 rounded-md border border-[#D5D9D9] dark:border-[#3A4553]">
          <div className="flex items-start gap-2">
            <span className="text-amazon mt-0.5 flex-shrink-0 font-bold text-sm">
              AI Choice
            </span>
            <p className="text-sm text-amazon-text-primary-light dark:text-amazon-text-primary-dark leading-snug">
              {truncatedReasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {product.alternatives.length > 0 && (
        <div className="px-4 sm:px-5 pb-4">
          <p className="text-sm font-bold text-amazon-text-primary-light dark:text-amazon-text-primary-dark mb-2">Similar items to consider</p>
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
      )}
    </div>
  );
}
