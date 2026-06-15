// components/SkeletonCard.tsx - Loading skeleton matching ProductCard dimensions
export default function SkeletonCard() {
  return (
    <div className="bg-white flex flex-col">
      {/* Image area */}
      <div className="h-44 bg-[#F0F2F2] relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
      {/* Info area */}
      <div className="p-3 border-t border-[#D5D9D9] space-y-2">
        <div className="h-3 bg-[#F0F2F2] rounded relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="h-3 bg-[#F0F2F2] rounded w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="h-4 bg-[#F0F2F2] rounded w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="flex justify-center pt-2">
          <div className="w-9 h-9 bg-[#F0F2F2] rounded-full relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
