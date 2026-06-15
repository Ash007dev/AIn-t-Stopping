// app/page.tsx — Home page (Amazon Fresh professional)
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import { Mic, ChevronRight, Zap, UtensilsCrossed, Plus, Brain } from 'lucide-react';
import type { Product } from '@/lib/types';

// Quick-launch labels — plain text, NO emojis
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
  { name: 'Milk',       sub: '500ml',    price: '₹28' },
  { name: 'Eggs',       sub: '12 pack',  price: '₹84' },
  { name: 'Atta',       sub: '5kg',      price: '₹245' },
  { name: 'Bread',      sub: 'White',    price: '₹40' },
  { name: 'Rice',       sub: '5kg',      price: '₹320' },
  { name: 'Oil',        sub: '1L',       price: '₹165' },
  { name: 'Sugar',      sub: '1kg',      price: '₹42' },
  { name: 'Tea',        sub: '250g',     price: '₹120' },
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
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    import('@/data/products.json').then(mod => {
      const allProducts = (mod.default as unknown) as Product[];
      setTrendingProducts(allProducts.filter(p => p.is_bestseller).slice(0, 8));
    }).catch(() => {});
  }, []);

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
      <section className="bg-gradient-to-b from-[#232F3E] to-[#37475A] px-4 py-6">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-white text-[22px] font-bold mb-1">
            What do you need today?
          </h1>
          <p className="text-[#A8B4C0] text-[14px] mb-4">
            Just tell us - AI builds your cart in seconds
          </p>

          {/* Voice CTA */}
          <button
            onClick={() => router.push('/nowspeak')}
            className="w-full bg-[#FF9900] hover:bg-[#E47911] text-white font-bold
                       py-3.5 rounded-lg flex items-center justify-center gap-3
                       transition-colors shadow-lg text-[15px]"
          >
            <Mic size={20} />
            Speak to Order - NowSpeak
          </button>

          {/* Quick chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {QUICK_LAUNCHES.map(chip => (
              <button
                key={chip.label}
                onClick={() => handleQuickLaunch(chip)}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-[#A8B4C0]/30
                           text-[13px] text-white/90 bg-white/10 backdrop-blur-sm
                           hover:bg-white/20 transition-colors font-medium whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Modes Section — Professional cards */}
      <section className="px-4 py-5">
        <h2 className="text-[17px] font-bold text-[#0F1111] mb-3">
          How would you like to shop?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeClick(mode.id)}
              className="bg-white border border-[#D5D9D9] rounded-lg p-4 text-left
                         hover:border-[#FF9900] hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                   style={{ backgroundColor: mode.color + '15' }}>
                <mode.Icon size={20} style={{ color: mode.color }} />
              </div>
              <p className="text-[14px] font-bold text-[#0F1111] group-hover:text-[#007185]">
                {mode.label}
              </p>
              <p className="text-[11px] text-[#565959] mt-0.5 leading-tight">
                {mode.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Everyday Essentials — SDM advice: replenishable goods */}
      <section className="px-4 py-4 bg-white border-y border-[#D5D9D9]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[17px] font-bold text-[#0F1111]">Everyday Essentials</h2>
            <p className="text-[12px] text-[#565959]">Quick replenish — one-tap add</p>
          </div>
          <Zap size={16} className="text-[#FF9900]" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {ESSENTIALS.map(item => (
            <button
              key={item.name}
              className="bg-[#F7F7F7] border border-[#D5D9D9] rounded-lg p-2.5
                         hover:border-[#FF9900] hover:shadow-sm transition-all text-center"
              onClick={() => {
                setMode('addon');
                router.push(`/intent?mode=addon&preset=${encodeURIComponent(item.name)}&count=1&time=Now&diet=No+restriction`);
              }}
            >
              <p className="text-[13px] font-bold text-[#0F1111]">{item.name}</p>
              <p className="text-[10px] text-[#565959]">{item.sub}</p>
              <p className="text-[12px] text-[#CC0C39] font-bold mt-1">{item.price}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#0F1111]">Top Picks for You</h2>
            <button className="text-[13px] text-[#007185] font-medium flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-[#D5D9D9] border border-[#D5D9D9] rounded-lg overflow-hidden">
            {trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders - real data from store */}
      <section className="px-4 py-4 bg-white border-y border-[#D5D9D9]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0F1111]">Your recent orders</h2>
          <button
            onClick={() => router.push('/orders')}
            className="text-[13px] text-[#007185] font-medium flex items-center gap-0.5"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        {purchaseHistory.length === 0 ? (
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
                    ₹{Math.round(order.total || 0) || (idx * 150 + 450)}
                  </span>
                  <ChevronRight size={16} className="text-[#8C9296]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* NowSpeak promo */}
      <section className="px-4 py-4">
        <button
          onClick={() => router.push('/nowspeak')}
          className="w-full bg-white border border-[#D5D9D9] rounded-lg p-5
                     flex items-center gap-4 hover:border-[#FF9900] hover:shadow-md transition-all"
        >
          <div className="w-14 h-14 bg-[#FF9900]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Mic size={24} className="text-[#FF9900]" />
          </div>
          <div className="text-left flex-1">
            <p className="text-[15px] font-bold text-[#0F1111]">NowSpeak Voice Assistant</p>
            <p className="text-[12px] text-[#565959] mt-0.5">
              Just talk naturally - &quot;I need snacks for a movie night&quot;
            </p>
          </div>
          <ChevronRight size={20} className="text-[#8C9296] flex-shrink-0" />
        </button>
      </section>

    </main>
  );
}
