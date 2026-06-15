// app/mode/predictive/page.tsx - Guide Me dedicated screen
'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import { Brain, Baby, Home, Laptop, Thermometer, GraduationCap, Heart, Dog } from 'lucide-react';

const SITUATIONS = [
  { id: 'new_baby',           label: 'New Baby at Home',       desc: 'Diapers, wipes, formula, baby food & care essentials', Icon: Baby,            color: '#FF9900', items: '~15 items', est: '₹2,500' },
  { id: 'new_home',           label: 'Just Moved In',          desc: 'Kitchen basics, cleaning supplies, groceries starter kit', Icon: Home,          color: '#007185', items: '~20 items', est: '₹3,000' },
  { id: 'home_office',        label: 'WFH Setup',              desc: 'Snacks, coffee, energy drinks, desk essentials',  Icon: Laptop,          color: '#232F3E', items: '~12 items', est: '₹1,500' },
  { id: 'sick_person',        label: 'Someone Sick',           desc: 'Soups, ORS, tissues, comfort food, medicines',    Icon: Thermometer,     color: '#CC0C39', items: '~10 items', est: '₹800' },
  { id: 'college_first_week', label: 'College First Week',     desc: 'Hostel survival kit - instant noodles to toiletries', Icon: GraduationCap, color: '#4CAF50', items: '~18 items', est: '₹2,000' },
  { id: 'fitness_start',      label: 'Starting Fitness',       desc: 'Protein, oats, fruits, supplements, gym snacks', Icon: Heart,            color: '#E91E63', items: '~12 items', est: '₹1,800' },
  { id: 'new_pet',            label: 'New Pet',                desc: 'Pet food, bowls, treats, cleanup supplies',       Icon: Dog,              color: '#795548', items: '~10 items', est: '₹1,500' },
];

export default function PredictiveModePage() {
  const router = useRouter();
  const setMode = useAppStore(s => s.setMode);

  function handleSelect(situationId: string) {
    setMode('predictive');
    router.push(`/intent?mode=predictive&preset=${encodeURIComponent(situationId)}&count=1&time=Now&diet=No+restriction`);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-10">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#007600] to-[#005700] px-4 py-6">
        <button onClick={() => window.history.back()} className="text-white text-[14px] font-medium mb-2 flex items-center gap-1 hover:text-white/80 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Brain size={22} className="text-white" />
          <h1 className="text-white text-[24px] font-bold">Guide Me</h1>
        </div>
        <p className="text-white/80 text-[14px]">
          Life event? We know exactly what you need.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <p className="text-[13px] text-[#565959] mb-4">
          Select your situation - AI builds a complete kit with the best products:
        </p>

        <div className="space-y-3">
          {SITUATIONS.map(sit => (
            <button
              key={sit.id}
              onClick={() => handleSelect(sit.id)}
              className="w-full bg-white border border-[#D5D9D9] rounded-lg p-4
                         flex items-start gap-4 text-left
                         hover:border-[#007600] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: sit.color + '15' }}>
                <sit.Icon size={22} style={{ color: sit.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#0F1111] group-hover:text-[#007600]">
                  {sit.label}
                </p>
                <p className="text-[12px] text-[#565959] mt-0.5 leading-snug">{sit.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-[#565959] bg-[#F0F2F2] px-2 py-0.5 rounded">
                    {sit.items}
                  </span>
                  <span className="text-[11px] text-[#CC0C39] font-bold">
                    Est. {sit.est}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
