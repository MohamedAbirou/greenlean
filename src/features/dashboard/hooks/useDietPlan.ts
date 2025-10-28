// src/features/dashboard/hooks/useDietPlan.ts

import { quizApi } from "@/features/quiz/api/quizApi";
import type { DashboardDietPlan } from "@/shared/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../api/dashboardService";

interface PlanStatus {
  meal_plan_status: string;
  workout_plan_status: string;
  meal_plan_error?: string;
  workout_plan_error?: string;
}

interface DietPlanData {
  plan: DashboardDietPlan | null;
  status: PlanStatus;
}

interface UseDietPlanReturn {
  data: DashboardDietPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  isError: boolean;
  errorMessage?: string;
  hasNoPlan: boolean;
}

/**
 * Custom hook to fetch and poll diet plan data
 * Combines diet plan data with generation status
 */
export function useDietPlan(userId: string | undefined): UseDietPlanReturn {
  // Fetch diet plan and status together
  const {
    data: combinedData,
    isLoading,
    isError,
    error,
  } = useQuery<DietPlanData>({
    queryKey: ["dietPlan", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      // Fetch both plan data and status in parallel
      const [plan, status] = await Promise.all([
        DashboardService.getDietPlanData(userId),
        quizApi.getPlanStatus(userId),
      ]);

      return { plan, status };
    },
    enabled: !!userId,
    refetchInterval: (query) => {
      // Poll every 5 seconds if plan is generating
      const data = query.state.data;
      if (!data) return false;

      const isGenerating = data.status.meal_plan_status === "generating";
      return isGenerating ? 5000 : false;
    },
    refetchIntervalInBackground: false,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 300000, // Keep unused data in cache for 5 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 404s
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const plan = combinedData?.plan ?? null;
  const status = combinedData?.status;

  // Determine states
  const isGenerating = status?.meal_plan_status === "generating";
  const hasFailed = status?.meal_plan_status === "failed";
  const errorMessage = hasFailed ? status?.meal_plan_error : undefined;

  // Only show "no plan" state if:
  // 1. Not loading AND
  // 2. Not generating AND
  // 3. No error AND
  // 4. No plan data exists
  const hasNoPlan = !isLoading && !isGenerating && !hasFailed && !plan;

  return {
    data: plan,
    isLoading: isLoading && !combinedData, // Loading only on initial fetch
    isGenerating,
    isError: isError || hasFailed,
    errorMessage: errorMessage || (error as Error)?.message,
    hasNoPlan,
  };
}