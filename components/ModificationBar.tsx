// components/ModificationBar.tsx — Cart modification bar with voice + text
'use client';
import { useState } from 'react';
import VoiceButton from './VoiceButton';

const HINTS = [
  'Make it vegetarian',
  'Add 2 more people',
  'Remove soft drinks',
  'Add more snacks',
  'Switch to healthier options',
];

interface ModificationBarProps {
  onModify: (text: string) => Promise<void>;
  error?: string | null;
}

export default function ModificationBar({ onModify, error }: ModificationBarProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(overrideText?: string) {
    const input = overrideText || text;
    if (!input.trim() || loading) return;
    setLoading(true);
    await onModify(input.trim());
    setText('');
    setLoading(false);
  }

  return (
    <div className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 z-40
                    bg-white border-t border-[#D5D9D9] shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">

      {/* Error message */}
      {error && (
        <div className="px-4 pt-2">
          <p className="text-[12px] text-[#CC0C39] bg-[#FFF0F0] border border-[#F5C6CB]
                        rounded px-3 py-2">
            {error}
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="px-4 pt-2">
          <p className="text-[12px] text-[#007185] italic">
            Analyzing request... updating cart...
          </p>
        </div>
      )}

      {/* Hint chips */}
      <div className="px-4 pt-2 pb-1 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max">
          <span className="text-[12px] text-[#565959] font-medium flex-shrink-0 self-center">
            Suggestions:
          </span>
          {HINTS.map(hint => (
            <button
              key={hint}
              onClick={() => handleSubmit(hint)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1 rounded-full border border-[#D5D9D9]
                         text-[12px] text-[#007185] bg-white hover:border-[#FF9900]
                         hover:text-[#0F1111] transition-colors whitespace-nowrap
                         disabled:opacity-50"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-1">
        {/* Voice button — uses existing Sarvam STT */}
        <VoiceButton
          onTranscript={(t) => handleSubmit(t)}
          disabled={loading}
          size="sm"
        />

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Change anything? Just tell me..."
          disabled={loading}
          className="flex-1 border border-[#D5D9D9] rounded h-10 px-3 text-[14px]
                     text-[#0F1111] outline-none
                     focus:border-[#FF9900] focus:ring-2 focus:ring-[rgba(255,153,0,0.15)]
                     placeholder:text-[#8C9296] disabled:bg-[#F0F2F2]
                     transition-all"
        />

        {/* Submit */}
        <button
          onClick={() => handleSubmit()}
          disabled={!text.trim() || loading}
          className="flex-shrink-0 w-10 h-10 bg-[#FF9900] hover:bg-[#E47911]
                     disabled:bg-[#D5D9D9] rounded flex items-center justify-center
                     transition-colors"
          aria-label="Send modification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
