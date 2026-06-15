// components/loading/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border-default bg-[#111111] p-5 flex gap-4 card-shadow">
      {/* Product Image Skeleton */}
      <div className="w-28 h-28 flex-shrink-0 bg-bg-elevated animate-shimmer rounded-xl border border-border-bright" />

      {/* Product Info Skeleton */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Title bar */}
          <div className="h-4 w-11/12 rounded bg-bg-elevated animate-shimmer" />
          {/* Brand/Subtitle bar */}
          <div className="h-3 w-1/4 rounded bg-bg-elevated animate-shimmer" />

          {/* Ratings bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-3 w-16 rounded bg-bg-elevated animate-shimmer" />
            <div className="h-3 w-20 rounded bg-bg-elevated animate-shimmer" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {/* Price bar */}
          <div className="h-6 w-24 rounded bg-bg-elevated animate-shimmer" />
          {/* Qty/ETA bar */}
          <div className="h-3.5 w-1/2 rounded bg-bg-elevated animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
