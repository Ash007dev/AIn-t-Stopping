// app/checkout/page.tsx - Checkout page (Amazon exact)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { computeCartTotal, getMaxEta, generateOrderId } from '@/lib/cart-utils';
import { getProductImage, getProductEmoji, getProductTint } from '@/lib/productImage';
import { groupCartByDarkStore } from '@/lib/dark-store-utils';
import Navbar from '@/components/Navbar';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppStore(s => s.cart);
  const clearCart = useAppStore(s => s.clearCart);

  const addToHistory = useAppStore(s => s.addToHistory);
  const occasionTitle = useAppStore(s => s.occasionTitle);
  const profile = useAppStore(s => s.profile);
  const defaultAddress = profile.addresses.find(address => address.isDefault) || profile.addresses[0];
  const defaultPayment = profile.payments.find(payment => payment.isDefault) || profile.payments[0];

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
  const sourceCount = Object.keys(groupCartByDarkStore(cart)).length;

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
          return_policy: i.return_policy,
          dark_store: i.dark_store,
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
        <div className="max-w-2xl mx-auto mt-8 px-4">
          <div className="bg-white border border-[#D5D9D9] rounded-2xl p-8 shadow-sm animate-scale-in">
            <div className="flex items-center gap-4 mb-6 border-b border-[#D5D9D9] pb-5">
              <div className="w-14 h-14 rounded-full bg-[#007600]/10 flex items-center justify-center flex-shrink-0">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-[#007600] flex-shrink-0">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#007600]">Order placed, thank you!</h1>
                <p className="text-[14px] text-[#565959]">Confirmation will be sent to your email.</p>
              </div>
            </div>

            <div className="bg-[#F7FBF7] border border-[#CDEBCD] rounded-xl p-4 space-y-3 mb-8">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#565959] font-semibold">Order Number</span>
                <span className="font-bold text-[#007185]">{orderId}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#565959] font-semibold">Estimated Delivery</span>
                <span className="font-bold text-[#007600]">{finalEta} minutes</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-xl text-[14px] bg-[#F0F2F2] hover:bg-[#E3E6E6]
                         text-[#0F1111] border border-[#D5D9D9] font-bold transition-colors"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-4 px-4 pb-20">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-[#007185] text-[14px] font-medium flex-shrink-0">
            &larr; Back
          </button>
          <h1 className="text-[28px] text-[#0F1111]">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-4">
            <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#FF9900] mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[16px] font-bold text-[#0F1111]">Delivering to</h2>
                    <Link href="/profile" className="text-[13px] font-medium text-[#007185] hover:underline">
                      {defaultAddress ? 'Change' : 'Add address'}
                    </Link>
                  </div>
                  {defaultAddress ? (
                    <>
                      <p className="mt-1 text-[14px] font-semibold text-[#0F1111]">
                        {defaultAddress.fullName} &middot; {defaultAddress.label}
                      </p>
                      <p className="text-[13px] leading-5 text-[#565959]">
                        {defaultAddress.line1}
                        {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ''}, {defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-[13px] text-[#565959]">
                      Add an address in your profile for a faster demo checkout.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#0F1111] mb-4">
              1 &nbsp; Review items and delivery
            </h2>

            <div className="border border-[#CDEBCD] bg-[#F7FBF7] rounded-xl p-4 mb-4">
              <h3 className="font-bold text-[#007600] mb-1 flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#007600"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Guaranteed delivery in {maxEta} mins
              </h3>
              <p className="text-[14px] text-[#565959] mb-4">
                {sourceCount > 1
                  ? `Optimally sourced from ${sourceCount} nearby Amazon Now hubs`
                  : 'Sourced from your nearest Amazon Now hub'}
              </p>

              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white rounded-xl p-2 border border-[#E6E8E8]">
                    <div className="w-16 h-16 rounded-lg border border-[#D5D9D9] p-1 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: getProductTint(item) }}>
                      {getProductImage(item) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={getProductImage(item) as string} alt={item.name}
                             className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[30px] leading-none" role="img" aria-label={item.name}>{getProductEmoji(item)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 self-center">
                      <p className="text-[14px] font-medium text-[#0F1111] truncate">{item.name}</p>
                      <p className="text-[14px] text-[#CC0C39] font-bold">
                        &#8377;{item.price < 1000 ? item.price : Math.round(item.price / 100)}
                      </p>
                      <p className="text-[12px] text-[#565959] mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-white border border-[#D5D9D9] rounded-2xl p-5 sticky top-6 shadow-sm">
              <div className="flex items-start gap-2.5 border-b border-[#D5D9D9] pb-4 mb-4">
                <CreditCard size={18} className="text-[#007185] mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-bold text-[#0F1111]">Payment method</p>
                    <Link href="/profile" className="text-[12px] font-medium text-[#007185] hover:underline">
                      {defaultPayment ? 'Change' : 'Add'}
                    </Link>
                  </div>
                  <p className="text-[12px] text-[#565959] truncate">
                    {defaultPayment?.label || 'Pay on delivery for this demo'}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="cta-glow w-full py-3 rounded-xl text-[14px] bg-gradient-to-r from-[#FFD814] to-[#FFB800]
                           hover:from-[#F7CA00] hover:to-[#F0A800]
                           text-[#0F1111] border border-[#FCD200] font-bold transition-all active:scale-[0.99]
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
                  <span>&#8377;{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>&#8377;0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>&#8377;{tax}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-[#CC0C39]">Order Total:</span>
                <span className="font-bold text-[#CC0C39]">&#8377;{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
