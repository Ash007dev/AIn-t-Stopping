// app/mode/intent/page.tsx — Shop by Occasion dedicated screen
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import { Calendar, Users, Clock, Leaf, Mic } from 'lucide-react';

const OCCASIONS = [
  { id: 'birthday',     label: 'Birthday Party',        sub: 'Cake, snacks, drinks & more' },
  { id: 'movie_night',  label: 'Movie Night',           sub: 'Popcorn, chips, drinks, dips' },
  { id: 'dinner_party', label: 'Dinner Party',          sub: 'Full course ingredients' },
  { id: 'puja',         label: 'Puja / Festival',       sub: 'Pooja items & prasad' },
  { id: 'bbq',          label: 'BBQ / Barbecue',        sub: 'Grills, marinades, sides' },
  { id: 'kids_party',   label: 'Kids Party',            sub: 'Fun snacks, juices, treats' },
  { id: 'game_night',   label: 'Game Night',            sub: 'Finger food & beverages' },
  { id: 'potluck',      label: 'Potluck',               sub: 'Crowd-pleasing dishes' },
];

export default function IntentModePage() {
  const router = useRouter();
  const setMode = useAppStore(s => s.setMode);
  const [inputText, setInputText] = useState('');
  const [personCount, setPersonCount] = useState(5);
  const [timeContext, setTimeContext] = useState('Tonight');
  const [dietary, setDietary] = useState('No restriction');

  function handleSubmit(text?: string) {
    const t = text || inputText;
    if (!t.trim()) return;
    setMode('intent');
    router.push(`/intent?mode=intent&preset=${encodeURIComponent(t)}&count=${personCount}&time=${timeContext}&diet=${dietary}`);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-10">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#FF9900] to-[#E47911] px-4 py-6">
        <h1 className="text-white text-[24px] font-bold">Shop by Occasion</h1>
        <p className="text-white/80 text-[14px] mt-1">
          Tell us the event — we build the perfect cart
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Custom input */}
        <div className="bg-white border border-[#D5D9D9] rounded-lg p-4">
          <label className="text-[13px] font-semibold text-[#0F1111] mb-2 block">
            Describe your event
          </label>
          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Birthday party for 10 kids"
              className="flex-1 border-2 border-[#FF9900] rounded-lg h-12 px-3
                         text-[15px] text-[#0F1111] outline-none placeholder:text-[#8C9296]"
            />
            <button onClick={() => handleSubmit()}
              className="bg-[#FF9900] hover:bg-[#E47911] text-white font-bold px-5 rounded-lg transition-colors">
              Go
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[13px]">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-[#565959]" />
              <button onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                className="w-6 h-6 rounded border border-[#D5D9D9] flex items-center justify-center text-sm hover:border-[#FF9900]">−</button>
              <span className="font-bold text-[15px] min-w-[20px] text-center">{personCount}</span>
              <button onClick={() => setPersonCount(Math.min(50, personCount + 1))}
                className="w-6 h-6 rounded border border-[#D5D9D9] flex items-center justify-center text-sm hover:border-[#FF9900]">+</button>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#565959]" />
              <select value={timeContext} onChange={e => setTimeContext(e.target.value)}
                className="border border-[#D5D9D9] rounded px-2 py-1 text-[13px] bg-white outline-none">
                <option>Tonight</option>
                <option>Tomorrow morning</option>
                <option>This weekend</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf size={14} className="text-[#565959]" />
              <select value={dietary} onChange={e => setDietary(e.target.value)}
                className="border border-[#D5D9D9] rounded px-2 py-1 text-[13px] bg-white outline-none">
                <option>No restriction</option>
                <option>Vegetarian</option>
                <option>Jain</option>
              </select>
            </div>
          </div>
        </div>

        {/* Or speak */}
        <button onClick={() => router.push('/nowspeak')}
          className="w-full bg-white border border-[#D5D9D9] rounded-lg p-3 flex items-center gap-3 hover:border-[#FF9900] transition-colors">
          <div className="w-10 h-10 bg-[#FF9900]/10 rounded-full flex items-center justify-center">
            <Mic size={18} className="text-[#FF9900]" />
          </div>
          <span className="text-[14px] font-medium text-[#0F1111]">Or speak your occasion</span>
        </button>

        {/* Occasion grid */}
        <div>
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-[#FF9900]" />
            Popular Occasions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {OCCASIONS.map(occ => (
              <button
                key={occ.id}
                onClick={() => handleSubmit(`${occ.label} for ${personCount} people`)}
                className="bg-white border border-[#D5D9D9] rounded-lg p-4 text-left
                           hover:border-[#FF9900] hover:shadow-md transition-all"
              >
                <p className="text-[14px] font-bold text-[#0F1111]">{occ.label}</p>
                <p className="text-[11px] text-[#565959] mt-1">{occ.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
