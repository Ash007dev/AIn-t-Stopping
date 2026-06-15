// components/CategoryNav.tsx - Amazon Now illustrated category icons
'use client';
import { useState } from 'react';
import type { ProductShelf } from '@/lib/product-shelves';

import { Star, Carrot, Egg, Apple, CupSoda, Droplet, Wheat, Coffee, Candy, Baby } from 'lucide-react';

const CATEGORIES = [
  { id: 'top', label: 'Top Picks', color: '#FFB900', Icon: Star },
  { id: 'vegetables', label: 'Vegetables', color: '#4CAF50', Icon: Carrot },
  { id: 'dairy', label: 'Dairy & Eggs', color: '#2196F3', Icon: Egg },
  { id: 'fruits', label: 'Fruits', color: '#FF5722', Icon: Apple },
  { id: 'drinks', label: 'Drinks', color: '#9C27B0', Icon: CupSoda },
  { id: 'oils', label: 'Oils & Ghee', color: '#FF9800', Icon: Droplet },
  { id: 'rice-dal', label: 'Rice & Dal', color: '#795548', Icon: Wheat },
  { id: 'breakfast', label: 'Breakfast', color: '#00BCD4', Icon: Coffee },
  { id: 'chocolates', label: 'Chocolates', color: '#E91E63', Icon: Candy },
  { id: 'baby', label: 'Baby', color: '#3F51B5', Icon: Baby },
] as const;

export default function CategoryNav({ onSelect }: { onSelect?: (id: ProductShelf) => void }) {
  const [active, setActive] = useState<ProductShelf>('top');

  return (
    <div className="overflow-x-auto hide-scrollbar border-b border-[#D5D9D9] bg-white">
      <div className="flex items-start px-2 sm:px-4 py-2 gap-1 min-w-max max-w-screen-xl mx-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActive(cat.id); onSelect?.(cat.id); }}
            className="flex flex-col items-center px-3 py-2 min-w-[72px] rounded
                       hover:bg-[#F0F2F2] transition-colors"
          >
            {/* Icon - colored initial block (replace with real PNGs from /public/icons/ before demo) */}
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-1"
                 style={{ backgroundColor: cat.color + '20' }}>
               <cat.Icon color={cat.color} size={24} />
            </div>

            {/* Label */}
            <span className={`text-[11px] text-center leading-tight whitespace-nowrap
              ${active === cat.id
                ? 'text-[#007185] font-semibold border-b-2 border-[#FF9900] pb-0.5'
                : 'text-[#0F1111] font-normal'
              }`}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
