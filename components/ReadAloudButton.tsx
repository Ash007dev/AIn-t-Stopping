// components/ReadAloudButton.tsx - Sarvam AI TTS "Read Aloud" button
"use client";
import { useState, useRef } from "react";

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

export default function ReadAloudButton({ text, className = "" }: ReadAloudButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = async () => {
    // If already playing, stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/sarvam/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 500) }), // Sarvam has input limits
      });

      if (!res.ok) {
        throw new Error("TTS request failed");
      }

      const data = await res.json();
      // Sarvam TTS returns base64 audio in data.audios[0]
      const audioBase64 = data.audios?.[0];
      if (!audioBase64) {
        throw new Error("No audio returned");
      }

      // Create audio element and play
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !text.trim()}
      title={isPlaying ? "Stop reading" : "Read aloud (Sarvam AI)"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
        isPlaying
          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700"
          : "bg-gray-100 dark:bg-[#2B3645] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#3A4553] hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-700"
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
        </svg>
      ) : isPlaying ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
      {isPlaying ? "Stop" : "Read Aloud"}
    </button>
  );
}
