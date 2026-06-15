// components/CartSummaryPanel.tsx - Desktop right sidebar (Amazon exact)
'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { computeCartTotal, getMaxEta } from '@/lib/cart-utils';

export default function CartSummaryPanel() {
  const router = useRouter();
  const cart = useAppStore(s => s.cart);
  const main = cart.filter(i => !i.is_suggestion);
  const subtotal = computeCartTotal(main);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const eta = getMaxEta(main) || 16;

  return (
    <div className="border border-[#D5D9D9] rounded p-4 bg-white sticky top-[140px]">
      {/* Free delivery badge */}
      <div className="flex items-center gap-2 text-[#007600] bg-[#F0FFF0]
                      border border-[#B7DFB7] rounded px-3 py-2 mb-3 text-[13px] font-medium">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007600" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Eligible for FREE Delivery
      </div>

      {/* Line items */}
      <div className="space-y-2 mb-3">
        {main.map(item => (
          <div key={item.id} className="flex justify-between text-[13px]">
            <span className="text-[#565959] truncate flex-1 mr-2">
              {item.name.split(' ').slice(0,3).join(' ')} ×{item.quantity}
            </span>
            <span className="text-[#0F1111] font-medium flex-shrink-0">
              ₹{(item.price < 1000 ? item.price * item.quantity : Math.round(item.price * item.quantity / 100)).toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-[#D5D9D9] pt-3 space-y-1 mb-3">
        <div className="flex justify-between text-[13px] text-[#565959]">
          <span>Subtotal ({main.length} items):</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#565959]">
          <span>Delivery:</span>
          <span className="text-[#007600] font-medium">FREE</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#565959]">
          <span>Tax (5%):</span>
          <span>₹{tax}</span>
        </div>
      </div>

      <div className="border-t border-[#D5D9D9] pt-3 mb-4">
        <div className="flex justify-between">
          <span className="text-[16px] font-bold text-[#0F1111]">Order Total:</span>
          <span className="text-[16px] font-bold text-[#CC0C39]">₹{total.toFixed(0)}</span>
        </div>
      </div>

      {/* ETA */}
      <div className="flex items-center gap-1.5 text-[13px] text-[#565959] mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        Estimated fastest delivery:
        <span className="font-bold text-[#0F1111]">{eta} minutes</span>
      </div>

      {/* Proceed button - Amazon yellow */}
      <button
        onClick={() => router.push('/checkout')}
        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold
                   text-[15px] py-3 rounded-lg border border-[#FCD200] transition-colors"
      >
        Proceed to Buy
      </button>

      <p className="text-[11px] text-[#8C9296] text-center mt-3 leading-snug">
        This order contains AI-curated products.
        Please review quantities before purchase.
      </p>
    </div>
  );
}
