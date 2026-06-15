// components/Navbar.tsx — Pixel-perfect Amazon Now header
'use client';
import { useState } from 'react';
import { ShoppingCart, Mic, Home, X, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const cart = useAppStore(s => s.cart);
  const pinCode = useAppStore(s => s.pinCode);
  const setPinCode = useAppStore(s => s.setPinCode);

  const mainItems = cart.filter(i => !i.is_suggestion);
  const itemCount = mainItems.reduce((s, i) => s + i.quantity, 0);

  // Dynamic ETA from cart items
  const maxEta = mainItems.length > 0
    ? Math.max(...mainItems.map(i => i.eta_minutes || 14))
    : null;

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState(pinCode);
  const [query, setQuery] = useState('');

  const isHome = pathname === '/';

  function handlePinSave() {
    if (pinInput.trim().length >= 5) {
      setPinCode(pinInput.trim());
      setShowPinModal(false);
    }
  }

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-[#D5D9D9] shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 max-w-screen-xl mx-auto">

          {/* Home / Back button */}
          {!isHome ? (
            <button
              onClick={() => router.push('/')}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                         hover:bg-[#F0F2F2] transition-colors"
              aria-label="Go home"
            >
              <Home size={20} className="text-[#0F1111]" />
            </button>
          ) : null}

          {/* ETA Badge — dynamic */}
          <div className="flex-shrink-0 flex items-center gap-1 bg-[#FFD100] text-black
                          font-bold text-[12px] px-2.5 py-1.5 rounded-md whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="black">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {maxEta ? `${maxEta} mins` : 'Express'}
          </div>

          {/* Wordmark */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-bold text-[#0F1111] text-[17px] tracking-tight leading-none">amazon</span>
            <span className="block text-[#FF9900] font-bold text-[10px] tracking-widest uppercase -mt-0.5">
              intent
            </span>
          </Link>

          {/* Search bar (desktop) */}
          <form onSubmit={submitSearch} className="flex-1 hidden md:flex items-center border-2 border-[#FF9900] rounded overflow-hidden h-10">
            <button type="submit" className="flex items-center justify-center px-3 bg-[#FF9900] h-full" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search for "Atta", "Milk", "Eggs"...'
              className="flex-1 h-full px-3 text-[14px] text-[#0F1111] outline-none
                         placeholder:text-[#8C9296] bg-white"
            />
            <button
              type="button"
              onClick={() => router.push('/nowspeak')}
              className="flex items-center justify-center px-3 bg-[#F3A847] hover:bg-[#E47911] h-full transition-colors"
              title="Speak to order - NowSpeak Voice Assistant"
            >
              <Mic size={16} className="text-[#0F1111]" />
            </button>
          </form>

          {/* Cart icon */}
          <Link href="/cart" className="flex-shrink-0 relative ml-auto md:ml-0">
            <ShoppingCart size={26} className="text-[#0F1111]" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF9900] text-white text-[10px]
                               font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <ThemeToggle compact />

          {/* Profile */}
          <Link
            href="/profile"
            aria-label="Your account"
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                       hover:bg-[#F0F2F2] transition-colors"
          >
            <User size={22} className="text-[#0F1111]" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-3 pb-2 flex flex-col gap-1">
          <form onSubmit={submitSearch} className="flex items-center border-2 border-[#FF9900] rounded overflow-hidden h-9">
            <button type="submit" className="flex items-center justify-center px-2.5 bg-[#FF9900] h-full" aria-label="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search for "Atta", "Milk"...'
              className="flex-1 h-full px-2.5 text-[13px] text-[#0F1111] outline-none placeholder:text-[#8C9296] bg-white"
            />
            <button
              type="button"
              onClick={() => router.push('/nowspeak')}
              className="flex items-center justify-center px-2.5 bg-[#F3A847] h-full"
              title="Speak to order"
            >
              <Mic size={14} className="text-[#0F1111]" />
            </button>
          </form>
          {/* Mic hint text — Item 13 */}
          <p className="text-[10px] text-[#8C9296] text-center">
            Type to search, or tap the mic to speak your order
          </p>
        </div>

        {/* Delivery address bar — changeable pincode */}
        <div className="bg-[#F0F2F2] border-t border-[#D5D9D9] px-3 py-1.5">
          <button
            onClick={() => { setPinInput(pinCode); setShowPinModal(true); }}
            className="text-[12px] text-[#565959] hover:text-[#007185] transition-colors"
          >
            <span className="font-semibold text-[#0F1111]">
              {maxEta ? `${maxEta} mins` : 'Express'}
            </span>
            {' '}· Deliver to {pinCode}
            <span className="text-[#007185] ml-1">Change</span>
          </button>
        </div>
      </header>

      {/* Pincode change modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center"
             onClick={() => setShowPinModal(false)}>
          <div className="bg-white w-full sm:w-[400px] sm:rounded-lg rounded-t-2xl p-5 animate-fade-in"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#0F1111]">Change delivery location</h3>
              <button onClick={() => setShowPinModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F2F2]">
                <X size={18} className="text-[#565959]" />
              </button>
            </div>
            <label className="block text-[13px] text-[#565959] mb-1.5">Pincode</label>
            <input
              type="text"
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handlePinSave()}
              placeholder="Enter 6-digit pincode"
              className="w-full border-2 border-[#FF9900] rounded h-11 px-3 text-[15px]
                         text-[#0F1111] outline-none mb-3"
              autoFocus
            />
            <button
              onClick={handlePinSave}
              disabled={pinInput.trim().length < 5}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] disabled:bg-[#D5D9D9]
                         text-[#0F1111] font-bold py-2.5 rounded-lg border border-[#FCD200]
                         transition-colors text-[14px]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  );
}
