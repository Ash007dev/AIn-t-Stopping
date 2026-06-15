// components/StickyCartBar.tsx - Mobile sticky bottom cart bar (Amazon exact)
'use client';
import { useRouter } from 'next/navigation';

export default function StickyCartBar({ total, itemCount, eta }: { total: number; itemCount: number; eta: number }) {
  const router = useRouter();
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                    bg-white border-t-2 border-[#FF9900]">
      {/* Top info row */}
      <div className="px-4 py-1.5 bg-[#FFF8F0] border-b border-[#FFD095]">
        <p className="text-[11px] text-[#565959] text-center">
          Estimated delivery: <strong className="text-[#0F1111]">{eta} minutes</strong>
        </p>
      </div>

      {/* Bottom action row */}
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="flex-1">
          <p className="text-[16px] font-bold text-[#0F1111]">₹{total.toFixed(0)}</p>
          <p className="text-[12px] text-[#565959]">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          className="flex-shrink-0 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]
                     font-bold text-[15px] px-8 py-3 rounded-lg border border-[#FCD200]
                     transition-colors"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
