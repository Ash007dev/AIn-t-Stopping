"use client";
import { Product } from "@/lib/types";
import StarRating from "./StarRating";
import { getProductImage, getProductEmoji, getProductTint } from "@/lib/productImage";

interface AlternativeCardProps {
  product: Product;
  onSwitch: () => void;
}

export default function AlternativeCard({ product, onSwitch }: AlternativeCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white dark:bg-[#1E2530] border border-[#D5D9D9] dark:border-[#3A4553] rounded-md hover:bg-[#F7F8FA] dark:hover:bg-[#2B3645] transition-colors">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 flex-shrink-0 rounded p-1 flex items-center justify-center" style={{ backgroundColor: getProductTint(product) }}>
          {getProductImage(product) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getProductImage(product) as string} alt={product.name} className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-[24px] leading-none" role="img" aria-label={product.name}>{getProductEmoji(product)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#007185] dark:text-[#5EB6C6] truncate hover:underline hover:text-[#C7511F] dark:hover:text-[#E47911] cursor-pointer">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={product.rating} />
            <span className="text-sm text-amazon-error-light dark:text-amazon-error-dark">
              ₹{product.price}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onSwitch}
        className="w-full sm:w-auto px-3 py-1.5 rounded-button text-sm bg-white dark:bg-[#232F3E] text-amazon-text-primary-light dark:text-amazon-text-primary-dark border border-[#D5D9D9] dark:border-[#8D98A6] hover:bg-[#F7F8FA] dark:hover:bg-[#3A4553] shadow-subtle transition-all font-medium whitespace-nowrap"
      >
        Switch to this
      </button>
    </div>
  );
}
