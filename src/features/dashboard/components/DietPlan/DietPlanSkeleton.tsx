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
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-4" />
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-16 mb-2" />
            <div className="space-y-2 mt-4">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg px-6 py-2 flex-shrink-0"
            style={{ width: "120px" }}
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 border border-slate-200 dark:border-slate-700">
        <div className="space-y-6">
          {/* Meals grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-24" />
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1 flex-1" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Generating your personalized meal plan
          </span>
        </div>
      </div>
    </div>
  );
};
