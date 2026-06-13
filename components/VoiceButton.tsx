// components/VoiceButton.tsx
"use client";
interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}
export default function VoiceButton({ disabled = true }: VoiceButtonProps) {
  return (
    <button
      disabled={disabled}
      aria-disabled="true"
      title="Voice input coming soon — Sarvam AI"
      className="p-2.5 rounded-full bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50 transition-all hover:bg-gray-800/70"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    </button>
  );
}
