/**
 * ML Service Integration
 *
 * This service handles communication with the Python ML microservice
 * for AI-powered meal and workout plan generation.
 */

import { parseHeight, parseWeight, toCSV } from "@/utils/parseMetrics";

const ML_SERVICE_URL =
  import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

export interface QuizAnswers {
  // --- Core Profile ---
  age: number;
  gender: string;
  country: string;
  bodyType: string;
  lifestyle: string;

  // --- Weight / Height ---
  currentWeight: number | null;
  targetWeight: number | null;
  height: number | null;
  neck: number | null;
  waist: number | null;

  // --- Goals ---
  mainGoal: string;
  secondaryGoals: string; // CSV
  timeFrame: string;

  // --- Activity & Exercise ---
  exerciseFrequency: string;
  occupation_activity: string;
  preferredExercise: string; // CSV
  trainingEnvironment: string; // CSV
  equipment: string; // CSV
  exerciseTime: string;

  // --- Nutrition ---
  dietaryStyle: string;
  mealsPerDay: string;
  cookingSkill: string;
  cookingTime: string;
  groceryBudget: string;
  dislikedFoods: string; // CSV
  favoriteCuisines: string; // CSV

  // --- Health ---
  healthConditions: string; // CSV
  healthConditions_other: string;
  bodyFat: number | null;
  medications: string;
  stressLevel: number;
  sleepQuality: string;
  motivationLevel: number;
  challenges: string; // CSV
}


export interface MealFood {
  name: string;
  portion: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  meal_type: string;
  meal_name: string;
  prep_time_minutes: number;
  foods: MealFood[];
  recipe: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface MealPlanResponse {
  meals: Meal[];
  daily_totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  hydration_recommendation: string;
  tips: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  instructions: string;
  muscle_groups: string[];
  difficulty: string;
}

export interface WorkoutDay {
  day: string;
  workout_type: string;
  duration_minutes: number;
  exercises: Exercise[];
  warmup: string;
  cooldown: string;
  estimated_calories_burned: number;
}

export interface WorkoutPlanResponse {
  weekly_plan: WorkoutDay[];
  weekly_summary: {
    total_workout_days: number;
    rest_days: number;
    total_time_minutes: number;
    estimated_weekly_calories_burned: number;
  };
  tips: string[];
  notes: string;
}

class MLService {
  private baseUrl: string;

  constructor(baseUrl: string = ML_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check ML service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return res.ok;
    } catch (error) {
      console.error("ML Service health check failed:", error);
      return false;
    }
  }

  /**
   * Convert quiz answers to ML service format
   */
 private mapQuizAnswers(answers: Record<string, any>): QuizAnswers {
  return {
    // --- Core Profile ---
    age: Number(answers.age ?? 0),
    gender: String(answers.gender ?? ""),
    country: String(answers.country ?? ""),
    bodyType: String(answers.bodyType ?? ""),
    lifestyle: String(answers.lifestyle ?? ""),

    // --- Weight / Height ---
    currentWeight: parseWeight(answers.currentWeight),
    targetWeight: parseWeight(answers.targetWeight),
    height: parseHeight(answers.height),
    neck: parseHeight(answers.neck),
    waist: parseHeight(answers.waist),

    // --- Goals ---
    mainGoal: String(answers.mainGoal ?? ""),
    secondaryGoals: toCSV(answers.secondaryGoals),
    timeFrame: String(answers.timeFrame ?? ""),

    // --- Activity & Exercise ---
    exerciseFrequency: String(answers.exerciseFrequency ?? ""),
    occupation_activity: String(answers.occupation_activity ?? ""),
    preferredExercise: toCSV(answers.preferredExercise),
    trainingEnvironment: toCSV(answers.trainingEnvironment),
    equipment: toCSV(answers.equipment),
    exerciseTime: String(answers.exerciseTime ?? answers.cookingTime ?? ""), // fallback

    // --- Nutrition ---
    dietaryStyle: String(answers.dietaryStyle ?? ""),
    mealsPerDay: String(answers.mealsPerDay ?? ""),
    cookingSkill: String(answers.cookingSkill ?? ""),
    cookingTime: String(answers.cookingTime ?? ""),
    groceryBudget: String(answers.groceryBudget ?? ""),
    dislikedFoods: toCSV(answers.dislikedFoods),
    favoriteCuisines: toCSV(answers.favoriteCuisines),

    // --- Health ---
    healthConditions: toCSV(answers.healthConditions),
    healthConditions_other: String(answers.healthConditions_other ?? ""),
    bodyFat: answers.bodyFat ? Number(answers.bodyFat) : null,
    medications: String(answers.medications ?? ""),
    stressLevel: Number(answers.stressLevel ?? 0),
    sleepQuality: String(answers.sleepQuality ?? ""),
    motivationLevel: Number(answers.motivationLevel ?? 0),
    challenges: toCSV(answers.challenges),
  };
}


  /**
   * Generate AI meal plan
   */
  async generateMealPlan(
    userId: string,
    quizResultId: string,
    answers: Record<number, string | number>,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<MealPlanResponse> {
    try {

      const res = await fetch(`${this.baseUrl}/generate-meal-plan`, {
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || `Failed to generate meal plan: ${res.statusText}`);
      }

      const result = await res.json();
      return result.meal_plan;
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw error;
    }
  }

  /**
   * Generate AI workout plan
   */
  async generateWorkoutPlan(
    userId: string,
    quizResultId: string,
    answers: Record<number, string | number>,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<WorkoutPlanResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/generate-workout-plan`, {
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || `Failed to generate workout plan: ${res.statusText}`);
      }

      const result = await res.json();
      return result.workout_plan;
    } catch (error) {
      console.error("Error generating workout plan:", error);
      throw error;
    }
  }

  /**
   * Generate both meal and workout plans
   */
  async generateCompletePlan(
    userId: string,
    quizResultId: string,
    answers: Record<number, string | number>,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<{
    mealPlan: MealPlanResponse;
    workoutPlan: WorkoutPlanResponse;
    macros: { protein: number; carbs: number; fats: number };
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/generate-complete-plan`, {
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || `Failed to generate complete plan: ${res.statusText}`);
      }

      const result = await res.json();
      return {
        mealPlan: result.meal_plan,
        workoutPlan: result.workout_plan,
        macros: result.macros,
      };
    } catch (error) {
      console.error("Error generating complete plan:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const mlService = new MLService();

// Export class for testing
export { MLService };

