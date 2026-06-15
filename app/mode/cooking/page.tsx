// app/mode/cooking/page.tsx — Recipe Mode dedicated screen
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import { ChefHat, Users, Mic } from 'lucide-react';

const RECIPES = [
  { id: 'aglio',   label: 'Aglio Olio Pasta',       time: '25 min', difficulty: 'Easy' },
  { id: 'biryani', label: 'Chicken Biryani',         time: '45 min', difficulty: 'Medium' },
  { id: 'dosa',    label: 'Masala Dosa',             time: '30 min', difficulty: 'Easy' },
  { id: 'paneer',  label: 'Paneer Butter Masala',    time: '35 min', difficulty: 'Medium' },
  { id: 'pizza',   label: 'Homemade Pizza',          time: '40 min', difficulty: 'Easy' },
  { id: 'dal',     label: 'Dal Tadka',               time: '20 min', difficulty: 'Easy' },
  { id: 'chole',   label: 'Chole Bhature',           time: '50 min', difficulty: 'Medium' },
  { id: 'fried',   label: 'Egg Fried Rice',          time: '15 min', difficulty: 'Easy' },
];

export default function CookingModePage() {
  const router = useRouter();
  const setMode = useAppStore(s => s.setMode);
  const [inputText, setInputText] = useState('');
  const [personCount, setPersonCount] = useState(3);

  function handleSubmit(text?: string) {
    const t = text || inputText;
    if (!t.trim()) return;
    setMode('cooking');
    router.push(`/intent?mode=cooking&preset=${encodeURIComponent(t)}&count=${personCount}&time=Now&diet=No+restriction`);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-10">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#007185] to-[#004B6E] px-4 py-6">
        <h1 className="text-white text-[24px] font-bold">Recipe Mode</h1>
        <p className="text-white/80 text-[14px] mt-1">
          Name a dish — we get all the ingredients
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Input */}
        <div className="bg-white border border-[#D5D9D9] rounded-lg p-4">
          <label className="text-[13px] font-semibold text-[#0F1111] mb-2 block">
            What are you cooking?
          </label>
          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Butter chicken for 4"
              className="flex-1 border-2 border-[#007185] rounded-lg h-12 px-3
                         text-[15px] text-[#0F1111] outline-none placeholder:text-[#8C9296]"
            />
            <button onClick={() => handleSubmit()}
              className="bg-[#007185] hover:bg-[#004B6E] text-white font-bold px-5 rounded-lg transition-colors">
              Cook
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 text-[13px]">
            <Users size={14} className="text-[#565959]" />
            <span className="text-[#565959]">Servings:</span>
            <button onClick={() => setPersonCount(Math.max(1, personCount - 1))}
              className="w-6 h-6 rounded border border-[#D5D9D9] flex items-center justify-center text-sm hover:border-[#007185]">−</button>
            <span className="font-bold text-[15px]">{personCount}</span>
            <button onClick={() => setPersonCount(Math.min(20, personCount + 1))}
              className="w-6 h-6 rounded border border-[#D5D9D9] flex items-center justify-center text-sm hover:border-[#007185]">+</button>
          </div>
        </div>

        {/* Voice */}
        <button onClick={() => router.push('/nowspeak')}
          className="w-full bg-white border border-[#D5D9D9] rounded-lg p-3 flex items-center gap-3 hover:border-[#007185] transition-colors">
          <div className="w-10 h-10 bg-[#007185]/10 rounded-full flex items-center justify-center">
            <Mic size={18} className="text-[#007185]" />
          </div>
          <span className="text-[14px] font-medium text-[#0F1111]">Or say the dish name</span>
        </button>

        {/* Popular recipes */}
        <div>
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-3 flex items-center gap-2">
            <ChefHat size={18} className="text-[#007185]" />
            Popular Recipes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {RECIPES.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => handleSubmit(`${recipe.label} for ${personCount} people`)}
                className="bg-white border border-[#D5D9D9] rounded-lg p-4 text-left
                           hover:border-[#007185] hover:shadow-md transition-all"
              >
                <p className="text-[14px] font-bold text-[#0F1111]">{recipe.label}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-[#565959] bg-[#F0F2F2] px-2 py-0.5 rounded">{recipe.time}</span>
                  <span className="text-[11px] text-[#007185] font-medium">{recipe.difficulty}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
