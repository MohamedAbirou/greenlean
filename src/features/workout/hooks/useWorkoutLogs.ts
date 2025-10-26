/**
 * Workout Logs Hook
 * Manages workout logging with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkoutService } from "../api/workoutService";
import type { WorkoutLog } from "../types";

export function useWorkoutLogs(userId: string, weeklyTarget = 5) {
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ["workout-logs", userId],
    queryFn: () => WorkoutService.getWeeklyLogs(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });

  const stats = WorkoutService.calculateStats(
    logsQuery.data || [],
    weeklyTarget
  );

  const logWorkoutMutation = useMutation({
    mutationFn: (log: WorkoutLog) => WorkoutService.logWorkout(userId, log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs", userId] });
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: (logId: string) => WorkoutService.deleteWorkoutLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs", userId] });
    },
  });

  return {
    logs: logsQuery.data || [],
    stats,
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    error: logsQuery.error,
    logWorkout: logWorkoutMutation.mutate,
    deleteWorkout: deleteWorkoutMutation.mutate,
    refetch: logsQuery.refetch,
  };
}
