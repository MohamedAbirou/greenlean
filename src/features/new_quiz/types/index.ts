// src/features/quiz/types/index.ts

export type UnitSystem = "metric" | "imperial";

export interface QuizAnswers {
  // From Profile (pre-filled)
  age?: string;
  gender?: string;
  country?: string;
  height?: HeightAnswer;
  currentWeight?: WeightAnswer;
  occupation_activity?: string;

  // Quiz Answers
  targetWeight?: WeightAnswer;
  bodyType?: string;
  bodyFat?: number;
  neck?: HeightAnswer;
  waist?: HeightAnswer;
  hip?: HeightAnswer;
  exerciseFrequency?: string;
  preferredExercise?: string[];
  trainingEnvironment?: string[];
  equipment?: string[];
  injuries?: string;
  dietaryStyle?: string;
  foodAllergies?: string;
  dislikedFoods?: string;
  mealsPerDay?: string;
  cookingSkill?: string;
  cookingTime?: string;
  groceryBudget?: string;
  mainGoal?: string;
  secondaryGoals?: string[];
  timeFrame?: string;
  motivationLevel?: number;
  challenges?: string[];
  healthConditions?: string[];
  healthConditions_other?: string;
  medications?: string;
  sleepQuality?: string;
  stressLevel?: number;
  lifestyle?: string;
}

export interface HeightAnswer {
  cm?: string;
  ft?: string;
  inch?: string;
}

export interface WeightAnswer {
  kg?: string;
  lbs?: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  label: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  skippable?: boolean;
  options?: string[];
  units?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  showValue?: boolean;
}

export type QuestionType =
  | "number"
  | "height"
  | "weight"
  | "radio"
  | "select"
  | "multiSelect"
  | "slider"
  | "textarea";

export interface QuizPhase {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: QuizQuestion[];
}

export interface QuizProgressType {
  currentPhase: number;
  currentQuestion: number;
  answers: QuizAnswers;
  heightUnit: string;
  weightUnit: string;
  timestamp: number;
}

export interface ProfileData {
  id: string;
  age: number;
  date_of_birth: string;
  gender: string;
  country: string;
  height_cm: number;
  weight_kg: number;
  occupation_activity: string;
  unit_system: UnitSystem;
  onboarding_completed: boolean;
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

export interface MealPlan {
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

export interface WorkoutPlan {
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

export interface CompletePlan {
  mealPlan: MealPlan;
  workoutPlan: WorkoutPlan;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}
