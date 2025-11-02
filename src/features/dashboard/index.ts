/**
 * Dashboard Feature Exports
 */

export { PlanGeneratingState } from "../quiz/components/PlanGeneratingState";
export { usePlanStatus } from "../quiz/hooks/usePlanStatus";
export { DashboardService } from "./api/dashboardService";
export { BetaBanner } from "./components/BetaBanner";
export { DashboardEmpty } from "./components/DashboardEmpty";
export { DashboardLoading } from "./components/DashboardLoading";
export { DashboardTabs } from "./components/DashboardTabs";
export { useDashboardData } from "./hooks/useDashboardData";
export { useDietPlan } from './hooks/useDietPlan';
export { useWorkoutPlan } from './hooks/useWorkoutPlan';



// Stats exports
export { StatsSection } from "./components/sections/stats/StatsSection";
export { useStatsData } from "./hooks/useStatsData";
export { StatsService } from "./services/statsService";

// Stats components (if needed individually)
export { HeroSummaryCards } from "./components/sections/stats/HeroSummaryCards";
export { HydrationTracking } from "./components/sections/stats/HydrationTracking";
export { NutritionAnalytics } from "./components/sections/stats/NutritionAnalytics";
export { PlanAdherence } from "./components/sections/stats/PlanAdherence";
export { InsightsPanel, ProgressComparison } from "./components/sections/stats/ProgressComparison";
export { WorkoutPerformance } from "./components/sections/stats/WorkoutPerformance";

// Types
export type * from "./types/stats.types";

