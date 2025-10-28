/**
 * Dashboard Feature Exports
 */





// src/features/dashboard/index.ts (UPDATED EXPORTS)

export { PlanGeneratingState } from "../new_quiz/components/PlanGeneratingState";
export { usePlanStatus } from "../new_quiz/hooks/usePlanStatus";
export { DashboardService } from "./api/dashboardService";
export { BetaBanner } from "./components/BetaBanner";
export { DashboardEmpty } from "./components/DashboardEmpty";
export { DashboardLoading } from "./components/DashboardLoading";
export { DashboardTabs } from "./components/DashboardTabs";
export { useDashboardData } from "./hooks/useDashboardData";
export { useDietPlan } from './hooks/useDietPlan';
export { useWorkoutPlan } from './hooks/useWorkoutPlan';

export type { DashboardTab } from "./types";
// ============================================
// src/features/dashboard/hooks/index.ts
// ============================================
