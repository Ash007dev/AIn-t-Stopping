// components/ImageUploadButton.tsx - Upload image for AI vision-based cart generation
"use client";
import { useState, useRef } from "react";

interface ImageUploadButtonProps {
  onIntentDetected: (intentText: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ImageUploadButton({
  onIntentDetected,
  disabled = false,
  className = "",
}: ImageUploadButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = "";

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);

      const res = await fetch("/api/vision-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Vision analysis failed");
      }

      const data = await res.json();
      if (data.intentText) {
        onIntentDetected(data.intentText);
      } else {
        setError("Couldn't understand the image");
      }
    } catch (err: unknown) {
      console.error("Vision error:", err);
      setError(err instanceof Error ? err.message : "Image processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title="Upload a photo - AI will figure out what you need"
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
          isProcessing
            ? "bg-purple-500 text-white cursor-wait animate-pulse"
            : "bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
        } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        {isProcessing ? (
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </button>

      {isProcessing && (
        <span className="absolute -bottom-6 text-[10px] font-semibold text-purple-500 whitespace-nowrap animate-pulse">
          Analyzing...
        </span>
      )}

      {error && !isProcessing && (
        <span className="absolute -bottom-7 text-[10px] font-medium text-red-500 whitespace-nowrap max-w-[160px] truncate">
          {error}
        </span>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
