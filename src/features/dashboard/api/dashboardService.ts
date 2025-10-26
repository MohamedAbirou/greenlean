/**
 * Dashboard API Service
 * Handles all dashboard data operations
 */

import { supabase } from "../../../lib/supabase";
import type {
  DashboardAnswers,
  DashboardCalculations,
  DashboardDietPlan,
  DashboardWorkoutPlan,
  DashboardOverview,
  BmiStatus
} from "../../../types/dashboard";

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

    const bmiStatus = overviewResult ? this.calculateBMIStatus(overviewResult.calculations.bmi) : undefined;

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
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) return null;

    const { data: quizResult } = await supabase
      .from("quiz_results")
      .select("answers")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const answers: DashboardAnswers = quizResult?.answers || {};
    const calculations = this.calculateMetrics(answers, profile);

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
      .order("created_at", { ascending: false})
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  /**
   * Calculate health metrics
   */
  private static calculateMetrics(answers: DashboardAnswers, profile: any): DashboardCalculations {
    const currentWeight = answers.currentWeight as { value?: number; unit?: string } | undefined;
    const heightData = answers.height as { value?: number; unit?: string } | undefined;
    const targetWeightData = answers.targetWeight as { value?: number; unit?: string } | undefined;

    const weight = currentWeight?.value || profile.current_weight || 70;
    const height = heightData?.value || profile.height || 170;
    const age = (answers.age as number) || profile.age || 30;
    const gender = (answers.gender as string) || profile.gender || "male";
    const activityLevel = (answers.activityLevel as string) || "moderately_active";
    const targetWeight = targetWeightData?.value || weight - 5;

    const bmi = weight / Math.pow(height / 100, 2);

    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      super_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
    const goalCalories = Math.round(tdee - 500);

    const protein_g = Math.round(weight * 2);
    const fat_g = Math.round(weight * 1);
    const carbs_g = Math.round((goalCalories - (protein_g * 4 + fat_g * 9)) / 4);

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories,
      goalWeight: targetWeight,
      macros: {
        protein_g,
        carbs_g,
        fat_g,
      },
    };
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
