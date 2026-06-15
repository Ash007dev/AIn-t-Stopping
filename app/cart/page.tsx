// app/cart/page.tsx — Smart Cart page (Amazon Now pixel-perfect)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import CartSummaryPanel from '@/components/CartSummaryPanel';
import StickyCartBar from '@/components/StickyCartBar';
import ModificationBar from '@/components/ModificationBar';
import { computeCartTotal, getMaxEta } from '@/lib/cart-utils';

export default function CartPage() {
  const router = useRouter();
  const cart = useAppStore(s => s.cart);
  const occasionTitle = useAppStore(s => s.occasionTitle);
  const applyDiff = useAppStore(s => s.applyDiff);
  const modificationError = useAppStore(s => s.modificationError);
  const setModificationError = useAppStore(s => s.setModificationError);

  const mainItems = cart.filter(i => !i.is_suggestion);
  const suggestions = cart.filter(i => i.is_suggestion);

  const [highlighted, setHighlighted] = useState<string[]>([]);

  if (!cart.length) {
    return (
      <main className="bg-[#F0F2F2] min-h-screen pb-32">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-[#0F1111] mb-3">Your cart is empty</h2>
            <p className="text-[#565959] mb-6">Tell us what you need and we will build the perfect cart for you.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold
                         px-8 py-3 rounded-lg border border-[#FCD200] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  const eta = getMaxEta(mainItems) || 16;
  const total = computeCartTotal(mainItems);

  async function handleModification(text: string) {
    setModificationError(null);
    try {
      const res = await fetch('/api/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modificationText: text, currentCart: mainItems }),
      });
      const diff = await res.json();
      if (diff.error) { setModificationError(diff.error); return; }

      const changedIds = [
        ...(diff.remove || []),
        ...(diff.modify || []).map((m: { id: string }) => m.id),
        ...(diff.add || []).map((a: { product?: { id: string }; id?: string }) => a.product?.id || a.id),
      ].filter(Boolean) as string[];
      setHighlighted(changedIds);
      setTimeout(() => setHighlighted([]), 2500);
      applyDiff(diff);
    } catch {
      setModificationError('Could not process. Try rephrasing — e.g. "Remove the Pepsi"');
    }
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-72 lg:pb-32">
      <Navbar />

      {/* Sticky top bar */}
      <div className="sticky top-[88px] z-40 bg-white border-b border-[#D5D9D9]
                      flex items-center gap-3 px-4 py-2">
        <button onClick={() => router.back()}
                className="text-[#007185] text-[14px] font-medium flex-shrink-0">
          ← Edit
        </button>

        <span className="text-[15px] font-semibold text-[#0F1111] flex-1 truncate">
          {occasionTitle || 'Your Cart'}
        </span>

        {/* ETA badge */}
        <div className="flex-shrink-0 flex items-center gap-1 bg-[#FFD100] text-black
                        font-bold text-[12px] px-2.5 py-1 rounded-md">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="black">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          {eta} mins
        </div>

        <span className="text-[13px] text-[#565959] flex-shrink-0 hidden sm:block">
          {mainItems.length} items · ₹{total.toFixed(0)}
        </span>
      </div>

      {/* Dark store banner */}
      <div className="bg-[#EAF5FF] border-b border-[#C6E4FF] px-4 py-2">
        <p className="flex items-center gap-1 text-[12px] text-[#004B6E]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#565959" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
          </svg>
          All items from Amazon Dark Store North - <button onClick={() => router.push('/darkstores')} className="text-[#007185] hover:underline ml-1">View nearby stores</button>
        </p>
      </div>

      {/* Main grid + sidebar */}
      <div className="max-w-screen-xl mx-auto lg:flex lg:items-start lg:gap-6 lg:px-4 lg:py-4">

        {/* Left: product grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                          gap-[1px] bg-[#D5D9D9] border-x border-[#D5D9D9]">
            {mainItems.map(item => (
              <ProductCard
                key={item.id}
                product={item}
                highlightBorder={highlighted.includes(item.id)}
              />
            ))}
          </div>

          {/* Suggested add-ons */}
          {suggestions.length > 0 && (
            <section className="mt-4 border-t border-[#D5D9D9] pt-4">
              <div className="px-4">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[15px] font-bold text-[#0F1111]">Suggested Add-ons</h3>
                  <span className="text-[12px] text-[#565959] bg-[#F0F2F2] px-2 py-0.5 rounded-full">
                    Customers who bought this also got
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-[1px] bg-[#D5D9D9] border border-[#D5D9D9]">
                  {suggestions.map(item => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right: cart summary (desktop only) */}
        <div className="hidden lg:block lg:w-[380px] flex-shrink-0">
          <CartSummaryPanel />
        </div>
      </div>

      {/* Modification bar */}
      <ModificationBar onModify={handleModification} error={modificationError} />

      {/* Mobile sticky bottom cart bar */}
      <StickyCartBar total={total} itemCount={mainItems.length} eta={eta} />

    </main>
  );
}
