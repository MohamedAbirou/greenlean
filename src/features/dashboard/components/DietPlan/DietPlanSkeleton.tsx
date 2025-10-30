import React from "react";

/**
 * Skeleton loader for diet plan
 * Shows while plan is loading or being generated
 */
export const DietPlanSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Progress Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-6 border border-border">
            <div className="h-4 bg-card rounded w-20 mb-4" />
            <div className="h-8 bg-muted/70 rounded w-16 mb-2" />
            <div className="space-y-2 mt-4">
              <div className="h-2 bg-card rounded w-full" />
              <div className="h-3 bg-card rounded w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
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
          {/* Meals grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-muted rounded-lg p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 bg-muted/70 rounded w-24" />
                  <div className="h-8 w-8 bg-card rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-card rounded w-full" />
                  <div className="h-4 bg-card rounded w-5/6" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-card rounded-full px-3 py-1 flex-1" />
                  <div className="h-6 bg-card rounded-full px-3 py-1 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 badge-green rounded-lg border">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-sm font-medium text-primary">
            Generating your personalized meal plan
          </span>
        </div>
      </div>
    </div>
  );
};
