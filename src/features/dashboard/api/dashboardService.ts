/**
 * Dashboard API Service
 * Handles all dashboard data operations
 */

import { supabase } from "@/lib/supabase/client";
import type {
  BmiStatus,
  DashboardAnswers,
  DashboardCalculations,
  DashboardDietPlan,
  DashboardOverview,
  DashboardWorkoutPlan,
} from "../../../shared/types/dashboard";

export interface DashboardData {
  overviewData?: DashboardOverview;
  dietPlanData?: DashboardDietPlan;
  workoutPlanData?: DashboardWorkoutPlan;
  bmiStatus?: BmiStatus;
}

export class DashboardService {
  /**
   * Fetch complete dashboard data for user
   */
  static async getDashboardData(userId: string): Promise<DashboardData> {
    const [overviewResult, dietResult, workoutResult] = await Promise.all([
      this.getOverviewData(userId),
      this.getDietPlanData(userId),
      this.getWorkoutPlanData(userId),
    ]);

    const bmiStatus =
      overviewResult?.calculations?.bmi !== undefined
        ? this.calculateBMIStatus(overviewResult.calculations.bmi)
        : undefined;

    return {
      overviewData: overviewResult || undefined,
      dietPlanData: dietResult || undefined,
      workoutPlanData: workoutResult || undefined,
      bmiStatus,
    };
  }

  /**
   * Get overview data (profile, calculations)
   */
  static async getOverviewData(userId: string) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (!profile) return null;

    const { data: quizResult } = await supabase
      .from("quiz_results")
      .select("answers, calculations")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!quizResult) return null;

    const answers: DashboardAnswers = quizResult?.answers || {};
    const calculations: DashboardCalculations = quizResult?.calculations || {};

    return { answers, calculations };
  }

  /**
   * Get diet plan data
   */
  static async getDietPlanData(userId: string): Promise<DashboardDietPlan | null> {
    const { data } = await supabase
      .from("ai_meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  /**
   * Get workout plan data
   */
  static async getWorkoutPlanData(userId: string): Promise<DashboardWorkoutPlan | null> {
    const { data } = await supabase
      .from("ai_workout_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  /**
   * Calculate BMI status
   */
  private static calculateBMIStatus(bmi?: number): BmiStatus {
    if (!bmi) {
      return {
        status: "Unknown",
        color: "gray",
      };
    }

    if (bmi < 18.5) {
      return {
        status: "Underweight",
        color: "blue",
      };
    } else if (bmi < 25) {
      return {
        status: "Normal",
        color: "green",
      };
    } else if (bmi < 30) {
      return {
        status: "Overweight",
        color: "yellow",
      };
    } else {
      return {
        status: "Obese",
        color: "red",
      };
    }
  }

  /**
   * Log meal consumption
   */
  static async logMeal(userId: string, mealData: any) {
    const { error } = await supabase.from("meal_logs").insert({
      user_id: userId,
      ...mealData,
      logged_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Log workout completion
   */
  static async logWorkout(userId: string, workoutData: any) {
    const { error } = await supabase.from("workout_logs").insert({
      user_id: userId,
      ...workoutData,
      completed_at: new Date().toISOString(),
    });

    if (error) throw error;
  }
}
