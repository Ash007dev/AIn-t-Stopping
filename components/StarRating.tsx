// components/StarRating.tsx
"use client";
interface StarRatingProps {
  rating: number;
}
export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg key={`full-${i}`} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      {hasHalf && (
        <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="1">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#374151" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="url(#halfStar)" stroke="#FBBF24" />
        </svg>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg key={`empty-${i}`} width="14" height="14" viewBox="0 0 24 24" fill="#374151" stroke="#4B5563" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}
