/**
 * Dashboard Feature Types
 */

export interface DashboardAnswers {
  age?: number;
  gender?: string;
  currentWeight?: { value: number; unit: string };
  targetWeight?: { value: number; unit: string };
  height?: { value: number; unit: string };
  activityLevel?: string;
  dietaryPreference?: string;
  mainGoal?: string;
  [key: string]: any;
}

export interface DashboardCalculations {
  bmi?: number;
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
  waterIntakeLiters?: number;
}

export interface BMIStatus {
  status: string;
  color: string;
  description: string;
  range: string;
}

export interface OverviewData {
  answers: DashboardAnswers;
  calculations: DashboardCalculations;
}

export interface DietPlanData {
  meals: Meal[];
  dailyNutrition: DailyNutrition;
  hydration: HydrationData;
  tips: string[];
}

export interface Meal {
  id: string;
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: MealItem[];
  time?: string;
}

export interface MealItem {
  name: string;
  quantity: string;
  calories: number;
}

export interface DailyNutrition {
  totalCalories: number;
  targetCalories: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

export interface HydrationData {
  target: number;
  current: number;
  unit: string;
}

export interface WorkoutPlanData {
  workouts: Workout[];
  weeklySchedule: WeeklySchedule;
  progress: WorkoutProgress;
  tips: string[];
}

export interface Workout {
  id: string;
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  difficulty: string;
  exercises: Exercise[];
  day?: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
}

export interface WeeklySchedule {
  [day: string]: string[];
}

export interface WorkoutProgress {
  completedWorkouts: number;
  totalWorkouts: number;
  weeklyGoal: number;
  currentStreak: number;
}

export interface DashboardData {
  overviewData?: OverviewData;
  dietPlanData?: DietPlanData;
  workoutPlanData?: WorkoutPlanData;
  bmiStatus?: BMIStatus;
}

export type DashboardTab = "overview" | "meal-plan" | "exercise";
