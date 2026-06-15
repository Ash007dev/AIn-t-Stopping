// components/ProductCard.tsx — Pixel-perfect Amazon Fresh product card
'use client';
import { useAppStore } from '@/store/useAppStore';
import StarRating from './StarRating';
import type { CartProduct, Product } from '@/lib/types';

interface ProductCardProps {
  product: Product | CartProduct;
  highlightBorder?: boolean;
}

export default function ProductCard({ product, highlightBorder = false }: ProductCardProps) {
  const cart = useAppStore(s => s.cart);
  const applyDiff = useAppStore(s => s.applyDiff);

  const cartItem = cart.find(i => i.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const isCartProduct = 'ai_reasoning' in product;

  const priceRupees = product.price < 1000 ? product.price : Math.round(product.price / 100);
  const originalPrice = product.original_price
    ? (product.original_price < 1000 ? product.original_price : Math.round(product.original_price / 100))
    : Math.round(priceRupees * 1.25);
  const discountPct = product.discount_percent || Math.round((1 - priceRupees / originalPrice) * 100);
  const isPerishable = product.category === 'fresh produce' || product.category === 'dairy';

  function handleAdd() {
    const newItem: CartProduct = {
      ...product,
      quantity: 1,
      ai_reasoning: '',
      alternatives: [],
    } as CartProduct;
    applyDiff({ add: [{ product: newItem, quantity: 1 }], remove: [], modify: [] });
  }

  function handleIncrement() {
    if (cartItem) {
      applyDiff({ add: [], remove: [], modify: [{ id: product.id, quantity: cartItem.quantity + 1 }] });
    }
  }

  function handleDecrement() {
    if (!cartItem) return;
    if (cartItem.quantity <= 1) {
      applyDiff({ add: [], remove: [product.id], modify: [] });
    } else {
      applyDiff({ add: [], remove: [], modify: [{ id: product.id, quantity: cartItem.quantity - 1 }] });
    }
  }

  return (
    <div className={`bg-white flex flex-col relative
      ${highlightBorder ? 'ring-2 ring-[#FF9900] ring-inset' : ''}`}>

      {/* Discount badge */}
      {discountPct > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-[#CC0C39] text-white
                        text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-tight">
          {discountPct}% OFF
        </div>
      )}

      {/* Bestseller badge */}
      {product.is_bestseller && (
        <div className="absolute top-2 right-2 z-10 bg-[#FF9900] text-white
                        text-[9px] font-bold px-1.5 py-0.5 rounded-sm
                        uppercase tracking-wide leading-tight whitespace-nowrap">
          #1 BEST SELLER
        </div>
      )}

      {/* Product image */}
      <div className="bg-white flex items-center justify-center p-4 h-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url?.startsWith('http') || product.image_url?.startsWith('/placeholder') ? product.image_url : '/placeholder-product.png'}
          alt={product.name}
          className="max-h-36 max-w-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
        />
      </div>

      {/* Product info */}
      <div className="flex flex-col flex-1 px-3 pb-3 pt-2 border-t border-[#D5D9D9]">

        {/* Name */}
        <p className="text-[13px] font-medium text-[#0F1111] leading-snug line-clamp-2 mb-1">
          {product.name}
        </p>

        {/* Weight / variant */}
        <p className="text-[12px] text-[#565959] mb-2">
          {product.serving_size ? `Serves ${product.serving_size}` : '200 g'}
        </p>

        {/* Star rating */}
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[11px] text-[#565959]">
            {product.rating} · {(product.review_count || 0).toLocaleString()}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[16px] font-bold text-[#CC0C39]">
            ₹{priceRupees}
          </span>
          {originalPrice > priceRupees && (
            <span className="text-[12px] text-[#8C9296] line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* AI reasoning */}
        {isCartProduct && (product as CartProduct).ai_reasoning && (
          <p className="text-[11px] text-[#007185] italic mb-2 line-clamp-2 leading-snug">
            {(product as CartProduct).ai_reasoning}
          </p>
        )}

        {/* In cart indicator */}
        {quantity > 0 && (
          <p className="text-[12px] text-[#007600] font-medium mb-2">
            In cart · x{quantity}
          </p>
        )}

        {/* Return policy */}
        {product.category && (
          <p className={`text-[10px] mb-2 ${
            isPerishable ? 'text-[#CC0C39]' : 'text-[#007185]'
          }`}>
            {isPerishable ? 'No returns · perishable' : '7-day returns'}
          </p>
        )}

        {/* Add / stepper button — circular orange */}
        <div className="flex justify-center mt-auto pt-1">
          {quantity === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              className="w-9 h-9 bg-[#FF9900] hover:bg-[#E47911] rounded-full
                         flex items-center justify-center shadow-sm
                         transition-colors active:scale-95"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5"
                      strokeLinecap="round"/>
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#FF9900] rounded-full px-3 py-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
                className="text-white w-5 h-5 flex items-center justify-center
                           text-[18px] font-light leading-none"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-white text-[14px] font-bold min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
                className="text-white w-5 h-5 flex items-center justify-center
                           text-[18px] font-light leading-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
