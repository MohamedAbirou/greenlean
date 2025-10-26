/**
 * Workout API Service
 * Handles workout logging and tracking operations
 */

import { supabase } from "@/lib/supabase";
import type { WorkoutLogData, WorkoutLog, WorkoutStats } from "../types";

export class WorkoutService {
  /**
   * Get week start date (Monday)
   */
  static getWeekStartDate(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    return monday.toISOString().split("T")[0];
  }

  /**
   * Calculate current workout streak
   */
  static calculateStreak(logs: WorkoutLogData[]): number {
    if (logs.length === 0) return 0;

    const sortedDates = Array.from(
      new Set(logs.filter(log => log.completed).map(log => log.workout_date))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (sortedDates[0] !== today && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i - 1]);
      const previousDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /**
   * Load workout logs for the current week
   */
  static async getWeeklyLogs(userId: string): Promise<WorkoutLogData[]> {
    try {
      const weekStart = this.getWeekStartDate();
      const { data, error } = await supabase
        .from("workout_logs")
        .select("workout_date, duration_minutes, calories_burned, completed")
        .eq("user_id", userId)
        .gte("workout_date", weekStart)
        .order("workout_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading weekly logs:", error);
      return [];
    }
  }

  /**
   * Calculate workout statistics
   */
  static calculateStats(
    logs: WorkoutLogData[],
    weeklyTarget: number
  ): WorkoutStats {
    const uniqueCompletedDays = new Set(
      logs.filter(log => log.completed).map(log => log.workout_date)
    ).size;

    const weeklyCaloriesBurned = logs
      .filter(log => log.completed)
      .reduce((sum, log) => sum + (log.calories_burned || 0), 0);

    const weeklyTotalTime = logs
      .filter(log => log.completed)
      .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

    const currentStreak = this.calculateStreak(logs);
    const weeklyProgress = (uniqueCompletedDays / weeklyTarget) * 100;

    return {
      weeklyWorkoutCount: uniqueCompletedDays,
      weeklyCaloriesBurned,
      weeklyTarget,
      weeklyProgress,
      weeklyTotalTime,
      currentStreak,
    };
  }

  /**
   * Log a workout
   */
  static async logWorkout(
    userId: string,
    log: WorkoutLog
  ): Promise<void> {
    try {
      const { error } = await supabase.from("workout_logs").insert({
        user_id: userId,
        workout_type: log.workout_type,
        exercises: log.exercises,
        duration_minutes: log.duration_minutes,
        calories_burned: log.calories_burned,
        completed: log.completed ?? false,
        notes: log.notes,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving workout log:", error);
      throw error;
    }
  }

  /**
   * Delete a workout log
   */
  static async deleteWorkoutLog(logId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting workout log:", error);
      throw error;
    }
  }

  /**
   * Get workout logs for a date range
   */
  static async getLogsForDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WorkoutLogData[]> {
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("workout_date, duration_minutes, calories_burned, completed")
        .eq("user_id", userId)
        .gte("workout_date", startDate)
        .lte("workout_date", endDate)
        .order("workout_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading date range logs:", error);
      return [];
    }
  }
}
