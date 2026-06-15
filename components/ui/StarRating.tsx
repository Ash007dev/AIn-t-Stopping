// components/ui/StarRating.tsx
// Replaces the existing components/StarRating.tsx with the new UI-primitive version.
// Renders filled / half / empty SVG stars in #FBBF24 with numeric rating alongside.
"use client";

interface StarRatingProps {
  rating: number;
  /** Show the numeric value next to the stars */
  showValue?: boolean;
  /** Size of each star in px */
  size?: number;
  className?: string;
}

export default function StarRating({
  rating,
  showValue = true,
  size = 13,
  className = "",
}: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, rating));
  const fullStars = Math.floor(clamped);
  const hasHalf = clamped % 1 >= 0.25 && clamped % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const StarFull = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const StarHalf = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1" aria-hidden>
      <defs>
        <linearGradient id="halfStar-grad">
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="url(#halfStar-grad)"
        stroke="#FBBF24"
      />
    </svg>
  );

  const StarEmpty = () => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={`Rating: ${clamped.toFixed(1)} out of 5 stars`}
      role="img"
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarFull key={`full-${i}`} />
        ))}
        {hasHalf && <StarHalf />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarEmpty key={`empty-${i}`} />
        ))}
      </div>
      {showValue && (
        <span className="text-[#FBBF24] text-xs font-semibold leading-none tabular-nums">
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}
