// app/darkstores/page.tsx — Dark Stores based on pincode
'use client';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import { MapPin, Clock, Package } from 'lucide-react';

const DARK_STORES = [
  { id: 'ds-01', name: 'Amazon Fresh Hub — RS Puram',    distance: '1.2 km', eta: '12 min', categories: ['Groceries', 'Dairy', 'Snacks', 'Beverages'] },
  { id: 'ds-02', name: 'Amazon Fresh Hub — Gandhipuram', distance: '2.8 km', eta: '18 min', categories: ['Groceries', 'Fruits', 'Vegetables', 'Pantry'] },
  { id: 'ds-03', name: 'Amazon Fresh Hub — Saibaba Colony', distance: '3.5 km', eta: '22 min', categories: ['Electronics', 'Baby', 'Personal Care'] },
  { id: 'ds-04', name: 'Amazon Fresh Hub — Peelamedu',   distance: '5.1 km', eta: '28 min', categories: ['Groceries', 'Cleaning', 'Pet Supplies'] },
];

export default function DarkStoresPage() {
  const pinCode = useAppStore(s => s.pinCode);

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-10">
      <Navbar />

      <div className="bg-gradient-to-b from-[#232F3E] to-[#37475A] px-4 py-6">
        <h1 className="text-white text-[22px] font-bold">Nearby Dark Stores</h1>
        <p className="text-[#A8B4C0] text-[14px] mt-1 flex items-center gap-1.5">
          <MapPin size={14} />
          Showing stores near {pinCode}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {DARK_STORES.map(store => (
          <div key={store.id}
            className="bg-white border border-[#D5D9D9] rounded-lg p-4 hover:border-[#FF9900] transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[15px] font-bold text-[#0F1111]">{store.name}</p>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-[#565959]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {store.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {store.eta}
                  </span>
                </div>
              </div>
              <div className="bg-[#F0FFF0] border border-[#B7DFB7] rounded px-2 py-1">
                <p className="text-[11px] text-[#007600] font-bold">Open</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {store.categories.map(cat => (
                <span key={cat} className="text-[11px] bg-[#F0F2F2] text-[#565959] px-2 py-0.5 rounded">
                  <Package size={10} className="inline mr-1" />{cat}
                </span>
              ))}
            </div>
          </div>
        ))}

        <p className="text-[12px] text-[#8C9296] text-center pt-2">
          Your order may be sourced from multiple stores for fastest delivery
        </p>
      </div>
    </main>
  );
}
