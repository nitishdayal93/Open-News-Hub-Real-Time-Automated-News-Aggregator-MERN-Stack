import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="w-full rounded-[24px] glass-card overflow-hidden p-5 space-y-4">
      {/* Image Skeleton */}
      <div className="w-full h-52 rounded-2xl skeleton-pulse" />

      {/* Source & Date Skeleton */}
      <div className="flex justify-between items-center">
        <div className="w-24 h-5 rounded-full skeleton-pulse" />
        <div className="w-20 h-4 rounded-full skeleton-pulse" />
      </div>

      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="w-full h-5 rounded-lg skeleton-pulse" />
        <div className="w-3/4 h-5 rounded-lg skeleton-pulse" />
      </div>

      {/* Description Skeleton */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-md skeleton-pulse" />
        <div className="w-full h-3 rounded-md skeleton-pulse" />
        <div className="w-4/5 h-3 rounded-md skeleton-pulse" />
      </div>

      {/* Footer / Buttons Skeleton */}
      <div className="flex justify-between items-center pt-3 border-t border-[#EAE6DF] dark:border-[#25334D]">
        <div className="w-24 h-6 rounded-full skeleton-pulse" />
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full skeleton-pulse" />
          <div className="w-8 h-8 rounded-full skeleton-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
