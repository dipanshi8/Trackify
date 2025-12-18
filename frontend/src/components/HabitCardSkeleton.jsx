import React from "react";

function HabitCardSkeleton() {
  return (
    <div className="card relative border-dark-border">
      {/* Top section - Name and Progress Ring */}
      <div className="flex items-start justify-between mb-4">
        {/* Left Section - Name and Category */}
        <div className="flex-1 min-w-0">
          {/* Habit Name Skeleton */}
          <div className="h-6 bg-dark-hover rounded-lg mb-2 w-3/4 animate-pulse"></div>
          {/* Category Badge Skeleton */}
          <div className="h-6 bg-dark-hover rounded-full w-20 animate-pulse"></div>
        </div>

        {/* Right Section - Circular Progress Skeleton */}
        <div className="flex-shrink-0 ml-4">
          <div className="relative w-16 h-16">
            {/* SVG Circle Skeleton */}
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#1f2937"
                strokeWidth="4"
                fill="none"
                className="animate-pulse"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#6366f1"
                strokeWidth="4"
                fill="none"
                strokeDasharray="175.9"
                strokeDashoffset="88"
                strokeLinecap="round"
                className="opacity-30 animate-pulse"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-8 bg-dark-bg rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Button Skeleton */}
      <div className="w-full h-12 bg-dark-hover rounded-lg animate-pulse"></div>
    </div>
  );
}

export default HabitCardSkeleton;

