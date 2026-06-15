// app/checkout/page.tsx - Checkout page (Amazon exact)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, Plus, Smartphone, Wallet, Check, X, Pencil } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Address, PaymentMethod } from '@/store/useAppStore';
import { INDIAN_STATES, citiesForState } from '@/lib/india-locations';
import { computeCartTotal, getMaxEta, generateOrderId } from '@/lib/cart-utils';
import { getProductImage, getProductEmoji, getProductTint } from '@/lib/productImage';
import { groupCartByDarkStore } from '@/lib/dark-store-utils';
import Navbar from '@/components/Navbar';

const EMPTY_ADDRESS: Omit<Address, 'id'> = {
  label: 'Home', fullName: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useAppStore(s => s.cart);
  const clearCart = useAppStore(s => s.clearCart);

  const addToHistory = useAppStore(s => s.addToHistory);
  const occasionTitle = useAppStore(s => s.occasionTitle);
  const profile = useAppStore(s => s.profile);
  const addAddress = useAppStore(s => s.addAddress);
  const updateAddress = useAppStore(s => s.updateAddress);
  const setDefaultAddress = useAppStore(s => s.setDefaultAddress);
  const addPayment = useAppStore(s => s.addPayment);
  const setDefaultPayment = useAppStore(s => s.setDefaultPayment);

  const defaultAddress = profile.addresses.find(address => address.isDefault) || profile.addresses[0];
  const defaultPayment = profile.payments.find(payment => payment.isDefault) || profile.payments[0];

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [finalEta, setFinalEta] = useState(0);

  // Inline address add
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>(EMPTY_ADDRESS);

  // Inline payment add
  const [showPayForm, setShowPayForm] = useState(false);
  const [payType, setPayType] = useState<PaymentMethod['type']>('card');
  const [payForm, setPayForm] = useState({ card: '', name: '', expiry: '', upi: '' });

  function saveAddr() {
    if (!addrForm.fullName || !addrForm.line1 || addrForm.pincode.length < 6) return;
    if (!addrForm.state || !addrForm.city) return;
    if (addrForm.phone.length !== 10) return;
    if (editId) {
      updateAddress(editId, addrForm);
    } else {
      addAddress({ ...addrForm, isDefault: true });
    }
    setAddrForm(EMPTY_ADDRESS);
    setEditId(null);
    setShowAddrForm(false);
  }

  function openAddAddr() {
    setEditId(null);
    setAddrForm(EMPTY_ADDRESS);
    setShowAddrForm(true);
  }

  function openEditAddr(a: Address) {
    setEditId(a.id);
    const { id: _id, ...rest } = a;
    void _id;
    setAddrForm(rest);
    setShowAddrForm(true);
  }

  function savePayment() {
    if (payType === 'card') {
      const last4 = payForm.card.replace(/\D/g, '').slice(-4);
      if (last4.length < 4) return;
      addPayment({ type: 'card', label: `Card •••• ${last4}`, detail: payForm.name || payForm.expiry, isDefault: true });
    } else if (payType === 'upi') {
      if (!payForm.upi.includes('@')) return;
      addPayment({ type: 'upi', label: payForm.upi, detail: 'UPI', isDefault: true });
    } else {
      addPayment({ type: 'cod', label: 'Cash on Delivery', detail: 'Pay when delivered', isDefault: true });
    }
    setPayForm({ card: '', name: '', expiry: '', upi: '' });
    setShowPayForm(false);
  }

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
          <button onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) router.back();
              else router.push('/cart');
            }} className="text-[#007185] text-[14px] font-medium flex-shrink-0">
            &larr; Back
          </button>
          <h1 className="text-[28px] text-[#0F1111]">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-4">
            <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-[16px] font-bold text-[#0F1111] flex items-center gap-2">
                  <MapPin size={18} className="text-[#FF9900]" /> Delivery address
                </h2>
                {!showAddrForm && (
                  <button
                    onClick={openAddAddr}
                    className="text-[13px] font-medium text-[#007185] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add new
                  </button>
                )}
              </div>

              {/* Saved addresses (selectable) */}
              {profile.addresses.length > 0 && (
                <div className="space-y-2.5 mb-3">
                  {profile.addresses.map(a => {
                    const selected = defaultAddress?.id === a.id;
                    return (
                      <div
                        key={a.id}
                        onClick={() => setDefaultAddress(a.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') setDefaultAddress(a.id); }}
                        className={`w-full text-left flex items-start gap-3 rounded-xl border p-3.5 transition-colors cursor-pointer
                          ${selected ? 'border-[#FF9900] bg-[#FF9900]/5' : 'border-[#E0E3E3] hover:border-[#FF9900]'}`}
                      >
                        <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${selected ? 'border-[#FF9900]' : 'border-[#B7B7B7]'}`}>
                          {selected && <span className="w-2 h-2 rounded-full bg-[#FF9900]" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-[#0F1111]">
                            {a.fullName} &middot; <span className="text-[#565959]">{a.label}</span>
                          </p>
                          <p className="text-[13px] leading-5 text-[#565959]">
                            {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}
                          </p>
                          <p className="text-[12px] text-[#565959] mt-0.5">📞 {a.phone}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); openEditAddr(a); }}
                          className="flex-shrink-0 flex items-center gap-1 text-[12px] font-medium text-[#007185] hover:underline"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {profile.addresses.length === 0 && !showAddrForm && (
                <p className="text-[13px] text-[#565959] mb-2">No address yet — add one to continue.</p>
              )}

              {/* Inline add-address form */}
              {showAddrForm && (
                <div className="border border-[#E0E3E3] rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[14px] font-bold text-[#0F1111]">{editId ? 'Edit address' : 'New address'}</p>
                    <button onClick={() => { setShowAddrForm(false); setEditId(null); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F0F2F2]">
                      <X size={16} className="text-[#565959]" />
                    </button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {['Home', 'Work', 'Other'].map(l => (
                      <button key={l} type="button" onClick={() => setAddrForm({ ...addrForm, label: l })}
                        className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors
                          ${addrForm.label === l ? 'bg-[#FF9900] text-white border-[#FF9900]' : 'bg-white text-[#565959] border-[#D5D9D9]'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={addrForm.fullName} onChange={e => setAddrForm({ ...addrForm, fullName: e.target.value })}
                      placeholder="Full name" className="col-span-2 border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                    <input value={addrForm.line1} onChange={e => setAddrForm({ ...addrForm, line1: e.target.value })}
                      placeholder="House no, building, street" className="col-span-2 border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                    <input value={addrForm.line2} onChange={e => setAddrForm({ ...addrForm, line2: e.target.value })}
                      placeholder="Area, landmark (optional)" className="col-span-2 border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                    <select value={addrForm.state}
                      onChange={e => setAddrForm({ ...addrForm, state: e.target.value, city: '' })}
                      className={`border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900] ${addrForm.state ? 'text-[#0F1111]' : 'text-[#8C9296]'}`}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={addrForm.city}
                      onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                      disabled={!addrForm.state}
                      className={`border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900] disabled:bg-[#F0F2F2] disabled:cursor-not-allowed ${addrForm.city ? 'text-[#0F1111]' : 'text-[#8C9296]'}`}>
                      <option value="">{addrForm.state ? 'Select city' : 'Select state first'}</option>
                      {citiesForState(addrForm.state).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="Pincode" inputMode="numeric" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                    <div>
                      <input value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10-digit phone" inputMode="numeric"
                        className={`w-full border bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900] ${addrForm.phone.length > 0 && addrForm.phone.length !== 10 ? 'border-[#CC0C39]' : 'border-[#D5D9D9]'}`} />
                      {addrForm.phone.length > 0 && addrForm.phone.length !== 10 && (
                        <p className="text-[11px] text-[#CC0C39] mt-1">Enter a valid 10-digit number</p>
                      )}
                    </div>
                  </div>
                  <button onClick={saveAddr}
                    className="w-full mt-3 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold py-2.5 rounded-lg border border-[#FCD200] transition-colors text-[14px]">
                    {editId ? 'Update address' : 'Save & use this address'}
                  </button>
                </div>
              )}
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
              <div className="border-b border-[#D5D9D9] pb-4 mb-4">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <p className="text-[14px] font-bold text-[#0F1111] flex items-center gap-1.5">
                    <CreditCard size={16} className="text-[#007185]" /> Payment method
                  </p>
                  {!showPayForm && (
                    <button
                      onClick={() => setShowPayForm(true)}
                      className="text-[12px] font-medium text-[#007185] hover:underline flex items-center gap-1"
                    >
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>

                {/* Saved payments (selectable) */}
                {profile.payments.length > 0 && (
                  <div className="space-y-2">
                    {profile.payments.map(p => {
                      const selected = defaultPayment?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setDefaultPayment(p.id)}
                          className={`w-full text-left flex items-center gap-2.5 rounded-lg border p-2.5 transition-colors
                            ${selected ? 'border-[#FF9900] bg-[#FF9900]/5' : 'border-[#E0E3E3] hover:border-[#FF9900]'}`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                            ${selected ? 'border-[#FF9900]' : 'border-[#B7B7B7]'}`}>
                            {selected && <span className="w-2 h-2 rounded-full bg-[#FF9900]" />}
                          </span>
                          {p.type === 'card' ? <CreditCard size={16} className="text-[#232F3E] flex-shrink-0" />
                            : p.type === 'upi' ? <Smartphone size={16} className="text-[#232F3E] flex-shrink-0" />
                            : <Wallet size={16} className="text-[#232F3E] flex-shrink-0" />}
                          <span className="text-[13px] font-medium text-[#0F1111] truncate flex-1">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {profile.payments.length === 0 && !showPayForm && (
                  <p className="text-[12px] text-[#565959]">No payment method yet — add one below.</p>
                )}

                {/* Inline add-payment form */}
                {showPayForm && (
                  <div className="mt-2 border border-[#E0E3E3] rounded-xl p-3 animate-fade-in">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[13px] font-bold text-[#0F1111]">Add payment</p>
                      <button onClick={() => setShowPayForm(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F0F2F2]">
                        <X size={14} className="text-[#565959]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {([
                        { t: 'card', label: 'Card', Icon: CreditCard },
                        { t: 'upi',  label: 'UPI',  Icon: Smartphone },
                        { t: 'cod',  label: 'COD',  Icon: Wallet },
                      ] as const).map(o => (
                        <button key={o.t} type="button" onClick={() => setPayType(o.t)}
                          className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-colors
                            ${payType === o.t ? 'bg-[#FF9900]/10 border-[#FF9900]' : 'bg-white border-[#D5D9D9]'}`}>
                          <o.Icon size={17} className={payType === o.t ? 'text-[#FF9900]' : 'text-[#565959]'} />
                          <span className="text-[11px] font-medium text-[#0F1111]">{o.label}</span>
                        </button>
                      ))}
                    </div>

                    {payType === 'card' && (
                      <div className="space-y-2">
                        <input value={payForm.card} onChange={e => setPayForm({ ...payForm, card: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })}
                          placeholder="Card number" className="w-full border border-[#D5D9D9] bg-white rounded-lg h-9 px-3 text-[13px] outline-none focus:border-[#FF9900]" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={payForm.name} onChange={e => setPayForm({ ...payForm, name: e.target.value })}
                            placeholder="Name on card" className="border border-[#D5D9D9] bg-white rounded-lg h-9 px-3 text-[13px] outline-none focus:border-[#FF9900]" />
                          <input value={payForm.expiry} onChange={e => setPayForm({ ...payForm, expiry: e.target.value.slice(0, 5) })}
                            placeholder="MM/YY" className="border border-[#D5D9D9] bg-white rounded-lg h-9 px-3 text-[13px] outline-none focus:border-[#FF9900]" />
                        </div>
                      </div>
                    )}
                    {payType === 'upi' && (
                      <input value={payForm.upi} onChange={e => setPayForm({ ...payForm, upi: e.target.value })}
                        placeholder="yourname@upi" className="w-full border border-[#D5D9D9] bg-white rounded-lg h-9 px-3 text-[13px] outline-none focus:border-[#FF9900]" />
                    )}
                    {payType === 'cod' && (
                      <p className="text-[12px] text-[#565959] bg-[#F7F7F7] rounded-lg p-2.5 flex items-center gap-2">
                        <Check size={14} className="text-[#007600]" /> Pay with cash on delivery.
                      </p>
                    )}

                    <button onClick={savePayment}
                      className="w-full mt-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold py-2 rounded-lg border border-[#FCD200] transition-colors text-[13px]">
                      Save payment
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing || !defaultAddress || !defaultPayment}
                className="cta-glow w-full py-3 rounded-xl text-[14px] bg-gradient-to-r from-[#FFD814] to-[#FFB800]
                           hover:from-[#F7CA00] hover:to-[#F0A800]
                           text-[#0F1111] border border-[#FCD200] font-bold transition-all active:scale-[0.99]
                           flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPlacing ? 'Processing...' : 'Place your order'}
              </button>
              {(!defaultAddress || !defaultPayment) && (
                <p className="text-[12px] text-center text-[#CC0C39] mt-2">
                  {!defaultAddress ? 'Add a delivery address' : 'Add a payment method'} to place your order.
                </p>
              )}

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
