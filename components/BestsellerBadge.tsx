"use client";
export default function BestsellerBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide bg-[#E67A00] text-white">
      #1 Best Seller
    </span>
  );
}
