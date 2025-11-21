// src/features/dashboard/hooks/useWorkoutPlan.ts

import { quizApi } from "@/features/quiz/api/quizApi";
import type { DashboardWorkoutPlan } from "@/shared/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../api/dashboardService";
import { useWorkoutPlanRealtime, usePlanStatusRealtime } from "@/shared/hooks/useSupabaseRealtime";

interface PlanStatus {
  meal_plan_status: string;
  workout_plan_status: string;
  meal_plan_error?: string;
  workout_plan_error?: string;
}

interface WorkoutPlanData {
  plan: DashboardWorkoutPlan | null;
  status: PlanStatus;
}

interface UseWorkoutPlanReturn {
  data: DashboardWorkoutPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  isError: boolean;
  errorMessage?: string;
  hasNoPlan: boolean;
}

/**
 * Custom hook to fetch workout plan data with real-time updates
 * Combines workout plan data with generation status
 * Now uses Supabase Realtime instead of polling for instant updates
 */
export function useWorkoutPlan(userId: string | undefined): UseWorkoutPlanReturn {
  // Subscribe to real-time updates for workout plans and plan generation status
  useWorkoutPlanRealtime(userId, !!userId);
  usePlanStatusRealtime(userId, !!userId);

  // Fetch workout plan and status together
  const {
    data: combinedData,
    isLoading,
    isError,
    error,
  } = useQuery<WorkoutPlanData>({
    queryKey: ["workoutPlan", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      // Fetch both plan data and status in parallel
      const [plan, status] = await Promise.all([
        DashboardService.getWorkoutPlanData(userId),
        quizApi.getPlanStatus(userId),
      ]);

      return { plan, status };
    },
    enabled: !!userId,
    // Real-time subscriptions will trigger refetches automatically
    refetchInterval: false, // Disabled: using real-time instead
    refetchIntervalInBackground: false,
    staleTime: 0, // Always fresh with real-time
    refetchOnWindowFocus: false, // Rely on realtime
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
  const isGenerating = status?.workout_plan_status === "generating";
  const hasFailed = status?.workout_plan_status === "failed";
  const errorMessage = hasFailed ? status?.workout_plan_error : undefined;

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