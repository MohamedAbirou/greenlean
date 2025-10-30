import React from "react";

/**
 * Skeleton loader for workout plan
 * Shows while plan is loading or being generated
 */
export const WorkoutPlanSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Progress Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-muted rounded-lg p-6 border border-border"
          >
            <div className="h-4 bg-card rounded w-24 mb-4" />
            <div className="h-8 bg-card rounded w-16 mb-2" />
            <div className="h-3 bg-card rounded w-20" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-card rounded-lg px-6 py-2 flex-shrink-0"
            style={{ width: "120px" }}
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-muted rounded-lg p-8 border border-border">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="h-6 bg-card rounded w-48 mb-3" />
            <div className="h-4 bg-card rounded w-full max-w-2xl" />
          </div>

          {/* Content blocks */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 bg-card rounded w-32" />
              <div className="space-y-2">
                <div className="h-4 bg-card rounded w-full" />
                <div className="h-4 bg-card rounded w-5/6" />
                <div className="h-4 bg-card rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            Generating your personalized workout plan
          </span>
        </div>
      </div>
    </div>
  );
};
