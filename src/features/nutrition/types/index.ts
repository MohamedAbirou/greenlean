/**
 * Nutrition Feature Types
 */

export interface NutritionLog {
  id?: string;
  user_id: string;
  log_date: string;
  meal_name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string;
}

export interface TodayLog {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface NutritionStats {
  totalLoggedToday: number;
  totalProteinLogged: number;
  totalCarbsLogged: number;
  totalFatsLogged: number;
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFats: number;
  caloriePercentage: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatsPercentage: number;
}

export interface MacroTargets {
  dailyCalories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
