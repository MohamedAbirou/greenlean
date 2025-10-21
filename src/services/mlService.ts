/**
 * ML Service Integration
 *
 * This service handles communication with the Python ML microservice
 * for AI-powered meal and workout plan generation.
 */

const ML_SERVICE_URL =
  import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

export interface QuizAnswers {
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal_weight: number;
  activity_level: string;
  diet_type: string;
  goal: string;
  meals_per_day: string;
  cuisine: string;
  health_conditions: string;
  exercise_time: string;
  exercise_preference: string;
}

export interface Calculations {
  bmi: number;
  bmr: number;
  tdee: number;
  goalCalories: number;
  goalWeight: number;
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
  private mapQuizAnswers(answers: Record<number, string | number>): QuizAnswers {
    return {
      age: Number(answers[1]),
      gender: String(answers[2]),
      weight: Number(answers[3]),
      height: Number(answers[4]),
      goal_weight: Number(answers[5]),
      activity_level: String(answers[6]),
      diet_type: String(answers[7]),
      goal: String(answers[8]),
      meals_per_day: String(answers[9]),
      cuisine: String(answers[13]),
      health_conditions: String(answers[10]),
      exercise_time: String(answers[11]),
      exercise_preference: String(answers[12]),
    };
  }

  /**
   * Generate AI meal plan
   */
  async generateMealPlan(
    userId: string,
    quizResultId: string,
    answers: Record<number, string | number>,
    calculations: Calculations,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<MealPlanResponse> {
    try {
      const mappedAnswers = this.mapQuizAnswers(answers);

      const res = await fetch(`${this.baseUrl}/generate-meal-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          quiz_result_id: quizResultId,
          answers: mappedAnswers,
          calculations,
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
    calculations: Calculations,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<WorkoutPlanResponse> {
    try {
      const mappedAnswers = this.mapQuizAnswers(answers);

      const res = await fetch(`${this.baseUrl}/generate-workout-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          quiz_result_id: quizResultId,
          answers: mappedAnswers,
          calculations,
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
    calculations: Calculations,
    aiProvider: string = "openai",
    modelName: string = "gpt-4o-mini"
  ): Promise<{
    mealPlan: MealPlanResponse;
    workoutPlan: WorkoutPlanResponse;
    macros: { protein: number; carbs: number; fats: number };
  }> {
    try {
      const mappedAnswers = this.mapQuizAnswers(answers);

      const res = await fetch(`${this.baseUrl}/generate-complete-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          quiz_result_id: quizResultId,
          answers: mappedAnswers,
          calculations,
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

