/**
 * Workout Logs Hook
 * Manages workout logging with React Query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkoutService } from "../api/workoutService";
import type { WorkoutLog, WorkoutLogData } from "../types";

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
    onMutate: async (newLog) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workout-logs", userId] });

      // Snapshot previous value
      const previousLogs = queryClient.getQueryData<WorkoutLogData[]>([
        "workout-logs",
        userId,
      ]);

      // Optimistically update to new value
      const optimisticLog: WorkoutLogData = {
        workout_date: newLog.workout_date || new Date().toISOString().split("T")[0],
        duration_minutes: newLog.duration_minutes || 0,
        calories_burned: newLog.calories_burned || 0,
        completed: newLog.completed ?? true,
      };

      queryClient.setQueryData<WorkoutLogData[]>(
        ["workout-logs", userId],
        (old = []) => [optimisticLog, ...old]
      );

      return { previousLogs };
    },
    onError: (error, variables, context) => {
      console.error(error, variables);
      // Rollback on error
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["workout-logs", userId],
          context.previousLogs
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs", userId] });
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: (logId: string) => WorkoutService.deleteWorkoutLog(logId),
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ["workout-logs", userId] });

      const previousLogs = queryClient.getQueryData<WorkoutLogData[]>([
        "workout-logs",
        userId,
      ]);

      queryClient.setQueryData<WorkoutLogData[]>(
        ["workout-logs", userId],
        (old = []) => old.filter((log) => (log as any).id !== logId)
      );

      return { previousLogs };
    },
    onError: (error, variables, context) => {
      console.error(error, variables);
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["workout-logs", userId],
          context.previousLogs
        );
      }
    },
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
    isLoggingWorkout: logWorkoutMutation.isPending,
    isDeletingWorkout: deleteWorkoutMutation.isPending,
    refetch: logsQuery.refetch,
  };
}
