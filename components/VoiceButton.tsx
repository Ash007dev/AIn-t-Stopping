// components/VoiceButton.tsx - Sarvam AI powered voice input
"use client";
import { useState, useRef, useCallback } from "react";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VoiceButton({
  onTranscript,
  disabled = false,
  size = "md",
  className = "",
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Try to use WAV-compatible format, fallback to webm
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        if (chunksRef.current.length === 0) {
          setError("No audio captured");
          setIsRecording(false);
          return;
        }

        setIsProcessing(true);
        try {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });

          // Convert to WAV for Sarvam API compatibility
          const wavBlob = await convertToWav(audioBlob);

          const formData = new FormData();
          formData.append("file", wavBlob, "recording.wav");

          const res = await fetch("/api/sarvam/stt", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `STT failed (${res.status})`);
          }

          const data = await res.json();
          // Sarvam returns transcript in different fields depending on mode
          const transcript =
            data.transcript || data.translation || data.text || "";

          if (transcript.trim()) {
            onTranscript(transcript.trim());
          } else {
            setError("Couldn't understand. Try again.");
          }
        } catch (err: unknown) {
          console.error("Sarvam STT error:", err);
          setError(err instanceof Error ? err.message : "Voice processing failed");
        } finally {
          setIsProcessing(false);
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: unknown) {
      console.error("Mic access error:", err);
      setError("Microphone access denied");
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleClick = () => {
    if (disabled || isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title={
          isRecording
            ? "Tap to stop recording"
            : isProcessing
            ? "Processing voice..."
            : "Tap to speak (supports Hindi, Tamil, Telugu & more)"
        }
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse"
            : isProcessing
            ? "bg-amber-500 text-white cursor-wait"
            : "bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-md hover:shadow-lg"
        } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        {isProcessing ? (
          <svg
            className="animate-spin"
            width={iconSizes[size]}
            height={iconSizes[size]}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        ) : (
          <svg
            width={iconSizes[size]}
            height={iconSizes[size]}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          </svg>
        )}
      </button>

      {/* Recording indicator */}
      {isRecording && (
        <span className="absolute -bottom-6 flex items-center gap-1 text-[10px] font-semibold text-red-500 whitespace-nowrap animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Listening...
        </span>
      )}
      {isProcessing && (
        <span className="absolute -bottom-6 text-[10px] font-semibold text-amber-600 whitespace-nowrap">
          Translating...
        </span>
      )}

      {/* Error tooltip */}
      {error && !isRecording && !isProcessing && (
        <span className="absolute -bottom-7 text-[10px] font-medium text-red-500 whitespace-nowrap max-w-[160px] truncate">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Convert any audio blob to WAV format using AudioContext.
 * Sarvam API works best with WAV 16-bit PCM mono.
 */
async function convertToWav(audioBlob: Blob): Promise<Blob> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch {
    // If decoding fails, send the original blob (Sarvam also accepts webm/mp3)
    audioContext.close();
    return audioBlob;
  }

  // Get mono channel data
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Create WAV file
  const wavBuffer = encodeWav(channelData, sampleRate);
  audioContext.close();
  return new Blob([wavBuffer], { type: "audio/wav" });
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
