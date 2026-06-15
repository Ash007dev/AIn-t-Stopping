// app/cart/page.tsx — IntentCart Smart Cart Screen (mock-data driven)
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Sparkles, MapPin, Zap, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

import LoadingScreen from "@/components/loading/LoadingScreen";
import { Button, Pill, StarRating, Card, Chip } from "@/components/ui";
import { mockScenarios, CartScenario } from "@/data/mockCart";
import { CartProduct, Product } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function expiryLabel(months: number | null) {
  if (!months) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function personCount(title: string): number {
  const m = title.match(/\d+/);
  return m ? parseInt(m[0]) : 2;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarInitials({ name }: { name: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ background: "#2a2a2a", color: "#A0A0A0" }}
    >
      {getInitials(name)}
    </div>
  );
}

interface AlternativeCardProps {
  product: Product;
  onSwitch: () => void;
}

function AlternativeCard({ product, onSwitch }: AlternativeCardProps) {
  return (
    <motion.div
      layout
      className="flex-1 min-w-0 rounded-[14px] p-3 flex flex-col gap-2 cursor-pointer group"
      style={{
        background: "#161616",
        border: "1px solid #2a2a2a",
      }}
      whileHover={{ borderColor: "#E8170A", y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <img
        src={product.image_url}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto rounded-lg"
        style={{ background: "#1a1a1a" }}
      />
      <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{product.name}</p>
      <div className="flex items-center gap-1">
        <StarRating rating={product.rating} showValue size={10} />
      </div>
      <p className="text-xs text-[#FF9900] font-bold">
        {formatPrice(product.price)}
      </p>
      <button
        onClick={onSwitch}
        className="mt-auto flex items-center gap-1 text-[10px] font-semibold text-[#E8170A] hover:text-[#FF2010] transition-colors"
      >
        Switch to this <ChevronRight size={10} />
      </button>
    </motion.div>
  );
}

interface ProductCardSectionProps {
  product: CartProduct;
  index: number;
  onSwitch: (productId: string, alt: Product) => void;
}

function ProductCardSection({ product, index, onSwitch }: ProductCardSectionProps) {
  const expiry = expiryLabel(product.expiry_months);
  const lineTotal = product.price * product.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
    >
      <Card className="p-5 sm:p-6 rounded-[20px]">
        {/* Product header */}
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative shrink-0">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] object-contain rounded-[12px]"
              style={{ background: "#1a1a1a" }}
            />
            {product.is_bestseller && (
              <div className="absolute top-1.5 right-1.5">
                <Pill variant="orange">🏆 Bestseller</Pill>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
              <p className="text-white font-bold text-sm sm:text-base leading-tight">{product.name}</p>
              <p className="text-[#666666] text-xs mt-0.5">{product.brand}</p>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <StarRating rating={product.rating} showValue size={13} />
              <span className="text-[11px] text-[#666666]">
                ({product.review_count.toLocaleString("en-IN")} reviews)
              </span>
            </div>

            {/* Quantity + reasoning */}
            <div>
              <span className="text-white font-bold text-sm">×{product.quantity}</span>
              <span className="text-[#666666] text-xs ml-1.5">
                — for {personCount(product.occasion_tags[0] || "2")} people
                {product.serving_size > 1 && ` (1 pack serves ~${product.serving_size})`}
              </span>
            </div>

            {/* Price */}
            <div className="text-sm">
              <span className="text-[#FF9900] font-bold">{formatPrice(product.price)}</span>
              {product.quantity > 1 && (
                <span className="text-[#666666] text-xs ml-1.5">
                  · {formatPrice(lineTotal)} total
                </span>
              )}
            </div>

            {/* Status row */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              {product.in_stock ? (
                <span className="text-[#22C55E] flex items-center gap-1">
                  <Check size={10} /> In stock
                </span>
              ) : (
                <span className="text-[#E8170A]">Out of stock</span>
              )}
              <span className="text-[#FF9900] flex items-center gap-1">
                <Zap size={10} /> Arrives in {product.eta_minutes} mins
              </span>
              {expiry && (
                <span className="text-[#666666]">Best before: {expiry}</span>
              )}
            </div>

            {/* Region tag */}
            {product.region_tags.length > 0 && (
              <Pill variant="green">
                <MapPin size={9} /> Popular in {product.region_tags[0]}
              </Pill>
            )}
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #1f1f1f" }}>
          <div className="flex items-start gap-2">
            <Sparkles size={12} className="text-[#E8170A] shrink-0 mt-0.5" />
            <p className="text-[12px] italic text-[#666666] leading-relaxed">
              {product.ai_reasoning}
            </p>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid #1f1f1f" }}>
          {product.sample_reviews.map((rev, i) => (
            <div key={i} className="flex gap-2.5">
              <AvatarInitials name={rev.author} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-semibold text-white">{rev.author}</span>
                  <StarRating rating={product.rating} showValue={false} size={10} />
                </div>
                <p className="text-[12px] text-[#A0A0A0] leading-relaxed mt-0.5 line-clamp-2">
                  {rev.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Alternatives */}
        {product.alternatives.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #1f1f1f" }}>
            <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
              Alternatives
            </p>
            <LayoutGroup>
              <div className="flex gap-3">
                {product.alternatives.slice(0, 2).map((alt) => (
                  <AlternativeCard
                    key={alt.id}
                    product={alt}
                    onSwitch={() => onSwitch(product.id, alt)}
                  />
                ))}
              </div>
            </LayoutGroup>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

interface RegionalSectionProps {
  products: Product[];
  region: string;
  onAdd: (p: Product) => void;
}

function RegionalSection({ products, region, onAdd }: RegionalSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.35 }}
      className="mt-4"
    >
      <div className="mb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MapPin size={15} className="text-[#22C55E]" />
          Popular in {region}
        </h3>
        <p className="text-xs text-[#666666] mt-0.5">What people here are also ordering</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p) => (
          <Card key={p.id} interactive className="p-3 flex flex-col gap-2">
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full h-20 object-contain rounded-[8px]"
              style={{ background: "#1a1a1a" }}
            />
            <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{p.name}</p>
            <StarRating rating={p.rating} showValue size={10} />
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold text-[#FF9900]">{formatPrice(p.price)}</span>
              <button
                onClick={() => onAdd(p)}
                className="text-[11px] font-bold px-2 py-1 rounded-full transition-colors"
                style={{
                  background: "rgba(255,153,0,0.12)",
                  color: "#FF9900",
                  border: "1px solid rgba(255,153,0,0.3)",
                }}
              >
                + Add
              </button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

interface OrderSummaryProps {
  products: CartProduct[];
  total: number;
  eta: number;
  onOrder: () => void;
}

function OrderSummary({ products, total, eta, onOrder }: OrderSummaryProps) {
  const tax = Math.round(total * 0.05);
  const grandTotal = total + tax;

  return (
    <div
      className="sticky top-20 rounded-[16px] p-5 flex flex-col gap-4"
      style={{ background: "#111111", border: "1px solid #1f1f1f" }}
    >
      <h2 className="font-bold text-white text-base" style={{ fontFamily: "Sora, sans-serif" }}>
        Order Summary
      </h2>

      {/* Line items */}
      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-2 text-xs">
            <span className="text-[#A0A0A0] line-clamp-1 flex-1">{p.name} ×{p.quantity}</span>
            <span className="text-white font-medium shrink-0">{formatPrice(p.price * p.quantity)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #1f1f1f" }} className="pt-3 flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-[#666666]">
          <span>Subtotal</span><span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#666666]">
          <span>Delivery</span><span className="text-[#22C55E]">₹0 Free</span>
        </div>
        <div className="flex justify-between text-xs text-[#666666]">
          <span>Tax (5%)</span><span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white mt-1 pt-1" style={{ borderTop: "1px solid #1f1f1f" }}>
          <span>Total</span><span className="text-[#FF9900]">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* ETA */}
      <Pill variant="orange" className="self-start">
        <Zap size={10} /> Arriving in {eta} mins
      </Pill>

      {/* Order button */}
      <Button variant="primary" className="w-full justify-center rounded-full py-3" onClick={onOrder}>
        Order Now — {formatPrice(grandTotal)} →
      </Button>

      {/* Delivery address */}
      <div className="text-[11px] text-[#666666] flex items-start gap-1.5">
        <MapPin size={10} className="shrink-0 mt-0.5 text-[#E8170A]" />
        <span>
          Coimbatore, Tamil Nadu 641 112 ·{" "}
          <Link href="/setup" className="text-[#E8170A] hover:underline">
            Change
          </Link>
        </span>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
    >
      ✓ {message}
    </motion.div>
  );
}

// ─── Modification Bar ─────────────────────────────────────────────────────────

interface ModBarProps {
  scenario: CartScenario;
  onChip: (hint: string) => void;
}

function ModificationBar({ scenario, onChip }: ModBarProps) {
  const [recording, setRecording] = useState(false);
  const [input, setInput] = useState("");
  const count = personCount(scenario.occasionTitle);
  const firstProduct = scenario.products[0];
  const secondProduct = scenario.products[1];

  const hints = [
    "Make it vegetarian",
    `${count + 2} people not ${count}`,
    ...(firstProduct && secondProduct
      ? [`Switch ${firstProduct.name.split(" ")[0]} to ${secondProduct.name.split(" ")[0]}`]
      : []),
    "Switch to healthier options",
  ].slice(0, 4);

  return (
    <div
      className="sticky bottom-0 z-40 w-full pb-safe"
      style={{
        background: "#0f0f0f",
        borderTop: "1px solid #1f1f1f",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Hint chips */}
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {hints.map((h) => (
          <button
            key={h}
            onClick={() => { setInput(h); onChip(h); }}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150"
            style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              color: "#A0A0A0",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8170A";
              (e.currentTarget as HTMLButtonElement).style.color = "#E8170A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
              (e.currentTarget as HTMLButtonElement).style.color = "#A0A0A0";
            }}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="max-w-5xl mx-auto px-4 pb-4 flex items-center gap-3">
        {/* Mic */}
        <button
          onClick={() => setRecording((v) => !v)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
          style={{ background: recording ? "#E8170A" : "#1a1a1a", border: "1px solid #2a2a2a" }}
          aria-label={recording ? "Stop recording" : "Start voice input"}
        >
          {recording && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#E8170A" }} />
          )}
          {recording ? (
            <MicOff size={16} className="text-white" />
          ) : (
            <Mic size={16} className="text-[#A0A0A0]" />
          )}
        </button>

        {/* Text input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Change anything? Just tell me..."
          className="flex-1 bg-transparent text-sm text-white placeholder-[#444] outline-none"
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "24px",
            padding: "10px 16px",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3a3a3a")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onChip(input.trim());
              setInput("");
            }
          }}
        />

        {/* Send */}
        <button
          onClick={() => { if (input.trim()) { onChip(input.trim()); setInput(""); } }}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
          aria-label="Send modification"
        >
          <ChevronRight size={16} className="text-[#FF9900]" />
        </button>
      </div>
    </div>
  );
}

// ─── Sticky Top Bar ───────────────────────────────────────────────────────────

interface TopBarProps {
  scenario: CartScenario;
  total: number;
  onOrder: () => void;
}

function StickyTopBar({ scenario, total, onOrder }: TopBarProps) {
  const tax = Math.round(total * 0.05);
  const grand = total + tax;
  const itemCount = scenario.products.reduce((s, p) => s + p.quantity, 0);

  return (
    <div
      className="sticky top-14 z-30 w-full"
      style={{
        background: "rgba(10,10,10,0.95)",
        borderBottom: "1px solid #1f1f1f",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
        {/* Back */}
        <Link
          href="/intent"
          className="flex items-center gap-1 text-xs text-[#666666] hover:text-[#A0A0A0] transition-colors shrink-0"
        >
          <ArrowLeft size={13} /> Edit
        </Link>

        <div className="w-px h-4 bg-[#2a2a2a] shrink-0" />

        {/* Title */}
        <h2 className="text-sm font-bold text-white flex-1 min-w-0 truncate" style={{ fontFamily: "Sora, sans-serif" }}>
          {scenario.emoji} {scenario.occasionTitle}
        </h2>

        {/* ETA pill */}
        <Pill variant="orange" className="shrink-0 hidden sm:inline-flex">
          <Zap size={9} /> Arriving in {scenario.eta} mins
        </Pill>

        {/* Total */}
        <span className="text-sm font-bold text-white shrink-0 hidden sm:block">
          {formatPrice(grand)} · {itemCount} items
        </span>

        {/* Order Now — desktop only */}
        <Button
          variant="primary"
          className="hidden sm:flex rounded-full px-4 py-2 text-xs shrink-0"
          onClick={onOrder}
        >
          Order Now — {formatPrice(grand)} →
        </Button>
      </div>
    </div>
  );
}

// ─── Price flash animation ────────────────────────────────────────────────────

function PriceDisplay({ value }: { value: number }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      prevRef.current = value;
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <motion.span
      animate={flash ? { scale: [1, 1.12, 1], color: ["#FF9900", "#FBBF24", "#FF9900"] } : {}}
      transition={{ duration: 0.5 }}
      className="text-[#FF9900] font-bold text-xl"
    >
      {formatPrice(value)}
    </motion.span>
  );
}

// ─── Main Cart Inner (after loading) ─────────────────────────────────────────

function CartInner({ scenario: initialScenario }: { scenario: CartScenario }) {
  const router = useRouter();
  const [products, setProducts] = useState<CartProduct[]>(initialScenario.products);
  const [toast, setToast] = useState<string | null>(null);

  const total = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const tax = Math.round(total * 0.05);
  const grand = total + tax;

  const handleSwitch = (productId: string, alt: Product) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...alt,
              quantity: p.quantity,
              ai_reasoning: `Switched to ${alt.name} — ${alt.brand}`,
              alternatives: p.alternatives,
              is_suggestion: p.is_suggestion,
              dark_store: p.dark_store,
              return_policy: p.return_policy,
            }
          : p
      )
    );
    setToast(`Switched to ${alt.name.split(" ").slice(0, 3).join(" ")}`);
  };

  const handleAddRegional = (p: Product) => {
    setProducts((prev) => {
      if (prev.find((item) => item.id === p.id)) return prev;
      return [
        ...prev,
        {
          ...p,
          quantity: 1,
          ai_reasoning: `Added from popular in ${p.region_tags[0] || "your area"}`,
          alternatives: [],
        },
      ];
    });
    setToast(`Added ${p.name.split(" ").slice(0, 3).join(" ")}`);
  };

  const handleChip = (hint: string) => {
    setToast(`📝 "${hint}" — AI wiring coming soon`);
  };

  const handleOrder = () => {
    router.push("/checkout");
  };

  const region = initialScenario.products[0]?.region_tags?.[0] ?? "Coimbatore";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <StickyTopBar
        scenario={{ ...initialScenario, total }}
        total={total}
        onOrder={handleOrder}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* ─── Left: product list ─── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {products.map((product, i) => (
            <LayoutGroup key={product.id}>
              <ProductCardSection
                product={product}
                index={i}
                onSwitch={handleSwitch}
              />
            </LayoutGroup>
          ))}

          {/* Regional */}
          {initialScenario.regionalProducts.length > 0 && (
            <RegionalSection
              products={initialScenario.regionalProducts}
              region={region}
              onAdd={handleAddRegional}
            />
          )}
        </div>

        {/* ─── Right: order summary (desktop) ─── */}
        <div className="hidden lg:block w-[360px] shrink-0">
          <OrderSummary
            products={products}
            total={total}
            eta={initialScenario.eta}
            onOrder={handleOrder}
          />
        </div>
      </div>

      {/* Mobile total + order button */}
      <div
        className="lg:hidden fixed bottom-[88px] left-0 right-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: "#0a0a0a", borderTop: "1px solid #1f1f1f" }}
      >
        <div>
          <PriceDisplay value={grand} />
          <p className="text-[11px] text-[#666666]">{products.reduce((s, p) => s + p.quantity, 0)} items · incl. tax</p>
        </div>
        <Button variant="primary" className="rounded-full px-5 py-2.5 text-sm" onClick={handleOrder}>
          Order Now →
        </Button>
      </div>

      {/* Modification bar */}
      <ModificationBar scenario={initialScenario} onChip={handleChip} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast} message={toast} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page (reads searchParam, shows loading → cart) ───────────────────────────

function CartPageInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("scenario") ?? "movie-night";
  const mockScenario = mockScenarios[slug] ?? mockScenarios["movie-night"];

  // ── Read from real AI backend if populated ──
  const storeCart = useAppStore((s) => s.cart);
  const storeRegional = useAppStore((s) => s.regionalProducts);
  const storeTitle = useAppStore((s) => s.occasionTitle);
  
  const scenario: CartScenario = storeCart.length > 0
    ? {
        slug: "dynamic",
        occasionTitle: storeTitle || mockScenario.occasionTitle,
        emoji: "✨",
        eta: 18,
        total: storeCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: storeCart.reduce((sum, item) => sum + item.quantity, 0),
        products: storeCart,
        regionalProducts: storeRegional,
      }
    : mockScenario;

  const [loaded, setLoaded] = useState(() => {
    // Skip loading screen if navigating directly to /cart without a scenario param (e.g. from Navbar)
    // and we already have items in the store.
    if (!searchParams.get("scenario") && storeCart.length > 0) return true;
    return false;
  });

  // If directly accessing /cart with no scenario and an empty store, show empty state
  if (!searchParams.get("scenario") && storeCart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: "#0a0a0a" }}>
        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 border border-[#2a2a2a]">
          <span className="text-2xl">🛒</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>Your cart is empty</h2>
        <p className="text-sm text-[#666666] mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/">
          <Button variant="primary" className="rounded-full px-6 py-2.5 text-sm font-bold">
            Start Shopping →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!loaded ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoadingScreen
            occasionTitle={scenario.occasionTitle}
            personCount={personCount(scenario.occasionTitle)}
            onComplete={() => setLoaded(true)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="cart"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CartInner scenario={scenario} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#666666] text-sm">Loading cart…</div>
      </div>
    }>
      <CartPageInner />
    </Suspense>
  );
}
