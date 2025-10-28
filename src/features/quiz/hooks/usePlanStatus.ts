// src/features/dashboard/hooks/usePlanStatus.ts (NEW)

import { useEffect, useState } from "react";
import { quizApi } from "../api/quizApi";

interface PlanStatus {
  meal_plan_status: string;
  workout_plan_status: string;
  meal_plan_error?: string;
  workout_plan_error?: string;
}

export const usePlanStatus = (userId: string | undefined, enabled: boolean = true) => {
  const [status, setStatus] = useState<PlanStatus>({
    meal_plan_status: "unknown",
    workout_plan_status: "unknown",
    meal_plan_error: "none",
    workout_plan_error: "none"
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || !enabled) return;

    let intervalId: ReturnType<typeof setInterval>;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const planStatus = await quizApi.getPlanStatus(userId);

        if (isMounted) {
          setStatus(planStatus);

          // Stop polling if both plans are completed or failed
          const bothComplete =
            (planStatus.meal_plan_status === "completed" ||
              planStatus.meal_plan_status === "failed") &&
            (planStatus.workout_plan_status === "completed" ||
              planStatus.workout_plan_status === "failed");

          if (bothComplete && intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error checking plan status:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial check
    checkStatus();

    // Poll every 5 seconds
    intervalId = setInterval(checkStatus, 5000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userId, enabled]);

  return {
    status,
    isLoading,
    isMealPlanGenerating: status.meal_plan_status === "generating",
    isWorkoutPlanGenerating: status.workout_plan_status === "generating",
    isMealPlanReady: status.meal_plan_status === "completed",
    isWorkoutPlanReady: status.workout_plan_status === "completed",
    hasMealPlanError: status.meal_plan_status === "failed",
    hasWorkoutPlanError: status.workout_plan_status === "failed",
  };
};
