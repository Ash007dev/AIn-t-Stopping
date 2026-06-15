// app/search/page.tsx — product search results
'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';

function matches(p: Product, terms: string[]): boolean {
  const hay = [
    p.name,
    p.brand,
    p.category,
    ...(p.keywords || []),
  ].join(' ').toLowerCase();
  return terms.every(t => hay.includes(t));
}

function SearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(true);

  useEffect(() => setInput(q), [q]);

  useEffect(() => {
    import('@/data/products.json').then(mod => {
      setAllProducts((mod.default as unknown) as Product[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return allProducts.filter(p => matches(p, terms)).slice(0, 60);
  }, [allProducts, q]);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-24">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 py-4">
        {/* Inline search refine bar */}
        <form onSubmit={runSearch} className="flex items-center bg-white border border-[#D5D9D9] rounded-xl overflow-hidden h-11 mb-4 shadow-sm focus-within:border-[#FF9900]">
          <span className="px-3 text-[#8C9296]"><SearchIcon size={18} /></span>
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 h-full text-[14px] text-[#0F1111] outline-none bg-white placeholder:text-[#8C9296]"
          />
          <button type="submit" className="bg-[#FF9900] hover:bg-[#E47911] text-white font-bold px-5 h-full text-[14px] transition-colors">
            Search
          </button>
        </form>

        {q && (
          <p className="text-[14px] text-[#565959] mb-3">
            {loading ? 'Searching…' : (
              <>Showing <span className="font-bold text-[#0F1111]">{results.length}</span> result{results.length === 1 ? '' : 's'} for{' '}
              <span className="font-bold text-[#0F1111]">&quot;{q}&quot;</span></>
            )}
          </p>
        )}

        {!loading && q && results.length === 0 && (
          <div className="bg-white border border-[#D5D9D9] rounded-2xl p-10 text-center shadow-sm">
            <div className="text-[40px] mb-2">🔍</div>
            <p className="text-[16px] font-bold text-[#0F1111] mb-1">No results found</p>
            <p className="text-[13px] text-[#565959] mb-5">We couldn&apos;t find anything for &quot;{q}&quot;. Try a different word.</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1 text-[13px] text-[#007185] font-medium hover:underline"
            >
              Back to home <ChevronRight size={14} />
            </button>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map(product => (
              <div key={product.id} className="bg-white border border-[#D5D9D9] rounded-xl overflow-hidden shadow-sm">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="bg-[#F0F2F2] min-h-screen"><Navbar /></main>}>
      <SearchResults />
    </Suspense>
  );
}
