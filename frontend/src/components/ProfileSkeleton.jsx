import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header Skeleton */}
        <div className="card-gradient relative overflow-hidden">
          <div className="relative z-10 p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Skeleton */}
              <div className="w-24 h-24 rounded-full bg-dark-hover animate-pulse"></div>
              {/* User Info Skeleton */}
              <div className="flex-1 w-full space-y-4">
                <div className="h-8 bg-dark-hover rounded-lg w-48 animate-pulse"></div>
                <div className="h-4 bg-dark-hover rounded w-64 animate-pulse"></div>
                <div className="flex flex-wrap gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-6 bg-dark-hover rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-dark-hover rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Skeleton */}
        <div className="card">
          <div className="h-6 bg-dark-hover rounded w-40 mb-6 animate-pulse"></div>
          <div className="h-32 bg-dark-hover rounded animate-pulse"></div>
          <div className="flex items-center justify-between mt-4">
            <div className="h-4 bg-dark-hover rounded w-12 animate-pulse"></div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-3 h-3 bg-dark-hover rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-4 bg-dark-hover rounded w-12 animate-pulse"></div>
          </div>
        </div>

        {/* Weekly Activity Skeleton */}
        <div className="card">
          <div className="h-6 bg-dark-hover rounded w-40 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-7 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-4 bg-dark-hover rounded w-8 animate-pulse"></div>
                <div className="w-16 h-16 rounded-full bg-dark-hover animate-pulse"></div>
                <div className="h-4 bg-dark-hover rounded w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Connections Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dark-hover rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-dark-hover rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-dark-hover rounded w-32 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 bg-dark-hover rounded w-12 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Skeleton */}
        <div className="card">
          <div className="h-6 bg-dark-hover rounded w-40 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-gradient text-center py-6">
                <div className="h-8 bg-dark-hover rounded w-12 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-dark-hover rounded w-20 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

