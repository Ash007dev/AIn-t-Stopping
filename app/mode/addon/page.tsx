// app/mode/addon/page.tsx — Add-on mode dedicated screen
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import { Plus, Mic } from 'lucide-react';

const COMMON_ADDONS = [
  'Milk', 'Bread', 'Eggs', 'Butter', 'Curd', 'Paneer',
  'Onions', 'Tomatoes', 'Phone Charger', 'Batteries',
  'Tissue Paper', 'Hand Soap', 'Detergent', 'Toothpaste',
];

export default function AddonModePage() {
  const router = useRouter();
  const setMode = useAppStore(s => s.setMode);
  const [inputText, setInputText] = useState('');

  function handleSubmit(text?: string) {
    const t = text || inputText;
    if (!t.trim()) return;
    setMode('addon');
    router.push(`/intent?mode=addon&preset=${encodeURIComponent(t)}&count=1&time=Now&diet=No+restriction`);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-10">
      <Navbar />

      <div className="bg-gradient-to-b from-[#CC0C39] to-[#A00A2D] px-4 py-6">
        <div className="flex items-center gap-2 mb-1">
          <Plus size={22} className="text-white" />
          <h1 className="text-white text-[24px] font-bold">Quick Add-on</h1>
        </div>
        <p className="text-white/80 text-[14px]">
          Forgot something? Add it in seconds.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="bg-white border border-[#D5D9D9] rounded-lg p-4">
          <label className="text-[13px] font-semibold text-[#0F1111] mb-2 block">
            What do you need?
          </label>
          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Milk, bread, and 6 eggs"
              className="flex-1 border-2 border-[#CC0C39] rounded-lg h-12 px-3
                         text-[15px] text-[#0F1111] outline-none placeholder:text-[#8C9296]"
            />
            <button onClick={() => handleSubmit()}
              className="bg-[#CC0C39] hover:bg-[#A00A2D] text-white font-bold px-5 rounded-lg transition-colors">
              Add
            </button>
          </div>
        </div>

        <button onClick={() => router.push('/nowspeak')}
          className="w-full bg-white border border-[#D5D9D9] rounded-lg p-3 flex items-center gap-3 hover:border-[#CC0C39] transition-colors">
          <div className="w-10 h-10 bg-[#CC0C39]/10 rounded-full flex items-center justify-center">
            <Mic size={18} className="text-[#CC0C39]" />
          </div>
          <span className="text-[14px] font-medium text-[#0F1111]">Or say what you need</span>
        </button>

        <div>
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-3">Common Add-ons</h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_ADDONS.map(item => (
              <button
                key={item}
                onClick={() => handleSubmit(item)}
                className="px-4 py-2 rounded-full bg-white border border-[#D5D9D9] text-[13px]
                           text-[#0F1111] font-medium hover:border-[#CC0C39] hover:bg-[#FFF0F3] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
