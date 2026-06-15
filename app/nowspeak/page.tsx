// app/nowspeak/page.tsx - Full-screen voice + text chat (NowSpeak)
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Send, Zap, ShoppingCart, Loader2 } from 'lucide-react';
import VoiceButton from '@/components/VoiceButton';
import { useAppStore } from '@/store/useAppStore';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'I have a fever', q: 'I have a fever and need medicine fast' },
  { label: 'Need coffee', q: 'Need instant coffee urgently' },
  { label: 'Party tonight', q: 'Party snacks and drinks for tonight' },
  { label: 'Breakfast items', q: 'Need items for a quick breakfast' },
  { label: 'Baby essentials', q: 'Baby care essentials - diapers, wipes, formula' },
  { label: 'Cooking dinner', q: 'I want to cook butter chicken for 4 people' },
];

export default function NowSpeakPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cart = useAppStore(s => s.cart);
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;
      const userMsg: Message = { role: 'user', text: text.trim(), timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsProcessing(true);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Finding the best items for you...', timestamp: new Date() },
      ]);

      setTimeout(() => {
        router.push(`/intent?mode=intent&preset=${encodeURIComponent(text.trim())}&count=5&time=Tonight&diet=No+restriction`);
      }, 1500);
    },
    [isProcessing, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F2]">
      {/* Header */}
      <header className="bg-[#232F3E] px-3 py-2.5 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#FF9900] text-[15px]">amazon</span>
            <span className="bg-[#067D62] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              intent
            </span>
            <Zap className="w-3 h-3 text-[#FF9900] fill-[#FF9900]" />
            <span className="text-gray-400 text-[11px]">NowSpeak</span>
          </div>
          <p className="text-[#67B0D1] text-[10px] font-medium">Voice + AI · 30-min delivery</p>
        </div>

        {cartCount > 0 && (
          <button
            onClick={() => router.push('/cart')}
            className="bg-[#FF9900] text-white border-none rounded px-3 py-1.5 font-bold text-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {cartCount} · ₹{Math.round(cartTotal / 100)}
          </button>
        )}
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 pt-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center pt-16">
            <div className="w-[72px] h-[72px] rounded-full bg-[#FFF8F0] flex items-center justify-center mb-4 border-2 border-[#FF9900]">
              <Mic className="w-8 h-8 text-[#FF9900]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F1111] mb-1.5">
              What do you need?
            </h2>
            <p className="text-[#565959] text-[13px] max-w-[260px] leading-relaxed">
              Speak or type your need - we deliver in 30 minutes.
            </p>

            {/* Quick prompts */}
            <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-[340px]">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSendMessage(p.q)}
                  className="px-3.5 py-1.5 rounded-full bg-white text-[#0F1111] text-xs
                             border border-[#D5D9D9] font-medium hover:border-[#FF9900]
                             hover:text-[#FF9900] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[88%]">
                {msg.role === 'user' ? (
                  <div className="bg-[#232F3E] text-white px-3.5 py-2.5 rounded-[18px_18px_4px_18px] text-[13px] leading-relaxed">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-white border border-[#D5D9D9] px-3.5 py-2.5 rounded-[18px_18px_18px_4px] text-[13px] leading-relaxed text-[#0F1111] shadow-sm">
                    {msg.text}
                    {isProcessing && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-3.5 bg-[#FF9900] ml-1 rounded-sm align-middle animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} className="h-3" />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-[#D5D9D9] px-3 py-2.5 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={isProcessing ? 'Processing...' : 'Search or describe what you need...'}
            disabled={isProcessing}
            className="flex-1 border border-[#D5D9D9] rounded px-3 py-2.5 text-[13px]
                       outline-none bg-white text-[#0F1111] placeholder:text-[#8C9296]
                       focus:border-[#FF9900] transition-colors disabled:bg-[#F0F2F2]"
          />

          <VoiceButton onTranscript={(t) => handleSendMessage(t)} size="md" />

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              inputText.trim() && !isProcessing
                ? 'bg-[#FF9900] hover:bg-[#E47911] cursor-pointer'
                : 'bg-[#D5D9D9] cursor-default'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
