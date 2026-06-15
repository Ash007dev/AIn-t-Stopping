// app/profile/page.tsx — Account: profile, addresses, payment, appearance
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import type { Address, PaymentMethod } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import ThemeToggle from '@/components/ThemeToggle';
import {
  User, MapPin, CreditCard, Package, Plus, Pencil, Trash2, X,
  Check, Moon, ChevronRight, Smartphone, Wallet,
} from 'lucide-react';

const EMPTY_ADDRESS: Omit<Address, 'id'> = {
  label: 'Home', fullName: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const profile = useAppStore(s => s.profile);
  const setProfileInfo = useAppStore(s => s.setProfileInfo);
  const addAddress = useAppStore(s => s.addAddress);
  const updateAddress = useAppStore(s => s.updateAddress);
  const removeAddress = useAppStore(s => s.removeAddress);
  const setDefaultAddress = useAppStore(s => s.setDefaultAddress);
  const addPayment = useAppStore(s => s.addPayment);
  const removePayment = useAppStore(s => s.removePayment);
  const setDefaultPayment = useAppStore(s => s.setDefaultPayment);
  const purchaseHistory = useAppStore(s => s.purchaseHistory);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // profile info editing
  const [editingInfo, setEditingInfo] = useState(false);
  const [info, setInfo] = useState({ name: profile.name, email: profile.email, phone: profile.phone });
  useEffect(() => setInfo({ name: profile.name, email: profile.email, phone: profile.phone }), [profile.name, profile.email, profile.phone]);

  // address modal
  const [addrModal, setAddrModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>(EMPTY_ADDRESS);

  // payment modal
  const [payModal, setPayModal] = useState(false);
  const [payType, setPayType] = useState<PaymentMethod['type']>('card');
  const [payForm, setPayForm] = useState({ card: '', name: '', expiry: '', upi: '' });

  function openAddAddr() {
    setEditId(null);
    setAddrForm(EMPTY_ADDRESS);
    setAddrModal(true);
  }
  function openEditAddr(a: Address) {
    setEditId(a.id);
    setAddrForm({ ...a });
    setAddrModal(true);
  }
  function saveAddr() {
    if (!addrForm.fullName || !addrForm.line1 || !addrForm.pincode) return;
    if (editId) updateAddress(editId, addrForm);
    else addAddress(addrForm);
    setAddrModal(false);
  }
  function savePayment() {
    if (payType === 'card') {
      const last4 = payForm.card.replace(/\D/g, '').slice(-4);
      if (last4.length < 4) return;
      addPayment({ type: 'card', label: `Card •••• ${last4}`, detail: payForm.name || payForm.expiry });
    } else if (payType === 'upi') {
      if (!payForm.upi.includes('@')) return;
      addPayment({ type: 'upi', label: payForm.upi, detail: 'UPI' });
    } else {
      addPayment({ type: 'cod', label: 'Cash on Delivery', detail: 'Pay when delivered' });
    }
    setPayForm({ card: '', name: '', expiry: '', upi: '' });
    setPayModal(false);
  }

  const initials = (profile.name || 'You').trim().slice(0, 2).toUpperCase();

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-24">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* Header card */}
        <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9900] to-[#E47911]
                            flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-bold text-[#0F1111] truncate">
                {profile.name || 'Welcome 👋'}
              </h1>
              <p className="text-[13px] text-[#565959] truncate">
                {profile.email || 'Add your details to personalise your account'}
              </p>
            </div>
            <button
              onClick={() => setEditingInfo(v => !v)}
              className="flex-shrink-0 text-[13px] text-[#007185] font-medium flex items-center gap-1 hover:underline"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>

          {editingInfo && (
            <div className="mt-4 grid sm:grid-cols-3 gap-3 animate-fade-in">
              <input
                value={info.name}
                onChange={e => setInfo({ ...info, name: e.target.value })}
                placeholder="Full name"
                className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] text-[#0F1111] outline-none focus:border-[#FF9900]"
              />
              <input
                value={info.email}
                onChange={e => setInfo({ ...info, email: e.target.value })}
                placeholder="Email"
                className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] text-[#0F1111] outline-none focus:border-[#FF9900]"
              />
              <input
                value={info.phone}
                onChange={e => setInfo({ ...info, phone: e.target.value })}
                placeholder="Phone"
                className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] text-[#0F1111] outline-none focus:border-[#FF9900]"
              />
              <button
                onClick={() => { setProfileInfo(info); setEditingInfo(false); }}
                className="sm:col-span-3 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold py-2.5 rounded-lg border border-[#FCD200] transition-colors text-[14px]"
              >
                Save details
              </button>
            </div>
          )}
        </section>

        {/* Appearance */}
        <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#232F3E]/10 flex items-center justify-center">
              <Moon size={18} className="text-[#232F3E]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#0F1111]">Appearance</p>
              <p className="text-[12px] text-[#565959]">Switch between light and dark mode</p>
            </div>
          </div>
          <ThemeToggle />
        </section>

        {/* Delivery addresses */}
        <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#FF9900]" />
              <h2 className="text-[16px] font-bold text-[#0F1111]">Delivery addresses</h2>
            </div>
            <button
              onClick={openAddAddr}
              className="text-[13px] text-[#007185] font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={15} /> Add
            </button>
          </div>

          {profile.addresses.length === 0 ? (
            <p className="text-[13px] text-[#8C9296] py-4 text-center">No addresses yet. Add one for faster checkout.</p>
          ) : (
            <div className="space-y-2.5">
              {profile.addresses.map(a => (
                <div key={a.id} className="border border-[#E0E3E3] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-[#0F1111]">{a.label}</span>
                      {a.isDefault && (
                        <span className="text-[10px] font-semibold text-[#007600] bg-[#007600]/10 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#0F1111]">{a.fullName}</p>
                    <p className="text-[12px] text-[#565959] leading-snug">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city} {a.state} - {a.pincode}
                    </p>
                    <p className="text-[12px] text-[#565959] mt-0.5">📞 {a.phone}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {!a.isDefault && (
                        <button onClick={() => setDefaultAddress(a.id)} className="text-[12px] text-[#007185] font-medium hover:underline">
                          Set default
                        </button>
                      )}
                      <button onClick={() => openEditAddr(a)} className="text-[12px] text-[#007185] font-medium flex items-center gap-1 hover:underline">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => removeAddress(a.id)} className="text-[12px] text-[#CC0C39] font-medium flex items-center gap-1 hover:underline">
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payment methods */}
        <section className="bg-white border border-[#D5D9D9] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-[#007185]" />
              <h2 className="text-[16px] font-bold text-[#0F1111]">Payment methods</h2>
            </div>
            <button
              onClick={() => setPayModal(true)}
              className="text-[13px] text-[#007185] font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={15} /> Add
            </button>
          </div>

          {profile.payments.length === 0 ? (
            <p className="text-[13px] text-[#8C9296] py-4 text-center">No payment methods saved yet.</p>
          ) : (
            <div className="space-y-2.5">
              {profile.payments.map(p => (
                <div key={p.id} className="border border-[#E0E3E3] rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F2F4F4] flex items-center justify-center flex-shrink-0">
                    {p.type === 'card' ? <CreditCard size={18} className="text-[#232F3E]" />
                      : p.type === 'upi' ? <Smartphone size={18} className="text-[#232F3E]" />
                      : <Wallet size={18} className="text-[#232F3E]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-[#0F1111] truncate">{p.label}</p>
                      {p.isDefault && (
                        <span className="text-[10px] font-semibold text-[#007600] bg-[#007600]/10 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    {p.detail && <p className="text-[12px] text-[#565959] truncate">{p.detail}</p>}
                  </div>
                  {!p.isDefault && (
                    <button onClick={() => setDefaultPayment(p.id)} className="text-[12px] text-[#007185] font-medium hover:underline flex-shrink-0">
                      Set default
                    </button>
                  )}
                  <button onClick={() => removePayment(p.id)} className="text-[#CC0C39] flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orders quick link */}
        <button
          onClick={() => router.push('/orders')}
          className="w-full bg-white border border-[#D5D9D9] rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:border-[#FF9900] transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 flex items-center justify-center">
            <Package size={18} className="text-[#FF9900]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-bold text-[#0F1111]">Your orders</p>
            <p className="text-[12px] text-[#565959]">
              {mounted ? `${purchaseHistory.length} order${purchaseHistory.length === 1 ? '' : 's'}` : '—'} placed
            </p>
          </div>
          <ChevronRight size={18} className="text-[#8C9296]" />
        </button>
      </div>

      {/* Address modal */}
      {addrModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center"
             onClick={() => setAddrModal(false)}>
          <div className="bg-white w-full sm:w-[460px] sm:rounded-2xl rounded-t-2xl p-5 animate-slide-up max-h-[90vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#0F1111]">{editId ? 'Edit address' : 'Add delivery address'}</h3>
              <button onClick={() => setAddrModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F2F2]">
                <X size={18} className="text-[#565959]" />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              {['Home', 'Work', 'Other'].map(l => (
                <button key={l} onClick={() => setAddrForm({ ...addrForm, label: l })}
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
              <input value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                placeholder="City" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
              <input value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                placeholder="State" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
              <input value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="Pincode" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
              <input value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="Phone" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
            </div>

            <label className="flex items-center gap-2 mt-3 text-[13px] text-[#0F1111] cursor-pointer">
              <input type="checkbox" checked={!!addrForm.isDefault} onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
              Set as default address
            </label>

            <button onClick={saveAddr}
              className="w-full mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold py-2.5 rounded-lg border border-[#FCD200] transition-colors text-[14px]">
              {editId ? 'Update address' : 'Save address'}
            </button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center"
             onClick={() => setPayModal(false)}>
          <div className="bg-white w-full sm:w-[420px] sm:rounded-2xl rounded-t-2xl p-5 animate-slide-up"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#0F1111]">Add payment method</h3>
              <button onClick={() => setPayModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F2F2]">
                <X size={18} className="text-[#565959]" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {([
                { t: 'card', label: 'Card', Icon: CreditCard },
                { t: 'upi',  label: 'UPI',  Icon: Smartphone },
                { t: 'cod',  label: 'COD',  Icon: Wallet },
              ] as const).map(o => (
                <button key={o.t} onClick={() => setPayType(o.t)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors
                    ${payType === o.t ? 'bg-[#FF9900]/10 border-[#FF9900]' : 'bg-white border-[#D5D9D9]'}`}>
                  <o.Icon size={20} className={payType === o.t ? 'text-[#FF9900]' : 'text-[#565959]'} />
                  <span className="text-[12px] font-medium text-[#0F1111]">{o.label}</span>
                </button>
              ))}
            </div>

            {payType === 'card' && (
              <div className="space-y-3">
                <input value={payForm.card} onChange={e => setPayForm({ ...payForm, card: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })}
                  placeholder="Card number" className="w-full border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={payForm.name} onChange={e => setPayForm({ ...payForm, name: e.target.value })}
                    placeholder="Name on card" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                  <input value={payForm.expiry} onChange={e => setPayForm({ ...payForm, expiry: e.target.value.slice(0, 5) })}
                    placeholder="MM/YY" className="border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
                </div>
              </div>
            )}
            {payType === 'upi' && (
              <input value={payForm.upi} onChange={e => setPayForm({ ...payForm, upi: e.target.value })}
                placeholder="yourname@upi" className="w-full border border-[#D5D9D9] bg-white rounded-lg h-10 px-3 text-[14px] outline-none focus:border-[#FF9900]" />
            )}
            {payType === 'cod' && (
              <p className="text-[13px] text-[#565959] bg-[#F7F7F7] rounded-lg p-3 flex items-center gap-2">
                <Check size={15} className="text-[#007600]" /> Pay with cash when your order is delivered.
              </p>
            )}

            <button onClick={savePayment}
              className="w-full mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold py-2.5 rounded-lg border border-[#FCD200] transition-colors text-[14px]">
              Save payment method
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
