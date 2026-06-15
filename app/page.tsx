// app/page.tsx - Amazon Intent storefront
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Baby,
  BatteryCharging,
  Brain,
  Camera,
  ChevronRight,
  Clock,
  Droplets,
  Egg,
  Leaf,
  MapPinned,
  Mic,
  Milk,
  PackageCheck,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  SprayCan,
  UtensilsCrossed,
  Wheat,
  Zap,
} from 'lucide-react';
import CategoryNav from '@/components/CategoryNav';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getNearbyDarkStores } from '@/lib/dark-store-utils';
import { getOrderSubtotal, hasOrderPrice } from '@/lib/order-utils';
import { getProductsForShelf, type ProductShelf } from '@/lib/product-shelves';
import type { Product } from '@/lib/types';
import { useAppStore } from '@/store/useAppStore';

const QUICK_LAUNCHES = [
  { label: 'Movie night for 5', mode: 'intent', preset: 'Movie night for 5 people tonight' },
  { label: 'Breakfast for 8', mode: 'intent', preset: 'Breakfast for 8 guests tomorrow morning' },
  { label: 'Aglio olio for 3', mode: 'cooking', preset: 'Aglio olio for 3 people' },
  { label: 'Diwali for 20', mode: 'intent', preset: 'Diwali party for 20 people' },
  { label: 'New baby at home', mode: 'predictive', preset: 'new_baby' },
  { label: 'Quick lunch for 2', mode: 'cooking', preset: 'Quick lunch for 2' },
] as const;

const ESSENTIALS = [
  { name: 'Milk', sub: '500 ml', price: '₹29', Icon: Milk, color: '#146EB4' },
  { name: 'Eggs', sub: '6 pack', price: '₹55', Icon: Egg, color: '#B45309' },
  { name: 'Bread', sub: '400 g', price: '₹42', Icon: ShoppingBasket, color: '#8A5A2B' },
  { name: 'Atta', sub: '5 kg', price: '₹245', Icon: Wheat, color: '#9A6700' },
  { name: 'Cooking oil', sub: '1 L', price: '₹165', Icon: Droplets, color: '#D97706' },
  { name: 'Dishwash', sub: '500 ml', price: '₹99', Icon: SprayCan, color: '#007185' },
  { name: 'Phone charger', sub: '20 W USB-C', price: '₹499', Icon: BatteryCharging, color: '#7C3AED' },
  { name: 'Baby diapers', sub: '24 pack', price: '₹349', Icon: Baby, color: '#DB2777' },
] as const;

const MODES = [
  { id: 'intent', label: 'Shop by Occasion', desc: 'Party, gathering, or event', Icon: Zap, color: '#FF9900' },
  { id: 'cooking', label: 'Recipe Mode', desc: 'Tell us a dish, we get the ingredients', Icon: UtensilsCrossed, color: '#007185' },
  { id: 'addon', label: 'Quick Add', desc: 'Refill one forgotten item immediately', Icon: Plus, color: '#CC0C39' },
  { id: 'predictive', label: 'Guide Me', desc: 'Life events and household situations', Icon: Brain, color: '#007600' },
] as const;

const CATEGORY_TITLES: Record<ProductShelf, string> = {
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

export default function Home() {
  const router = useRouter();
  const setMode = useAppStore(s => s.setMode);
  const purchaseHistory = useAppStore(s => s.purchaseHistory);
  const pinCode = useAppStore(s => s.pinCode);
  const customerLocation = useAppStore(s => s.customerLocation);
  const setScannedImageBase64 = useAppStore(s => s.setScannedImageBase64);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categoryTitle, setCategoryTitle] = useState(CATEGORY_TITLES.top);
  const [isMounted, setIsMounted] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const effectivePin = isMounted ? pinCode : '641002';
  const nearbyStores = getNearbyDarkStores(isMounted ? customerLocation : null, effectivePin).slice(0, 3);

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
    setTrendingProducts(getProductsForShelf(allProducts, shelf));
    setCategoryTitle(CATEGORY_TITLES[shelf]);
  }

  function handleQuickLaunch(chip: typeof QUICK_LAUNCHES[number]) {
    setMode(chip.mode);
    router.push(`/intent?mode=${chip.mode}&preset=${encodeURIComponent(chip.preset)}&count=5&time=Tonight&diet=No+restriction`);
  }

  function handleModeClick(mode: typeof MODES[number]['id']) {
    setMode(mode);
    router.push(`/mode/${mode}`);
  }

  function handleEssential(name: string) {
    setMode('addon');
    router.push(`/intent?mode=addon&preset=${encodeURIComponent(name)}&count=1&time=Now&diet=No+restriction`);
  }

  function handleImageScan(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setScanError('Upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setScanError('Image must be under 5 MB.');
      return;
    }

    setScanError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setScannedImageBase64(reader.result as string);
      setMode('cooking');
      router.push('/intent?mode=cooking&preset=Create+a+recipe+or+shopping+list+from+this+image&count=3&time=Now&diet=No+restriction');
    };
    reader.onerror = () => setScanError('Could not read that image. Please try another file.');
    reader.readAsDataURL(file);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-16">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#131A22] via-[#232F3E] to-[#37475A] px-4 py-7 sm:py-9">
        <div className="absolute inset-0 hero-texture pointer-events-none" />
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-[#FF9900]/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto grid min-w-0 lg:grid-cols-[1.08fr_0.92fr] gap-7 lg:gap-10 items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#FFD814] backdrop-blur-sm">
              <Sparkles size={12} />
              Amazon HackOn quick-commerce prototype
            </div>

            <h1 className="mt-3 max-w-2xl text-[30px] sm:text-[38px] lg:text-[46px] font-bold leading-[1.08] tracking-[-0.025em] text-white">
              Groceries, essentials, and forgotten items in minutes.
            </h1>
            <p className="mt-3 max-w-xl text-[14px] sm:text-[16px] leading-6 text-[#D5DBDB]">
              Speak naturally. Amazon Intent builds the cart, finds nearby stock, and splits fulfillment only when another dark store can deliver faster.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_190px_190px] gap-3">
              <button
                onClick={() => router.push('/nowspeak')}
                className="cta-glow min-h-14 w-full rounded-xl bg-gradient-to-r from-[#FFB84D] to-[#FF9900] px-5 text-[15px] font-bold text-[#131A22] transition-all hover:from-[#FF9900] hover:to-[#E47911] active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#131A22]/15">
                  <Mic size={19} />
                </span>
                Speak now
              </button>
              <label
                className="min-h-14 w-full cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 text-[14px] font-bold text-white transition-colors hover:bg-white/15 flex items-center justify-center gap-2"
              >
                <Camera size={18} className="text-[#FFB84D]" />
                Scan image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageScan}
                />
              </label>
              <button
                onClick={() => router.push('/darkstores')}
                className="min-h-14 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-[14px] font-bold text-white transition-colors hover:bg-white/15 flex items-center justify-center gap-2"
              >
                <MapPinned size={18} className="text-[#FFB84D]" />
                Nearby stores
              </button>
            </div>
            {scanError && (
              <p className="mt-2 text-[12px] font-medium text-[#FFD814]" role="alert">{scanError}</p>
            )}

            <div className="mt-4 flex max-w-full gap-2 overflow-x-auto hide-scrollbar pb-1">
              {QUICK_LAUNCHES.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => handleQuickLaunch(chip)}
                  className="flex-shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[12px] font-medium text-white/90 transition-all hover:border-[#FF9900]/50 hover:bg-white/20"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/darkstores')}
            className="hidden lg:block rounded-2xl border border-white/15 bg-white/[0.08] p-5 text-left backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFB84D]">Live fulfillment network</p>
                <p className="mt-1 text-[20px] font-bold text-white">{nearbyStores.length} hubs near {effectivePin}</p>
              </div>
              <ChevronRight size={20} className="text-white/60" />
            </div>
            <div className="mt-4 space-y-2.5">
              {nearbyStores.map((store, index) => (
                <div key={store.id} className="flex items-center gap-3 rounded-xl bg-[#131A22]/45 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9900] text-[12px] font-bold text-[#131A22]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-white">{store.name}</p>
                    <p className="text-[11px] text-[#C5D0DB]">{store.distance_km} km away</p>
                  </div>
                  <span className="rounded-full bg-[#007600]/30 px-2 py-1 text-[11px] font-bold text-[#B6F2B6]">
                    {store.eta_minutes} min
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#D5DBDB]">
              <PackageCheck size={14} className="text-[#FFB84D]" />
              Inventory, distance, hub load, and returns considered
            </p>
          </button>
        </div>
      </section>

      <section className="bg-white border-b border-[#D5D9D9]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#E6E8E8]">
          {[
            { Icon: Clock, title: '14 min', sub: 'Express delivery', color: '#FF9900' },
            { Icon: MapPinned, title: 'Nearby', sub: 'Location-based sourcing', color: '#146EB4' },
            { Icon: RotateCcw, title: 'Easy', sub: 'Returns and resolution', color: '#007185' },
            { Icon: Leaf, title: 'Fresh', sub: 'Cold-chain handling', color: '#007600' },
          ].map(item => (
            <div key={item.sub} className="flex items-center justify-center gap-2.5 px-2 py-3">
              <item.Icon size={18} style={{ color: item.color }} />
              <div className="leading-tight">
                <p className="text-[12px] font-bold text-[#0F1111]">{item.title}</p>
                <p className="text-[10px] text-[#565959]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-b border-[#D5D9D9] px-4 py-5 sm:py-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E47911]">Running low?</p>
              <h2 className="text-[19px] sm:text-[22px] font-bold text-[#0F1111]">Urgent everyday essentials</h2>
              <p className="text-[12px] text-[#565959]">Milk, kitchen basics, home care, chargers, and baby needs</p>
            </div>
            <span className="hidden sm:flex items-center gap-1 rounded-full bg-[#FFF3E0] px-2.5 py-1 text-[11px] font-semibold text-[#E47911]">
              <Zap size={13} /> One-tap refill
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {ESSENTIALS.map(item => (
              <button
                key={item.name}
                onClick={() => handleEssential(item.name)}
                className="lift group relative min-h-[132px] rounded-xl border border-[#E0E3E3] bg-white p-3 text-left hover:border-[#FF9900]"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}14` }}>
                  <item.Icon size={20} style={{ color: item.color }} />
                </div>
                <p className="pr-5 text-[13px] font-bold leading-tight text-[#0F1111]">{item.name}</p>
                <p className="mt-0.5 text-[10px] text-[#565959]">{item.sub}</p>
                <p className="mt-1.5 text-[13px] font-bold text-[#CC0C39]">{item.price}</p>
                <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#FF9900] text-[#E47911] transition-colors group-hover:bg-[#FF9900] group-hover:text-white">
                  <Plus size={13} strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto px-4 py-5">
        <h2 className="text-[18px] font-bold text-[#0F1111]">How would you like to shop?</h2>
        <p className="mb-3 text-[12px] text-[#565959]">Start with an occasion, a recipe, or one urgent item</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeClick(mode.id)}
              className="lift group relative overflow-hidden rounded-xl border border-[#D5D9D9] bg-white p-4 text-left hover:border-[#FF9900]"
            >
              <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full opacity-[0.07]" style={{ backgroundColor: mode.color }} />
              <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${mode.color}18` }}>
                <mode.Icon size={22} style={{ color: mode.color }} />
              </div>
              <p className="flex items-center gap-1 text-[14px] font-bold text-[#0F1111] group-hover:text-[#007185]">
                {mode.label}
                <ChevronRight size={15} className="text-[#FF9900] opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-[#565959]">{mode.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="bg-white pt-4">
        <h2 className="max-w-screen-xl mx-auto px-4 mb-1 text-[18px] font-bold text-[#0F1111]">Shop by category</h2>
      </div>
      <CategoryNav onSelect={handleCategorySelect} />

      {trendingProducts.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-4 py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-1.5 text-[18px] font-bold text-[#0F1111]">
              <Sparkles size={16} className="text-[#FF9900]" />
              {categoryTitle}
            </h2>
            <button className="flex items-center gap-0.5 text-[13px] font-medium text-[#007185] hover:underline">
              See all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] overflow-hidden rounded-xl border border-[#D5D9D9] bg-[#D5D9D9] shadow-sm">
            {trendingProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="border-y border-[#D5D9D9] bg-white px-4 py-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#0F1111]">Your recent orders</h2>
            <button onClick={() => router.push('/orders')} className="flex items-center text-[13px] font-medium text-[#007185]">
              See all <ChevronRight size={14} />
            </button>
          </div>

          {!isMounted || purchaseHistory.length === 0 ? (
            <p className="py-5 text-center text-[13px] text-[#8C9296]">No orders yet. Speak or search above to build your first cart.</p>
          ) : (
            <div className="divide-y divide-[#D5D9D9]">
              {purchaseHistory.slice(0, 3).map((order, index) => (
                <button
                  key={order.orderId || index}
                  onClick={() => router.push(`/orders/${order.orderId || index}`)}
                  className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-[#F7F7F7]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-[#0F1111]">{order.occasionTitle || 'Your Order'}</p>
                    <p className="mt-0.5 text-[12px] text-[#565959]">
                      {order.orderId} &middot; {order.itemCount || order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-[14px] font-bold text-[#0F1111]">
                      {hasOrderPrice(order)
                        ? <>&#8377;{Math.round(getOrderSubtotal(order))}</>
                        : <span className="text-[11px] font-medium text-[#565959]">Price unavailable</span>}
                    </span>
                    <ChevronRight size={16} className="text-[#8C9296]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
