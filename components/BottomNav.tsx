// components/BottomNav.tsx - Fixed bottom navigation bar (Amazon-style)
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Search, ShoppingCart, User, BarChart3 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const NAV_ITEMS = [
  { icon: Home,         label: "Home",    path: "/" },
  { icon: Search,       label: "Search",  path: "/nowspeak" },
  { icon: ShoppingCart,  label: "Cart",    path: "/cart" },
  { icon: BarChart3,    label: "Admin",   path: "/admin" },
  { icon: User,         label: "Account", path: "#" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const cart = useAppStore((s) => s.cart);
  const cartCount = cart.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-amazon-background-dark border-t border-gray-200 dark:border-amazon-border-dark flex justify-around items-center py-1.5 pb-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path || (item.path === "/" && pathname === "/");
        const Icon = item.icon;
        const isCart = item.label === "Cart";

        return (
          <button
            key={item.label}
            onClick={() => item.path !== "#" && router.push(item.path)}
            className="flex flex-col items-center gap-0.5 relative bg-transparent border-none cursor-pointer px-4 py-0.5"
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-[#0F1111] dark:text-white" : "text-gray-400 dark:text-gray-500"
                }`}
              />
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#CC0C39] text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] ${
                isActive
                  ? "font-bold text-[#0F1111] dark:text-white"
                  : "font-normal text-gray-400 dark:text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
