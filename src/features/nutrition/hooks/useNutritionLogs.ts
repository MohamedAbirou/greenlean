/**
 * Nutrition Logs Hook
 * Manages nutrition logging with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NutritionService } from "../api/nutritionService";
import type { NutritionLog } from "../types";

export function useNutritionLogs(userId: string) {
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ["nutrition-logs", userId],
    queryFn: () => NutritionService.getTodayLogs(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });

  const logMealMutation = useMutation({
    mutationFn: (log: Omit<NutritionLog, "id" | "created_at">) =>
      NutritionService.logMeal(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-logs", userId] });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: (logId: string) => NutritionService.deleteMealLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-logs", userId] });
    },
  });

  return {
    logs: logsQuery.data || [],
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    error: logsQuery.error,
    logMeal: logMealMutation.mutate,
    deleteMeal: deleteMealMutation.mutate,
    refetch: logsQuery.refetch,
  };
}
