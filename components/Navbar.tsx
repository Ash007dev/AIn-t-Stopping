// components/Navbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Zap,
  ChevronDown,
  MapPin,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const CITIES = [
  { label: "Coimbatore, Tamil Nadu", active: true },
  { label: "Bengaluru, Karnataka", active: false },
  { label: "Chennai, Tamil Nadu", active: false },
  { label: "Mumbai, Maharashtra", active: false },
];

// const PROFILE_ITEMS = ["Edit Profile", "Order History", "Sign Out"];

export default function Navbar() {
  const { itemCount } = useCart();
  const router = useRouter();

  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0].label);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close dropdowns on outside click
  const cityRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(10,10,10,0.92)",
        borderBottom: "1px solid #1a1a1a",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Left: Logo ──────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="IntentCart home"
        >
          {/* Icon stack: ShoppingCart + Zap overlay */}
          <div className="relative w-8 h-8">
            <ShoppingCart
              size={28}
              className="text-[#E8170A] transition-transform duration-200 group-hover:scale-105"
              strokeWidth={1.75}
            />
            <Zap
              size={11}
              className="absolute -bottom-0.5 -right-0.5 text-[#E8170A] fill-[#E8170A]"
            />
          </div>

          {/* Wordmark */}
          <div className="flex flex-col leading-none">
            <span
              className="font-bold text-white text-[15px] tracking-tight"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              IntentCart
            </span>
            <span className="text-[10px] text-[#666666] uppercase tracking-widest mt-0.5">
              by Amazon Now
            </span>
          </div>
        </Link>

        {/* ── Center: Address pill ─────────────────────────────────── */}
        <div className="relative" ref={cityRef}>
          <button
            id="city-picker-btn"
            onClick={() => setCityOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#A0A0A0] transition-all duration-150"
            style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
            }}
            aria-expanded={cityOpen}
            aria-haspopup="listbox"
          >
            <MapPin size={12} className="text-[#E8170A] shrink-0" />
            <span className="max-w-[140px] truncate hidden sm:block">{selectedCity}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-150 shrink-0 ${cityOpen ? "rotate-180" : ""}`}
            />
          </button>

          {cityOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-52 rounded-[10px] overflow-hidden animate-scale-in z-50"
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
              role="listbox"
              aria-label="Select delivery city"
            >
              {CITIES.map((city) => (
                <button
                  key={city.label}
                  role="option"
                  aria-selected={selectedCity === city.label}
                  onClick={() => {
                    setSelectedCity(city.label);
                    setCityOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors duration-100"
                  style={{
                    color: selectedCity === city.label ? "#E8170A" : "#A0A0A0",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#222222";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <MapPin size={10} className="shrink-0" />
                  {city.label}
                  {selectedCity === city.label && (
                    <span className="ml-auto text-[#E8170A]">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Cart + Profile ────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Cart icon */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full transition-colors duration-150 hover:bg-[#1a1a1a]"
            aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
            id="navbar-cart-icon"
          >
            <ShoppingCart size={20} className="text-[#A0A0A0]" strokeWidth={1.75} />
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center rounded-full text-[10px] font-bold text-white leading-none px-1 animate-scale-in"
                style={{ background: "#E8170A" }}
                aria-live="polite"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Profile icon */}
          <div className="relative" ref={profileRef}>
            <button
              id="navbar-profile-btn"
              onClick={() => setProfileOpen((v) => !v)}
              className="p-2 rounded-full transition-colors duration-150 hover:bg-[#1a1a1a]"
              aria-label="User profile"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <User size={20} className="text-[#A0A0A0]" strokeWidth={1.75} />
            </button>

            {profileOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-44 rounded-[10px] overflow-hidden animate-scale-in z-50"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
                role="menu"
                aria-label="Profile menu"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-3 py-2.5"
                  style={{ borderBottom: "1px solid #2a2a2a" }}
                >
                  <span className="text-xs font-semibold text-white">Account</span>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="text-[#666666] hover:text-[#A0A0A0] transition-colors"
                    aria-label="Close profile menu"
                  >
                    <X size={12} />
                  </button>
                </div>

                  <button
                    key="edit-profile"
                    role="menuitem"
                    className="w-full text-left px-3 py-2.5 text-xs transition-colors duration-100"
                    style={{ color: "#A0A0A0" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#222222"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    onClick={() => { setProfileOpen(false); router.push("/setup"); }}
                  >
                    Edit Profile
                  </button>
                  <button
                    key="order-history"
                    role="menuitem"
                    className="w-full text-left px-3 py-2.5 text-xs transition-colors duration-100"
                    style={{ color: "#A0A0A0" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#222222"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  onClick={() => { setProfileOpen(false); router.push("/history"); }}
                  >
                    Order History
                  </button>
                  <button
                    key="sign-out"
                    role="menuitem"
                    className="w-full text-left px-3 py-2.5 text-xs transition-colors duration-100"
                    style={{ color: "#E8170A" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#222222"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    onClick={() => {
                      setProfileOpen(false);
                      localStorage.removeItem("household_profile");
                      router.push("/setup");
                    }}
                  >
                    Sign Out
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
