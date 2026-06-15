"use client";
import { Product } from "@/lib/types";
import StarRating from "./StarRating";
import BestsellerBadge from "./BestsellerBadge";

interface RegionalCardProps {
  product: Product;
}

export default function RegionalCard({ product }: RegionalCardProps) {
  return (
    <div className="flex flex-col p-4 bg-amazon-card-light dark:bg-amazon-card-dark border border-amazon-border-light dark:border-amazon-border-dark rounded-card hover:shadow-medium transition-shadow cursor-pointer">
      <div className="w-full h-32 bg-white rounded mb-3 flex items-center justify-center p-2 relative">
        {/* Product images may come from dynamic third-party URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
        <div className="absolute top-0 left-0">
          <BestsellerBadge show={product.is_bestseller} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#007185] dark:text-[#5EB6C6] line-clamp-2 hover:underline hover:text-[#C7511F] dark:hover:text-[#E47911]">
          {product.brand} {product.name}
        </p>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <StarRating rating={product.rating} />
        <span className="text-xs text-[#007185] dark:text-[#5EB6C6] hover:underline">
          {product.review_count.toLocaleString()}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xs align-top text-amazon-text-primary-light dark:text-amazon-text-primary-dark mt-1">₹</span>
        <span className="text-xl font-medium text-amazon-text-primary-light dark:text-amazon-text-primary-dark">{Math.floor(product.price)}</span>
        <span className="text-xs align-top text-amazon-text-primary-light dark:text-amazon-text-primary-dark mt-1">{(product.price % 1).toFixed(2).substring(1)}</span>
      </div>
      <p className="text-xs text-amazon-text-secondary-light dark:text-amazon-text-secondary-dark mt-1">
        Delivery in <span className="font-bold">{product.eta_minutes} mins</span>
      </p>
      <button className="mt-3 w-full py-1.5 rounded-button text-sm bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] shadow-subtle transition-all font-medium">
        Add to Cart
      </button>
    </div>
  );
}
