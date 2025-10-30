// src/features/quiz/api/quizApi.ts (UPDATED)

import { supabase } from "@/lib/supabase/client";
import type { CompletePlan, ProfileData, QuizAnswers } from "../types";

export const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

export const quizApi = {
  async fetchProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  async saveQuizResults(
    userId: string,
    answers: Record<string, any>
  ): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .insert([{ user_id: userId, answers: answers }])
        .select()
        .single();

      if (error) {
        console.error("Error saving quiz result:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error saving quiz result:", err);
      return null;
    }
  },

  /**
   * NEW: Generate plans asynchronously - returns immediately with calculations
   */
  async generatePlansAsync(
    userId: string,
    quizResultId: string,
    answers: Record<string, any>,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<{ calculations: any; macros: any }> {
    try {
      console.log("Starting async plan generation...");

      const response = await fetch(`${ML_SERVICE_URL}/generate-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          quiz_result_id: quizResultId,
          answers: answers,
          ai_provider: aiProvider,
          model_name: modelName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `Failed to generate plans: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        calculations: result.calculations,
        macros: result.macros,
      };
    } catch (error) {
      console.error("Error generating plans:", error);
      throw error;
    }
  },

  /**
   * Check status of plan generation
   */
  async getPlanStatus(userId: string): Promise<{
    meal_plan_status: string;
    workout_plan_status: string;
    meal_plan_error?: string;
    workout_plan_error?: string;
  }> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/plan-status/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch plan status");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching plan status:", error);
      throw error;
    }
  },

  /**
   * LEGACY: Generate AI-powered meal and workout plans (synchronous)
   */
  async generateCompletePlan(
    userId: string,
    quizResultId: string,
    answers: Record<string, any>,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<CompletePlan> {
    try {
      console.log("Generating AI-powered meal and workout plans...");

      const response = await fetch(`${ML_SERVICE_URL}/generate-complete-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          quiz_result_id: quizResultId,
          answers: answers,
          ai_provider: aiProvider,
          model_name: modelName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `Failed to generate plan: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        mealPlan: result.meal_plan,
        workoutPlan: result.workout_plan,
        macros: result.macros,
      };
    } catch (error) {
      console.error("Error generating AI plans:", error);
      throw error;
    }
  },

  storeGeneratedPlans(plan: CompletePlan): void {
    try {
      localStorage.setItem(
        "aiGeneratedPlans",
        JSON.stringify({
          mealPlan: plan.mealPlan,
          workoutPlan: plan.workoutPlan,
          macros: plan.macros,
          generatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Failed to store generated plans:", error);
    }
  },

  storeHealthProfile(answers: QuizAnswers): void {
    try {
      localStorage.setItem("healthProfile", JSON.stringify({ answers }));
    } catch (error) {
      console.error("Failed to store health profile:", error);
    }
  },
};
