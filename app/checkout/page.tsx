// app/checkout/page.tsx — Checkout page (Amazon exact)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { computeCartTotal, getMaxEta, generateOrderId } from '@/lib/cart-utils';
import Navbar from '@/components/Navbar';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppStore(s => s.cart);
  const clearCart = useAppStore(s => s.clearCart);

  const addToHistory = useAppStore(s => s.addToHistory);
  const occasionTitle = useAppStore(s => s.occasionTitle);

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [finalEta, setFinalEta] = useState(0);

  useEffect(() => {
    if (cart.length === 0 && !orderConfirmed) {
      router.replace('/cart');
    }
  }, [cart, orderConfirmed, router]);

  const subtotal = computeCartTotal(cart);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const maxEta = getMaxEta(cart);

  function handlePlaceOrder() {
    setIsPlacing(true);
    setFinalEta(maxEta);
    const id = generateOrderId();
    const now = new Date().toISOString();
    setTimeout(() => {
      setOrderId(id);
      // Save to purchase history with full item details
      addToHistory({
        orderId: id,
        occasionTitle: occasionTitle || 'Your Order',
        cartSnapshot: cart,
        createdAt: now,
        total,
        date: now,
        itemCount: cart.length,
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image_url: i.image_url,
        })),
      });
      setIsPlacing(false);
      setOrderConfirmed(true);
      clearCart();
    }, 1500);
  }

  if (orderConfirmed) {
    return (
      <main className="bg-[#F0F2F2] min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto mt-8 bg-white border border-[#D5D9D9] rounded p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-[#D5D9D9] pb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#007600] flex-shrink-0">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                    fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-[#007600]">Order placed, thank you!</h1>
              <p className="text-[14px] text-[#0F1111]">Confirmation will be sent to your email.</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#565959] font-bold">Order Number</span>
              <span className="font-medium text-[#007185]">{orderId}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#565959] font-bold">Estimated Delivery</span>
              <span className="font-bold text-[#007600]">{finalEta} minutes</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 rounded-lg text-[14px] bg-[#F0F2F2] hover:bg-[#E3E6E6]
                       text-[#0F1111] border border-[#D5D9D9] font-medium transition-colors"
          >
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-4 px-4 pb-20">
        <h1 className="text-[28px] text-[#0F1111] mb-4">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left Column */}
          <div className="flex-1 bg-white border border-[#D5D9D9] rounded p-6">
            <h2 className="text-xl font-bold text-[#0F1111] mb-4">
              1 &nbsp; Review items and delivery
            </h2>

            <div className="border border-[#D5D9D9] rounded p-4 mb-4">
              <h3 className="font-bold text-[#007600] mb-1">
                Guaranteed delivery in {maxEta} mins
              </h3>
              <p className="text-[14px] text-[#565959] mb-4">Items shipped from Amazon Intent</p>

              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded border border-[#D5D9D9] p-1 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image_url} alt={item.name}
                           className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-[#0F1111] truncate">{item.name}</p>
                      <p className="text-[14px] text-[#CC0C39] font-bold">
                        ₹{item.price < 1000 ? item.price : Math.round(item.price / 100)}
                      </p>
                      <p className="text-[12px] text-[#565959] mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-white border border-[#D5D9D9] rounded p-5 sticky top-6">
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full py-2.5 rounded-lg text-[14px] bg-[#FFD814] hover:bg-[#F7CA00]
                           text-[#0F1111] border border-[#FCD200] font-bold transition-colors
                           flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isPlacing ? 'Processing...' : 'Place your order'}
              </button>

              <p className="text-[12px] text-center text-[#565959] border-b border-[#D5D9D9] pb-4 mb-4 mt-3">
                By placing your order, you agree to Amazon&apos;s privacy notice and conditions of use.
              </p>

              <h3 className="font-bold text-[#0F1111] mb-3">Order Summary</h3>
              <div className="space-y-1.5 text-[14px] text-[#0F1111] border-b border-[#D5D9D9] pb-3 mb-3">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>₹{tax}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-[#CC0C39]">Order Total:</span>
                <span className="font-bold text-[#CC0C39]">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
