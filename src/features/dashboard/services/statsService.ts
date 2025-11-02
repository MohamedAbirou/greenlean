/**
 * Stats Service
 * Handles all stats data operations and calculations
 */

import { supabase } from "@/lib/supabase/client";
import type {
  AIMealPlan,
  AIWorkoutPlan,
  NutritionLog,
  StatsData,
  WaterIntakeLog,
  WorkoutLog
} from "../types/stats.types";
import {
  calculateCalorieBalance,
  calculateDietAdherence,
  calculateHydrationInsights,
  calculateHydrationTrends,
  calculateMacroDistribution,
  calculateMealConsistency,
  calculateMonthComparisons,
  calculateMonthlyHighlight,
  calculateStreak,
  calculateWeeklyEffort,
  calculateWeeklySummary,
  calculateWorkoutAdherence,
  calculateWorkoutCalendar,
  calculateWorkoutStats,
  generateInsights
} from "../utils/statsCalculations";

export class StatsService {
  /**
   * Fetch complete stats data for user
   */
  static async getStatsData(userId: string): Promise<StatsData> {
    // Fetch all data in parallel
    const [nutritionLogs, waterLogs, workoutLogs, mealPlan, workoutPlan] = await Promise.all([
      this.getNutritionLogs(userId, 90),
      this.getWaterLogs(userId, 90),
      this.getWorkoutLogs(userId, 90),
      this.getActiveMealPlan(userId),
      this.getActiveWorkoutPlan(userId),
    ]);

    // Calculate all stats
    const currentStreak = calculateStreak(nutritionLogs, waterLogs, workoutLogs);
    const weeklySummary = calculateWeeklySummary(nutritionLogs, waterLogs, workoutLogs);
    const monthlyHighlight = calculateMonthlyHighlight(nutritionLogs, waterLogs, workoutLogs);

    const calorieBalance = calculateCalorieBalance(nutritionLogs, mealPlan);
    const macroDistribution = calculateMacroDistribution(nutritionLogs);
    const mealConsistency = calculateMealConsistency(nutritionLogs);

    const avgMacros =
      macroDistribution.length > 0
        ? {
            protein: Math.round(
              macroDistribution.reduce((sum, d) => sum + d.protein, 0) / macroDistribution.length
            ),
            carbs: Math.round(
              macroDistribution.reduce((sum, d) => sum + d.carbs, 0) / macroDistribution.length
            ),
            fats: Math.round(
              macroDistribution.reduce((sum, d) => sum + d.fats, 0) / macroDistribution.length
            ),
          }
        : { protein: 0, carbs: 0, fats: 0 };

    const hydrationTrends = calculateHydrationTrends(waterLogs);
    const hydrationInsights = calculateHydrationInsights(waterLogs);

    const workoutCalendar = calculateWorkoutCalendar(workoutLogs);
    const workoutStats = calculateWorkoutStats(workoutLogs);
    const weeklyEffort = calculateWeeklyEffort(workoutLogs);

    const dietAdherence = calculateDietAdherence(nutritionLogs, mealPlan);
    const workoutAdherence = calculateWorkoutAdherence(workoutLogs, workoutPlan);

    const monthComparisons = calculateMonthComparisons(nutritionLogs, waterLogs, workoutLogs);

    const insights = generateInsights(nutritionLogs, waterLogs, workoutLogs);

    return {
      currentStreak,
      weeklySummary,
      monthlyHighlight,
      calorieBalance,
      macroDistribution,
      mealConsistency,
      avgMacros,
      hydrationTrends,
      hydrationInsights,
      workoutCalendar,
      workoutStats,
      weeklyEffort,
      dietAdherence,
      workoutAdherence,
      monthComparisons,
      insights,
    };
  }

  /**
   * Get nutrition logs for user
   */
  static async getNutritionLogs(userId: string, days: number): Promise<NutritionLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("daily_nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate.toISOString().split("T")[0])
      .order("log_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get water intake logs for user
   */
  static async getWaterLogs(userId: string, days: number): Promise<WaterIntakeLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("daily_water_intake")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate.toISOString().split("T")[0])
      .order("log_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get workout logs for user
   */
  static async getWorkoutLogs(userId: string, days: number): Promise<WorkoutLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("workout_date", startDate.toISOString().split("T")[0])
      .order("workout_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active meal plan
   */
  static async getActiveMealPlan(userId: string): Promise<AIMealPlan | null> {
    const { data, error } = await supabase
      .from("ai_meal_plans")
      .select("id, user_id, daily_calories, is_active, generated_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Get active workout plan
   */
  static async getActiveWorkoutPlan(userId: string): Promise<AIWorkoutPlan | null> {
    const { data, error } = await supabase
      .from("ai_workout_plans")
      .select("id, user_id, frequency_per_week, is_active, generated_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
