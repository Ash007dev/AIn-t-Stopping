// app/page.tsx - Home page (Amazon Fresh professional)
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import { Mic, ChevronRight, Zap, UtensilsCrossed, Plus, Brain, Truck, Clock, Leaf, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getProductsForShelf, type ProductShelf } from '@/lib/product-shelves';
import { getOrderSubtotal } from '@/lib/order-utils';

// Quick-launch labels - plain text, NO emojis
const QUICK_LAUNCHES = [
  { label: 'Movie night for 5',  mode: 'intent',     preset: 'Movie night for 5 people tonight' },
  { label: 'Breakfast for 8',    mode: 'intent',     preset: 'Breakfast for 8 guests tomorrow morning' },
  { label: 'Aglio olio for 3',   mode: 'cooking',    preset: 'Aglio olio for 3 people' },
  { label: 'Diwali for 20',      mode: 'intent',     preset: 'Diwali party for 20 people' },
  { label: 'New baby at home',   mode: 'predictive', preset: 'new_baby' },
  { label: 'Quick lunch for 2',  mode: 'cooking',    preset: 'Quick lunch for 2' },
];

// Everyday essentials (SDM advice: replenishable goods)
const ESSENTIALS = [
  { name: 'Milk',       sub: '500ml',    price: '₹28',  emoji: '🥛' },
  { name: 'Eggs',       sub: '12 pack',  price: '₹84',  emoji: '🥚' },
  { name: 'Atta',       sub: '5kg',      price: '₹245', emoji: '🌾' },
  { name: 'Bread',      sub: 'White',    price: '₹40',  emoji: '🍞' },
  { name: 'Rice',       sub: '5kg',      price: '₹320', emoji: '🍚' },
  { name: 'Oil',        sub: '1L',       price: '₹165', emoji: '🛢️' },
  { name: 'Sugar',      sub: '1kg',      price: '₹42',  emoji: '🧂' },
  { name: 'Tea',        sub: '250g',     price: '₹120', emoji: '🍵' },
];

const MODES = [
  { id: 'intent',     label: 'Shop by Occasion', desc: 'Party, gathering, or event',     Icon: Zap,               color: '#FF9900' },
  { id: 'cooking',    label: 'Recipe Mode',       desc: 'Tell us a dish, we get the stuff', Icon: UtensilsCrossed,  color: '#007185' },
  { id: 'addon',      label: 'Add-on',            desc: 'Quick add to existing cart',       Icon: Plus,             color: '#CC0C39' },
  { id: 'predictive', label: 'Guide Me',          desc: 'Life events & situations',         Icon: Brain,            color: '#007600' },
];

export default function Home() {
  const router = useRouter();
  const setMode = useAppStore(s => s.setMode);
  const purchaseHistory = useAppStore(s => s.purchaseHistory);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categoryTitle, setCategoryTitle] = useState('Top Picks for You');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const controller = new AbortController();

    fetch('/api/catalog', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Catalog request failed');
        return response.json() as Promise<Product[]>;
      })
      .then(products => {
        setAllProducts(products);
        setTrendingProducts(getProductsForShelf(products, 'top'));
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Unable to load the product catalog', error);
      });

    return () => controller.abort();
  }, []);

  function handleCategorySelect(shelf: ProductShelf) {
    if (!allProducts.length) return;

    const titles: Record<ProductShelf, string> = {
      top: 'Top Picks for You',
      vegetables: 'Fresh Vegetables',
      fruits: 'Fresh Fruits',
      dairy: 'Dairy & Eggs',
      drinks: 'Cold Drinks & Juices',
      oils: 'Oils & Ghee',
      'rice-dal': 'Rice, Dal & Staples',
      breakfast: 'Breakfast Essentials',
      chocolates: 'Chocolates & Sweets',
      baby: 'Baby Care',
    };

    setTrendingProducts(getProductsForShelf(allProducts, shelf));
    setCategoryTitle(titles[shelf]);
  }

  function handleQuickLaunch(chip: typeof QUICK_LAUNCHES[0]) {
    setMode(chip.mode as 'intent' | 'cooking' | 'addon' | 'predictive');
    router.push(`/intent?mode=${chip.mode}&preset=${encodeURIComponent(chip.preset)}&count=5&time=Tonight&diet=No+restriction`);
  }

  function handleModeClick(modeId: string) {
    setMode(modeId as 'intent' | 'cooking' | 'addon' | 'predictive');
    router.push(`/mode/${modeId}`);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-24">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#131A22] via-[#232F3E] to-[#37475A] px-4 pt-7 pb-8">
        <div className="absolute inset-0 hero-texture pointer-events-none" />
        {/* glow orb */}
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-[#FF9900]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm text-[#FFD814] text-[11px] font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles size={12} />
            AI-powered grocery shopping
          </div>

          <h1 className="text-white text-[26px] sm:text-[30px] font-bold leading-tight mb-1.5">
            What do you need today?
          </h1>
          <p className="text-[#C5D0DB] text-[14px] mb-5 max-w-md">
            Just tell us in your words - AI builds your cart in seconds and delivers in minutes.
          </p>

          {/* Voice CTA */}
          <button
            onClick={() => router.push('/nowspeak')}
            className="cta-glow w-full bg-gradient-to-r from-[#FFA724] to-[#FF9900] hover:from-[#FF9900] hover:to-[#E47911]
                       text-[#131A22] font-bold py-4 rounded-xl flex items-center justify-center gap-3
                       transition-all text-[15px] active:scale-[0.99]"
          >
            <span className="w-8 h-8 rounded-full bg-[#131A22]/15 flex items-center justify-center">
              <Mic size={18} />
            </span>
            Speak to Order - NowSpeak
          </button>

          {/* Quick chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {QUICK_LAUNCHES.map(chip => (
              <button
                key={chip.label}
                onClick={() => handleQuickLaunch(chip)}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-white/15
                           text-[13px] text-white/90 bg-white/10 backdrop-blur-sm
                           hover:bg-white/20 hover:border-[#FF9900]/50 transition-all font-medium whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / delivery promise strip */}
      <section className="bg-white border-b border-[#D5D9D9]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-3 divide-x divide-[#E6E8E8]">
          {[
            { Icon: Clock,  title: '14 min',     sub: 'Express delivery', color: '#FF9900' },
            { Icon: Truck,  title: 'Free',       sub: 'Over ₹199',        color: '#007185' },
            { Icon: Leaf,   title: 'Fresh',      sub: 'Farm-picked daily', color: '#007600' },
          ].map(b => (
            <div key={b.sub} className="flex items-center justify-center gap-2 py-2.5 px-2">
              <b.Icon size={18} style={{ color: b.color }} />
              <div className="leading-tight">
                <p className="text-[12px] font-bold text-[#0F1111]">{b.title}</p>
                <p className="text-[10px] text-[#565959]">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modes Section - Professional cards */}
      <section className="px-4 py-5 max-w-screen-xl mx-auto">
        <h2 className="text-[17px] font-bold text-[#0F1111] mb-0.5">
          How would you like to shop?
        </h2>
        <p className="text-[12px] text-[#565959] mb-3">Pick a way and let AI do the heavy lifting</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeClick(mode.id)}
              className="lift relative overflow-hidden bg-white border border-[#D5D9D9] rounded-xl p-4 text-left
                         hover:border-[#FF9900] group"
            >
              {/* corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-[0.07]"
                   style={{ backgroundColor: mode.color }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5"
                   style={{ backgroundColor: mode.color + '18' }}>
                <mode.Icon size={22} style={{ color: mode.color }} />
              </div>
              <p className="text-[14px] font-bold text-[#0F1111] group-hover:text-[#007185] flex items-center gap-1">
                {mode.label}
                <ChevronRight size={15} className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#FF9900]" />
              </p>
              <p className="text-[11px] text-[#565959] mt-0.5 leading-tight">
                {mode.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Everyday Essentials - SDM advice: replenishable goods */}
      <section className="px-4 py-5 bg-white border-y border-[#D5D9D9]">
        <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[17px] font-bold text-[#0F1111]">Everyday Essentials</h2>
            <p className="text-[12px] text-[#565959]">Quick replenish - one-tap add</p>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#FF9900] bg-[#FF9900]/10 px-2.5 py-1 rounded-full">
            <Zap size={13} /> Fast add
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {ESSENTIALS.map(item => (
            <button
              key={item.name}
              className="lift group bg-white border border-[#E0E3E3] rounded-xl p-2.5
                         hover:border-[#FF9900] text-center relative"
              onClick={() => {
                setMode('addon');
                router.push(`/intent?mode=addon&preset=${encodeURIComponent(item.name)}&count=1&time=Now&diet=No+restriction`);
              }}
            >
              <div className="mx-auto w-11 h-11 rounded-full bg-[#F2F4F4] flex items-center justify-center text-[20px] mb-1.5 group-hover:bg-[#FFF3E0] transition-colors">
                {item.emoji}
              </div>
              <p className="text-[13px] font-bold text-[#0F1111] leading-tight">{item.name}</p>
              <p className="text-[10px] text-[#565959]">{item.sub}</p>
              <p className="text-[12px] text-[#CC0C39] font-bold mt-1">{item.price}</p>
              {/* add chip */}
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#FF9900] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={13} strokeWidth={3} />
              </span>
            </button>
          ))}
        </div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="bg-white pt-4">
        <h2 className="max-w-screen-xl mx-auto text-[17px] font-bold text-[#0F1111] px-4 mb-1">Shop by category</h2>
      </div>
      <CategoryNav onSelect={handleCategorySelect} />

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="px-4 py-5 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#0F1111] flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#FF9900]" />
              {categoryTitle}
            </h2>
            <button className="text-[13px] text-[#007185] font-medium flex items-center gap-0.5 hover:underline">
              See all <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-[#D5D9D9] border border-[#D5D9D9] rounded-xl overflow-hidden shadow-sm">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders - real data from store */}
      <section className="px-4 py-4 bg-white border-y border-[#D5D9D9]">
        <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0F1111]">Your recent orders</h2>
          <button
            onClick={() => router.push('/orders')}
            className="text-[13px] text-[#007185] font-medium flex items-center gap-0.5"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        {!isMounted || purchaseHistory.length === 0 ? (
          <p className="text-[13px] text-[#8C9296] py-4 text-center">
            No orders yet - try speaking an order above!
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-[#D5D9D9]">
            {purchaseHistory.slice(0, 3).map((order, idx) => (
              <button
                key={order.orderId || idx}
                onClick={() => router.push(`/orders/${order.orderId || idx}`)}
                className="w-full py-3 flex items-center justify-between text-left hover:bg-[#F7F7F7] transition-colors"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#0F1111]">
                    {order.occasionTitle || 'Your Order'}
                  </p>
                  <p className="text-[12px] text-[#565959] mt-0.5">
                    {order.orderId} · {order.itemCount || order.items?.length || (idx * 3 + 8)} items
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#0F1111]">
                    ₹{Math.round(getOrderSubtotal(order))}
                  </span>
                  <ChevronRight size={16} className="text-[#8C9296]" />
                </div>
              </button>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* NowSpeak promo */}
      <section className="px-4 py-5 max-w-screen-xl mx-auto">
        <button
          onClick={() => router.push('/nowspeak')}
          className="lift w-full relative overflow-hidden bg-gradient-to-r from-[#232F3E] to-[#37475A] rounded-xl p-5
                     flex items-center gap-4 hover:border-[#FF9900] text-left"
        >
          <div className="absolute -right-6 -bottom-8 w-32 h-32 bg-[#FF9900]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="w-14 h-14 bg-[#FF9900]/20 rounded-full flex items-center justify-center flex-shrink-0 relative">
            <Mic size={24} className="text-[#FF9900]" />
          </div>
          <div className="text-left flex-1 relative">
            <p className="text-[15px] font-bold text-white">NowSpeak Voice Assistant</p>
            <p className="text-[12px] text-[#C5D0DB] mt-0.5">
              Just talk naturally - &quot;I need snacks for a movie night&quot;
            </p>
          </div>
          <ChevronRight size={20} className="text-white/70 flex-shrink-0 relative" />
        </button>
      </section>

    </main>
  );
}
