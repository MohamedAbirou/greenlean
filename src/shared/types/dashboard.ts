// /src/types/dashboard.ts

export type Nullable<T> = T | null | undefined;

/**
 * Small utility for measurements used in answers (flexible).
 */
export interface Measurement {
  cm?: string | number;
  // keep extensible for other units later
  [other: string]: unknown;
}

/**
 * The answers object coming from the quiz_results.answers JSON column.
 * - Many keys exist; we type the common ones you showed and allow extras.
 * - Keep properties optional because users may skip questions.
 */
export interface DashboardAnswers {
  [key: string]: unknown;
}

/**
 * Macros breakdown inside calculations.
 */
export interface DashboardMacros {
  fat_g: number;
  carbs_g: number;
  protein_g: number;
  fat_pct_of_calories?: number;
  carbs_pct_of_calories?: number;
  protein_pct_of_calories?: number;
}

/**
 * Calculations object coming from quiz_results.calculations JSON.
 */
export interface DashboardCalculations {
  bmi: number;
  bmr: number;
  tdee: number;
  macros: DashboardMacros;
  goalWeight: number;
  goalCalories: number;
  bodyFatPercentage?: number;
}
/**
 * Overview that the dashboard overview tab uses.
 */
export interface DashboardOverview {
  answers: DashboardAnswers;
  calculations: DashboardCalculations;
}

/**
 * Diet plan shape returned by ai_meal_plans table.
 * - plan_data is left `unknown` for now — refine later when you share its structure.
 * - created_at/generated_at are commonly ISO strings from Supabase.
 */
export interface DashboardDietPlan {
  plan_data: DietPlanData;
}

export interface DietPlanData {
  meals: Meal[];
  daily_totals: DailyTotals;
  shopping_list: {
    fats: string[];
    carbs: string[];
    proteins: string[];
    vegetables: string[];
    estimated_cost: string;
    pantry_staples: string[];
  };
  hydration_plan: {
    timing: string[];
    electrolyte_needs: string;
    daily_water_intake: string;
  };
  personalized_tips: string[];
  meal_prep_strategy: {
    storage_tips: string[];
    batch_cooking: string[];
    time_saving_hacks: string[];
  };
}

interface DailyTotals {
  fats: number;
  carbs: number;
  fiber: number;
  protein: number;
  calories: number;
  variance: string;
}

interface Meal {
  tags: string[];
  tips: string[];
  foods: FoodDetails[];
  recipe: string;
  meal_name: string;
  meal_type: string;
  difficulty: string;
  total_fats: number;
  meal_timing: string;
  total_carbs: number;
  total_fiber: number;
  total_protein: number;
  total_calories: number;
  prep_time_minutes: number;
}

interface FoodDetails {
  fats: number;
  name: string;
  carbs: number;
  fiber: number;
  grams: number;
  portion: string;
  protein: number;
  calories: number;
}

/**
 * Workout plan shape returned by ai_workout_plans table.
 */
export interface WorkoutExercise {
  name: string;
  reps: number;
  sets: number;
  tempo: string;
  category: string;
  difficulty: string;
  progression: string;
  alternatives: unknown;
  instructions: string;
  rest_seconds: number;
  safety_notes: string;
  muscle_groups: string[];
  equipment_needed: string[];
}

export interface WeeklySummary {
  total_workout_days: number;
  total_time_minutes: number;
  total_exercises: number;
  difficulty_level: string;
  rest_days?: number;
  cardio_days?: number;
  strength_days?: number;
  training_split?: string;
  progression_strategy?: string;
  estimated_weekly_calories_burned?: number;
}

export interface NutritionTiming {
  hydration: string;
  rest_days: string;
  pre_workout: string;
  post_workout: string;
  pre_workout_timing: string;
  timing_guidelines: string[];
  hydration_tips: string;
}

export interface InjuryPrevention {
  red_flags: string;
  mobility_work: string;
  modification_guidelines: string;
  pre_existing_considerations: string;
  warm_up_routine: string[];
  safety_guidelines: string;
}

export interface WeeklyPlan {
  day: string;
  focus: string;
  warmup: {
    activities: string[];
    duration_minutes: number;
  };
  cooldown: {
    activities: string[];
    duration_minutes: number;
  };
  exercises: WorkoutExercise[];
  intensity: string;
  optional?: boolean;
  rpe_target: string;
  workout_type: string;
  if_low_energy: string;
  if_feeling_good: string;
  duration_minutes: number;
  success_criteria: string;
  training_location: string;
  calories_burned: number;
  difficulty: string;
  estimated_calories_burned: number;
}

export interface WorkoutPlanData {
  weekly_plan: WeeklyPlan[];
  weekly_summary: WeeklySummary;
  nutrition_timing: NutritionTiming;
  injury_prevention: InjuryPrevention;
  personalized_tips: string[];
  periodization_plan: PeriodizationPlan;
  progression_tracking: ProgressionTracking;
  lifestyle_integration: LifestyleIntegration;
  exercise_library_by_location: ExerciseLibrary;
}

export interface DashboardWorkoutPlan {
  id: string;
  user_id: string;
  quiz_result_id?: string | null;
  plan_data: WorkoutPlanData;
  workout_type?: string[] | null;
  duration_per_session?: string | null;
  frequency_per_week?: number | null;
  generated_at?: string | null;
  is_active: boolean;
  created_at?: string | null;
  [key: string]: unknown;
}

/**
 * The full props returned to the UI / react-query when fetching dashboard data.
 */
export interface DashboardProps {
  overviewData: Nullable<DashboardOverview>;
  dietPlanData: Nullable<DashboardDietPlan>;
  workoutPlanData: Nullable<DashboardWorkoutPlan>;
  bmiStatus: BmiStatus;
}

export interface BmiStatus {
  status: string;
  color: string;
}

/**
 * Types for dummy diet/exercise data
 */
export interface DietPlan {
  id: number;
  name: string;
  description: string;
  category: string;
  calories: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  image: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  benefits: string[];
  mealPlan: {
    breakfast: Array<{
      item: string;
      portion: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
    lunch: Array<{
      item: string;
      portion: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
    dinner: Array<{
      item: string;
      portion: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
    snacks: Array<{
      item: string;
      portion: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
  };
  guidelines: string[];
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  intensity: "Low" | "Medium" | "High";
  category: "Cardio" | "Strength" | "Flexibility";
  videoId: string;
  benefits: string[];
  instructions: string[];
  tips: string[];
  equipment: string[];
  calories: string;
}

// Add these types to your existing @/types/dashboard.ts file

export interface PeriodizationPlan {
  week_1_2?: string;
  week_3_4?: string;
  week_5_6?: string;
  week_7?: string;
  week_8_plus?: string;
  [key: string]: string | undefined;
}

export interface ProgressionTracking {
  what_to_track?: string[];
  when_to_progress?: string;
  how_much_to_add?: string;
  plateau_breakers?: string[];
}

export interface LifestyleIntegration {
  work_schedule_tips?: string;
  busy_day_workouts?: string;
  travel_workouts?: string;
  social_considerations?: string;
}

export interface ExerciseLibrary {
  gym_exercises: string[];
  home_exercises: string[];
  outdoor_exercises: string[];
}

export type DashboardTab = "overview" | "meal-plan" | "exercise";
