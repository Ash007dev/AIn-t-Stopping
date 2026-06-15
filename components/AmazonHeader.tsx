// components/AmazonHeader.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Mic } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function AmazonHeader() {
  const router = useRouter();
  const cart = useAppStore((s) => s.cart);
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-border-light shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
        
        {/* Left: ETA Badge + Logo */}
        <div className="flex items-center gap-4">
          <div className="bg-badge-eta-bg border border-badge-eta-border rounded-md px-2.5 py-1 flex items-center gap-1">
            <span className="text-badge-eta-text text-[13px] font-bold">⚡ 14 mins</span>
          </div>
          
          <Link href="/" className="flex items-center" aria-label="Amazon Intent Home">
            <div className="flex flex-col leading-none pt-1">
              <span className="text-[18px] font-normal text-text-primary tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                amazon
              </span>
              <span className="text-[14px] font-bold text-amazon-orange tracking-tight -mt-0.5">
                intent
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex">
          <button
            onClick={() => router.push("/nowspeak")}
            className="flex-1 flex items-center bg-white border-2 border-amazon-orange rounded-l-[4px] h-[40px] px-3 focus:outline-none focus:ring-2 focus:ring-amazon-orange/20"
          >
            <Search className="w-5 h-5 text-amazon-orange mr-2" />
            <span className="text-text-muted text-[14px] font-normal">Search for &quot;Atta&quot;</span>
          </button>
          <button
            onClick={() => router.push("/nowspeak")}
            className="bg-[#F3A847] hover:bg-amazon-orange-dk text-white h-[40px] px-4 rounded-r-[4px] flex items-center justify-center transition-colors"
            title="NowSpeak - Voice Assistant"
          >
            <Mic className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Right: Cart */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-1 p-1 hover:bg-bg-hover rounded transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="w-8 h-8 text-text-primary" />
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-amazon-orange text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <div className="flex flex-col items-start ml-1 hidden sm:flex">
              <span className="text-text-primary font-bold text-[14px] leading-tight">
                ₹{Math.round(cartTotal / 100)}
              </span>
              <span className="text-amazon-orange font-bold text-[13px] leading-tight mt-0.5">
                Proceed
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Search Bar (shows below header on small screens) */}
      <div className="md:hidden px-4 pb-2 bg-white flex items-center">
        <button
          onClick={() => router.push("/nowspeak")}
          className="flex-1 flex items-center bg-white border-2 border-amazon-orange border-r-0 rounded-l-[4px] h-[36px] px-3 focus:outline-none"
        >
          <Search className="w-4 h-4 text-amazon-orange mr-2" />
          <span className="text-text-muted text-[13px] font-normal">Search for &quot;Atta&quot;</span>
        </button>
        <button
          onClick={() => router.push("/nowspeak")}
          className="bg-[#F3A847] hover:bg-amazon-orange-dk text-white h-[36px] px-3 rounded-r-[4px] flex items-center justify-center transition-colors border-2 border-amazon-orange border-l-0"
        >
          <Mic className="w-4 h-4 text-gray-900" />
        </button>
      </div>

      {/* Address Bar */}
      <div className="bg-bg-light px-4 py-1 flex items-center text-[12px] text-text-secondary border-t border-border-light">
        <span className="font-bold text-text-primary mr-1">⚡ 14 mins</span>
        <span>· Deliver to Coimbatore 641002 ▾</span>
      </div>
    </header>
  );
}
