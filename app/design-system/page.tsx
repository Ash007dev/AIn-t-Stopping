"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, Info, Layers, RefreshCw } from "lucide-react";

export default function DesignSystemPage() {
  const colors = [
    { name: "bg-primary", hex: "#0a0a0a", desc: "Main page background" },
    { name: "bg-card", hex: "#111111", desc: "Card containers" },
    { name: "bg-elevated", hex: "#1a1a1a", desc: "Popups & inner sections" },
    { name: "border-default", hex: "#222222", desc: "Default border lines" },
    { name: "border-bright", hex: "#333333", desc: "Hovered/focused borders" },
    { name: "accent-primary", hex: "#E8170A", desc: "Main brand action red" },
    { name: "accent-hover", hex: "#FF2010", desc: "Hover action red" },
    { name: "accent-orange", hex: "#FF9900", desc: "Warning & highlight orange" },
    { name: "text-primary", hex: "#FFFFFF", desc: "White primary titles/body" },
    { name: "text-secondary", hex: "#A0A0A0", desc: "Secondary readable text" },
    { name: "text-muted", hex: "#555555", desc: "Muted hints & descriptions" },
    { name: "success", hex: "#22C55E", desc: "In-stock & confirmation green" },
    { name: "star", hex: "#FBBF24", desc: "Rating star gold" },
  ];

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-bg-primary text-text-primary px-6 py-16 max-w-5xl mx-auto flex flex-col gap-16"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-[40px] font-bold tracking-tight text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="text-accent-orange animate-pulse" size={32} />
          Design System Showcase
        </h1>
        <p className="text-text-secondary text-[16px] max-w-2xl leading-relaxed">
          IntentCart design tokens foundation, including typography, colors, custom shadows, border radii, and animations.
        </p>
      </div>

      {/* Section 1: Typography */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[24px] font-semibold border-b border-border-default pb-2 flex items-center gap-2">
          <Eye size={20} className="text-accent-primary" />
          Typography Scale
        </h2>
        <div className="grid gap-8 bg-bg-card border border-border-default rounded-[16px] p-8 card-shadow">
          
          {/* Display XL */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">Display XL (Sora 56px/800)</span>
            <div className="flex-1 font-display text-[56px] font-extrabold leading-tight text-text-primary">
              Movie Night
            </div>
          </div>

          {/* Display L */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">Display L (Sora 40px/700)</span>
            <div className="flex-1 font-display text-[40px] font-bold leading-tight text-text-primary">
              Aglio Olio recipe
            </div>
          </div>

          {/* H1 */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">H1 (Sora 32px/700)</span>
            <div className="flex-1 font-display text-[32px] font-bold leading-snug text-text-primary">
              Diwali Celebrations
            </div>
          </div>

          {/* H2 */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">H2 (Inter 24px/600)</span>
            <div className="flex-1 font-sans text-[24px] font-semibold leading-snug text-text-primary">
              Frequently Bought Items
            </div>
          </div>

          {/* H3 */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">H3 (Inter 20px/600)</span>
            <div className="flex-1 font-sans text-[20px] font-semibold leading-snug text-text-primary">
              Select your delivery speed
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">Body (Inter 16px/400)</span>
            <div className="flex-1 font-sans text-[16px] font-normal leading-relaxed text-text-secondary">
              Amul Taza Homogenised Milk is locally sourced and delivered within 12 minutes from our North fulfillment center.
            </div>
          </div>

          {/* Small */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">Small (Inter 14px)</span>
            <div className="flex-1 font-sans text-[14px] font-normal leading-relaxed text-text-secondary">
              Estimated Delivery time: 14 mins · Free delivery eligible.
            </div>
          </div>

          {/* Caption */}
          <div className="flex flex-col md:flex-row md:items-baseline border-b border-border-default pb-6 gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">Caption (Inter 12px muted)</span>
            <div className="flex-1 font-sans text-[12px] font-normal text-text-muted leading-relaxed">
              * Perishable item: No returns eligible. Please check quantities prior to buying.
            </div>
          </div>

          {/* Badge */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-4">
            <span className="w-40 font-sans text-[12px] text-text-muted uppercase tracking-wider">Badge (Inter 11px/700 uppercase)</span>
            <div className="flex-1">
              <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.08em] bg-accent-primary text-text-primary px-2.5 py-1 rounded-[999px]">
                BESTSELLER
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Color Palette */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[24px] font-semibold border-b border-border-default pb-2 flex items-center gap-2">
          <Layers size={20} className="text-accent-primary" />
          Color Palette
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div key={c.name} className="border border-border-default bg-bg-card rounded-[16px] p-4 flex flex-col gap-4 card-shadow">
              <div className="h-16 rounded-[12px] border border-border-default" style={{ backgroundColor: c.hex }} />
              <div>
                <p className="font-sans text-[14px] font-semibold text-text-primary">{c.name}</p>
                <p className="font-sans text-[12px] text-text-secondary mt-0.5">{c.hex}</p>
                <p className="font-sans text-[12px] text-text-muted mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Shadows & Border Radii */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[24px] font-semibold border-b border-border-default pb-2 flex items-center gap-2">
          <Info size={20} className="text-accent-primary" />
          Border Radii & Shadows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Shadow */}
          <div className="bg-bg-card rounded-[var(--radius-card)] p-6 card-shadow flex flex-col gap-4">
            <h3 className="font-sans text-[16px] font-semibold">Default Card Shadow</h3>
            <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
              Standard styling with border radius <code>--radius-card</code> (16px) and default shadow utility <code>.card-shadow</code>.
            </p>
            <div className="flex gap-3 mt-2">
              <button className="bg-bg-elevated border border-border-bright text-text-primary px-4 py-2 rounded-[var(--radius-button)] font-sans text-[14px] hover:bg-border-default transition-colors">
                Radius Button (12px)
              </button>
              <input
                type="text"
                placeholder="Radius Input (12px)"
                className="bg-bg-primary border border-border-default px-3 py-2 rounded-[var(--radius-input)] font-sans text-[14px] text-text-primary focus:outline-none focus:border-border-bright max-w-[150px]"
              />
            </div>
          </div>

          {/* Hover Shadow */}
          <div className="bg-bg-card rounded-[var(--radius-card)] p-6 card-shadow hover:card-shadow-hover transition-all duration-300 flex flex-col gap-4 cursor-pointer">
            <div className="flex justify-between items-start">
              <h3 className="font-sans text-[16px] font-semibold">Hover Card Glow</h3>
              <span className="bg-[#FF9900]/10 text-accent-orange text-[10px] px-2 py-0.5 rounded-[var(--radius-pill)] font-bold uppercase tracking-wider">
                Hover Me
              </span>
            </div>
            <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
              Hover to trigger <code>.card-shadow-hover</code>, exposing the red brand glow (15% opacity red shadow) and border shift.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Keyframe Animations */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[24px] font-semibold border-b border-border-default pb-2 flex items-center gap-2">
          <RefreshCw size={20} className="text-accent-primary" />
          Animations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pulse Dot */}
          <div className="bg-bg-card border border-border-default rounded-[16px] p-6 card-shadow flex flex-col gap-4 justify-between">
            <div>
              <h3 className="font-sans text-[16px] font-semibold">Pulse Dot</h3>
              <p className="font-sans text-[14px] text-text-secondary mt-1 leading-relaxed">
                Represents pipeline active status using the infinite dot pulse animation.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-3.5 h-3.5 bg-accent-primary rounded-full animate-pulse-dot" />
              <span className="font-sans text-[14px] text-text-primary font-medium">AI Agent Curator active...</span>
            </div>
          </div>

          {/* Shimmer Skeleton */}
          <div className="bg-bg-card border border-border-default rounded-[16px] p-6 card-shadow flex flex-col gap-4">
            <div>
              <h3 className="font-sans text-[16px] font-semibold">Skeleton Shimmer</h3>
              <p className="font-sans text-[14px] text-text-secondary mt-1 leading-relaxed">
                Skeleton loading state utilizing the gradient shimmer sweep animation.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 mt-4">
              <div className="h-6 w-3/4 rounded-[4px] animate-shimmer" />
              <div className="h-4 w-1/2 rounded-[4px] animate-shimmer" />
              <div className="h-4 w-5/6 rounded-[4px] animate-shimmer" />
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
