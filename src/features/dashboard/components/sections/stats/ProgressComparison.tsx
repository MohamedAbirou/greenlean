/**
 * Progress Comparison & Insights Components
 */

import type { Insight, MonthComparison } from "@/features/dashboard/types/stats.types";
import { AlertCircle, CheckCircle, Info, TrendingDown, TrendingUp } from "lucide-react";

interface ProgressComparisonProps {
  monthComparisons: {
    nutrition: MonthComparison[];
    hydration: MonthComparison[];
    fitness: MonthComparison[];
  };
}

export function ProgressComparison({ monthComparisons }: ProgressComparisonProps) {
  const renderComparison = (comparison: MonthComparison) => {
    const isPositive = comparison.change > 0;

    return (
      <div
        key={comparison.metric}
        className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
      >
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{comparison.metric}</h4>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {comparison.thisMonth.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {comparison.unit}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {comparison.lastMonth.toLocaleString()} last month
            </p>
          </div>
          {comparison.change !== 0 && (
            <div
              className={`flex items-center gap-1 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {Math.abs(comparison.change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Month-over-Month Progress</h2>

      <div className="space-y-6">
        {/* Nutrition */}
        <div>
          <h3 className="text-lg font-semibold text-foreground/80 mb-3">Nutrition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthComparisons.nutrition.map(renderComparison)}
          </div>
        </div>

        {/* Hydration */}
        <div>
          <h3 className="text-lg font-semibold text-foreground/80 mb-3">Hydration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthComparisons.hydration.map(renderComparison)}
          </div>
        </div>

        {/* Fitness */}
        <div>
          <h3 className="text-lg font-semibold text-foreground/80 mb-3">Fitness</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthComparisons.fitness.map(renderComparison)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'badge-green';
      case 'warning':
        return 'badge-yellow';
      case 'info':
        return 'badge-blue';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Smart Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-xl border-2 p-5 ${getInsightStyles(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}