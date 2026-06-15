// components/StarRating.tsx — Amazon exact star rating
export default function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(Math.max(rating - i, 0), 1);
    return fill >= 0.75 ? 'full' : fill >= 0.25 ? 'half' : 'empty';
  });

  return (
    <span className="inline-flex items-center" style={{ gap: 1 }}
          aria-label={`${rating} out of 5 stars`}>
      {stars.map((type, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
             style={{ display: 'block', flexShrink: 0 }}>
          <defs>
            <linearGradient id={`half-${i}-${size}`}>
              <stop offset="50%" stopColor="#F5A623"/>
              <stop offset="50%" stopColor="#E8E8E8"/>
            </linearGradient>
          </defs>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={
              type === 'full'  ? '#F5A623'                  :
              type === 'half'  ? `url(#half-${i}-${size})` :
                                 '#E8E8E8'
            }
            stroke="none"
          />
        </svg>
      ))}
    </span>
  );
}
