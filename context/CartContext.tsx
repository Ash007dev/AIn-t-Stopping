// context/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CartContextValue {
  itemCount: number;
  total: number;
  setItemCount: (count: number) => void;
  setTotal: (total: number) => void;
  /** Convenience: add N items at a given price each */
  addItems: (count: number, priceEach: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue>({
  itemCount: 0,
  total: 0,
  setItemCount: () => {},
  setTotal: () => {},
  addItems: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  const addItems = (count: number, priceEach: number) => {
    setItemCount((prev) => prev + count);
    setTotal((prev) => prev + count * priceEach);
  };

  const clearCart = () => {
    setItemCount(0);
    setTotal(0);
  };

  return (
    <CartContext.Provider
      value={{ itemCount, total, setItemCount, setTotal, addItems, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
