// app/page.tsx - Home / Mode Selection
"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Card, Chip, Pill } from "@/components/ui";
import { Sparkles, ChefHat, Zap, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { resolveRegion } from "@/lib/region-map";

const SCENARIOS = [
  { label: "🎬 Movie night for 5", slug: "movie-night" },
  { label: "🥗 Breakfast for 8", slug: "breakfast" },
  { label: "🍝 Aglio olio for 3", slug: "aglio-olio" },
  { label: "🎉 Diwali for 20", slug: "diwali" },
  { label: "📚 Study session", slug: "study-session" },
];

function HomeContent() {
  const router = useRouter();
  const setMode = useAppStore((s) => s.setMode);
  const [deliveryLocation, setDeliveryLocation] = useState("Coimbatore, Tamil Nadu");

  useEffect(() => {
    const profileStr = localStorage.getItem("household_profile");
    if (!profileStr) {
      router.replace("/setup");
      return;
    }
    try {
      const profile = JSON.parse(profileStr);
      if (profile.pinCode) {
        const city = resolveRegion(profile.pinCode);
        if (city) {
          const stateSuffix =
            city === "Coimbatore" || city === "Chennai"
              ? ", Tamil Nadu"
              : city === "Bangalore"
              ? ", Karnataka"
              : city === "Mumbai" || city === "Pune"
              ? ", Maharashtra"
              : city === "Delhi"
              ? ", NCR"
              : "";
          setDeliveryLocation(`${city}${stateSuffix}`);
        }
      }
    } catch {}
  }, [router]);

  const handleModeSelect = (mode: "intent" | "cooking" | "addon") => {
    setMode(mode);
    if (mode === "addon") {
      router.push("/frictionless");
    } else {
      router.push(`/intent?mode=${mode}`);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col justify-between">
      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center px-4 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow badge */}
          <div className="mb-6">
            <Pill variant="default" className="gap-2 px-3 py-1 bg-[#161616] border-[#222222]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8170A] animate-pulse-dot" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                AI-Powered &bull; Under 6 seconds &bull; HackOn S6.0
              </span>
            </Pill>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[36px] sm:text-[48px] md:text-[56px] font-extrabold leading-tight text-text-primary mb-6">
            Tell us the occasion.<br />
            We&apos;ll <span className="text-accent-primary">handle</span> the shopping.
          </h1>

          {/* Subheadline */}
          <p className="text-[16px] md:text-[18px] text-text-secondary max-w-2xl mb-8 leading-relaxed">
            Describe a movie night, a recipe, or just one product &mdash; IntentCart builds your complete Amazon Now cart in seconds.
          </p>

          {/* Delivery address bar */}
          <div className="flex items-center justify-between bg-[#111111] border border-border-default rounded-full px-5 py-2.5 w-full max-w-[480px] text-sm shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 text-text-primary">
              <MapPin size={16} className="text-accent-primary" />
              <span className="font-medium text-text-secondary">
                Delivering to: <span className="text-text-primary font-semibold">{deliveryLocation}</span>
              </span>
              <ChevronDown size={14} className="text-text-muted" />
            </div>
            <Link
              href="/setup"
              className="text-accent-primary hover:text-accent-hover font-semibold transition-colors text-xs uppercase tracking-wider"
            >
              Change
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Mode Cards Grid */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Shopping by Intent */}
          <Card
            interactive
            accentHover
            className="p-6 flex flex-col justify-between h-full min-h-[300px]"
            onClick={() => handleModeSelect("intent")}
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-[rgba(232,23,10,0.12)] flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-accent-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-2">Shopping by Intent</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                Describe an occasion &mdash; movie night, Diwali party, study session. We build the complete cart.
              </p>
            </div>
            <div className="mt-auto">
              <div className="mb-6">
                <span className="inline-block bg-bg-elevated border border-border-bright text-[11px] font-medium text-text-secondary px-3 py-1 rounded-full animate-none">
                  Movie night for 5 tonight &rarr;
                </span>
              </div>
              <div className="flex items-center gap-1 text-accent-primary font-semibold text-sm hover:text-accent-hover transition-colors">
                <span>Start</span> <ArrowRight size={16} />
              </div>
            </div>
          </Card>

          {/* Card 2: Cooking Mode (Featured) */}
          <Card
            interactive
            className="p-6 flex flex-col justify-between h-full min-h-[300px] !border-accent-primary !shadow-[0_0_24px_rgba(232,23,10,0.15)] md:scale-[1.03] hover:!shadow-[0_0_32px_rgba(232,23,10,0.25)] hover:!-translate-y-1 transition-all duration-200 cursor-pointer relative"
            onClick={() => handleModeSelect("cooking")}
          >
            <div className="absolute top-3 right-3">
              <Pill variant="orange">⚡ Most Popular</Pill>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-[rgba(255,153,0,0.12)] flex items-center justify-center mb-6">
                <ChefHat size={24} className="text-accent-orange" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-2">Cooking Mode</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                Name a dish and serving count. We pick the exact ingredients at the right quantities.
              </p>
            </div>
            <div className="mt-auto">
              <div className="mb-6">
                <span className="inline-block bg-bg-elevated border border-border-bright text-[11px] font-medium text-text-secondary px-3 py-1 rounded-full animate-none">
                  Aglio olio for 3 &rarr;
                </span>
              </div>
              <div className="flex items-center gap-1 text-accent-primary font-semibold text-sm hover:text-accent-hover transition-colors">
                <span>Cook something</span> <ArrowRight size={16} />
              </div>
            </div>
          </Card>

          {/* Card 3: Frictionless Add-on */}
          <Card
            interactive
            accentHover
            className="p-6 flex flex-col justify-between h-full min-h-[300px]"
            onClick={() => handleModeSelect("addon")}
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-[rgba(232,23,10,0.12)] flex items-center justify-center mb-6">
                <Zap size={24} className="text-accent-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-2">Frictionless Add-on</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                Add one product. We suggest everything that goes with it, pre-quantified.
              </p>
            </div>
            <div className="mt-auto">
              <div className="mb-6">
                <span className="inline-block bg-bg-elevated border border-border-bright text-[11px] font-medium text-text-secondary px-3 py-1 rounded-full animate-none">
                  I&apos;m adding spaghetti &rarr;
                </span>
              </div>
              <div className="flex items-center gap-1 text-accent-primary font-semibold text-sm hover:text-accent-hover transition-colors">
                <span>Add a product</span> <ArrowRight size={16} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Quick Launch Chips */}
      <section className="w-full max-w-5xl mx-auto px-4 mt-8 mb-16 text-center">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-4 font-semibold">
          Quick-Launch Scenarios
        </p>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide w-full max-w-2xl mx-auto justify-start md:justify-center">
          {SCENARIOS.map((sc) => (
            <Chip
              key={sc.slug}
              onClick={() => router.push(`/cart?scenario=${sc.slug}`)}
              className="flex-shrink-0"
            >
              {sc.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-[12px] text-text-muted border-t border-[#161616] mt-auto">
        &copy; 2026 IntentCart &bull; HackOn with Amazon Season 6.0 &bull; Built on AWS Bedrock + Kiro
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
