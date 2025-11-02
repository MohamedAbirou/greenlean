/**
 * Stats Section
 * Main component that orchestrates all stats visualizations
 */

import { useStatsData } from "@/features/dashboard/hooks/useStatsData";
import { HeroSummaryCards } from "./HeroSummaryCards";
import { HydrationTracking } from "./HydrationTracking";
import { NutritionAnalytics } from "./NutritionAnalytics";
import { PlanAdherence } from "./PlanAdherence";
import { InsightsPanel, ProgressComparison } from "./ProgressComparison";
import { WorkoutPerformance } from "./WorkoutPerformance";

interface Props {
  userId: string;
}

export function StatsSection({ userId }: Props) {
  const { data: statsData, isLoading, error } = useStatsData(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Stats</h3>
        <p className="text-red-700">We couldn't load your stats. Please try refreshing the page.</p>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Stats Yet</h3>
        <p className="text-gray-600 mb-6">
          Start logging your meals, water intake, and workouts to see your stats here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Summary */}
      <HeroSummaryCards
        currentStreak={statsData.currentStreak}
        weeklySummary={statsData.weeklySummary}
        monthlyHighlight={statsData.monthlyHighlight}
      />

      {/* Nutrition Analytics */}
      {statsData.calorieBalance.length > 0 && (
        <NutritionAnalytics
          calorieBalance={statsData.calorieBalance}
          macroDistribution={statsData.macroDistribution}
          mealConsistency={statsData.mealConsistency}
          avgMacros={statsData.avgMacros}
        />
      )}

      {/* Hydration Tracking */}
      {statsData.hydrationTrends.length > 0 && (
        <HydrationTracking
          hydrationTrends={statsData.hydrationTrends}
          hydrationInsights={statsData.hydrationInsights}
        />
      )}

      {/* Workout Performance */}
      {statsData.workoutCalendar.length > 0 && (
        <WorkoutPerformance
          workoutCalendar={statsData.workoutCalendar}
          workoutStats={statsData.workoutStats}
          weeklyEffort={statsData.weeklyEffort}
        />
      )}

      {/* Plan Adherence */}
      {(statsData.dietAdherence.overall > 0 || statsData.workoutAdherence.overall > 0) && (
        <PlanAdherence
          dietAdherence={statsData.dietAdherence}
          workoutAdherence={statsData.workoutAdherence}
        />
      )}

      {/* Progress Comparison */}
      <ProgressComparison monthComparisons={statsData.monthComparisons} />

      {/* Insights */}
      {statsData.insights.length > 0 && <InsightsPanel insights={statsData.insights} />}
    </div>
  );
}
