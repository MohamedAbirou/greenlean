/**
 * Nutrition API Service
 * Handles nutrition logging and tracking operations
 */

import { supabase } from "@/lib/supabase";
import type { NutritionLog, TodayLog, NutritionStats, MacroTargets } from "../types";

export class NutritionService {
  /**
   * Load nutrition logs for today
   */
  static async getTodayLogs(userId: string): Promise<TodayLog[]> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_nutrition_logs")
        .select("total_calories, total_protein, total_carbs, total_fats")
        .eq("user_id", userId)
        .eq("log_date", today)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading today's logs:", error);
      return [];
    }
  }

  /**
   * Calculate nutrition statistics from today's logs
   */
  static calculateNutritionStats(
    logs: TodayLog[],
    targets: MacroTargets
  ): NutritionStats {
    const totalLoggedToday = logs.reduce(
      (sum, log) => sum + (log.total_calories || 0),
      0
    );
    const totalProteinLogged = logs.reduce(
      (sum, log) => sum + (log.total_protein || 0),
      0
    );
    const totalCarbsLogged = logs.reduce(
      (sum, log) => sum + (log.total_carbs || 0),
      0
    );
    const totalFatsLogged = logs.reduce(
      (sum, log) => sum + (log.total_fats || 0),
      0
    );

    const remainingCalories = targets.dailyCalories - totalLoggedToday;
    const remainingProtein = targets.protein_g - totalProteinLogged;
    const remainingCarbs = targets.carbs_g - totalCarbsLogged;
    const remainingFats = targets.fat_g - totalFatsLogged;

    const caloriePercentage = (totalLoggedToday / targets.dailyCalories) * 100;
    const proteinPercentage = (totalProteinLogged / targets.protein_g) * 100;
    const carbsPercentage = (totalCarbsLogged / targets.carbs_g) * 100;
    const fatsPercentage = (totalFatsLogged / targets.fat_g) * 100;

    return {
      totalLoggedToday,
      totalProteinLogged,
      totalCarbsLogged,
      totalFatsLogged,
      remainingCalories,
      remainingProtein,
      remainingCarbs,
      remainingFats,
      caloriePercentage,
      proteinPercentage,
      carbsPercentage,
      fatsPercentage,
    };
  }

  /**
   * Log a meal
   */
  static async logMeal(log: Omit<NutritionLog, "id" | "created_at">): Promise<void> {
    try {
      const { error } = await supabase
        .from("daily_nutrition_logs")
        .insert(log);

      if (error) throw error;
    } catch (error) {
      console.error("Error logging meal:", error);
      throw error;
    }
  }

  /**
   * Delete a meal log
   */
  static async deleteMealLog(logId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("daily_nutrition_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting meal log:", error);
      throw error;
    }
  }

  /**
   * Get nutrition logs for a date range
   */
  static async getLogsForDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<NutritionLog[]> {
    try {
      const { data, error } = await supabase
        .from("daily_nutrition_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("log_date", startDate)
        .lte("log_date", endDate)
        .order("log_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading date range logs:", error);
      return [];
    }
  }
}
