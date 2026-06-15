// components/FloatingCartButton.tsx - Floating cart button, bottom-right
'use client';
import { ShoppingCart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function FloatingCartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const cart = useAppStore(s => s.cart);

  const mainItems = cart.filter(i => !i.is_suggestion);
  const itemCount = mainItems.reduce((s, i) => s + i.quantity, 0);
  const total = mainItems.reduce((s, i) => {
    const price = i.price < 1000 ? i.price : Math.round(i.price / 100);
    return s + price * i.quantity;
  }, 0);

  // Hide on cart page, checkout, or nowspeak - and when cart is empty
  if (itemCount === 0 || pathname === '/cart' || pathname === '/checkout' || pathname === '/nowspeak') {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/cart')}
      className="fixed bottom-6 right-4 z-50 bg-[#FF9900] hover:bg-[#E47911]
                 text-white shadow-lg rounded-full flex items-center gap-2
                 pl-4 pr-5 py-3 transition-all duration-300
                 hover:shadow-xl active:scale-95
                 animate-fade-in"
      aria-label="View cart"
    >
      <div className="relative">
        <ShoppingCart size={20} strokeWidth={2} />
        <span className="absolute -top-2 -right-2 bg-white text-[#FF9900] text-[9px]
                         font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      </div>
      <span className="text-[14px] font-bold">₹{total}</span>
    </button>
  );
}
