/**
 * Nutrition Logs Hook
 * Manages nutrition logging with React Query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NutritionService } from "../api/nutritionService";
import type { MacroTargets, NutritionLog, NutritionStats } from "../types";

export function useNutritionLogs(userId: string, macroTargets?: MacroTargets) {
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ["nutrition-logs", userId],
    queryFn: () => NutritionService.getTodayLogs(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });

  // Calculate stats if macro targets are provided
  const stats: NutritionStats | undefined = macroTargets
    ? NutritionService.calculateNutritionStats(logsQuery.data || [], macroTargets)
    : undefined;

  const logMealMutation = useMutation({
    mutationFn: (log: Omit<NutritionLog, "id" | "created_at">) =>
      NutritionService.logMeal(log),
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({ queryKey: ["nutrition-logs", userId] });

      const previousLogs = queryClient.getQueryData([
        "nutrition-logs",
        userId,
      ]);

      // Optimistically update
      queryClient.setQueryData(
        ["nutrition-logs", userId],
        (old: any[] = []) => [
          {
            total_calories: newLog.total_calories,
            total_protein: newLog.total_protein,
            total_carbs: newLog.total_carbs,
            total_fats: newLog.total_fats,
          },
          ...old,
        ]
      );

      return { previousLogs };
    },
    onError: (error, variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["nutrition-logs", userId],
          context.previousLogs
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-logs", userId] });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: (logId: string) => NutritionService.deleteMealLog(logId),
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ["nutrition-logs", userId] });

      const previousLogs = queryClient.getQueryData([
        "nutrition-logs",
        userId,
      ]);

      queryClient.setQueryData(
        ["nutrition-logs", userId],
        (old: any[] = []) => old.filter((log, index) => index !== 0)
      );

      return { previousLogs };
    },
    onError: (error, variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["nutrition-logs", userId],
          context.previousLogs
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-logs", userId] });
    },
  });

  return {
    logs: logsQuery.data || [],
    stats,
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    error: logsQuery.error,
    logMeal: logMealMutation.mutate,
    deleteMeal: deleteMealMutation.mutate,
    isLoggingMeal: logMealMutation.isPending,
    isDeletingMeal: deleteMealMutation.isPending,
    refetch: logsQuery.refetch,
  };
}
