export interface HealthProfile {
  answers: { [key: number]: string | number };
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
  };
}

export interface ActivityLog {
  id: string;
  activity_date: string;
  activity_type: string;
  duration_minutes?: number;
  calories_burned?: number;
  steps?: number;
  notes?: string;
}

export interface HealthCalculations {
  bmiStatus: {
    status: string;
    color: string;
  };
  dailyCalorieTarget: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatsGrams?: number;
  };
  goalAdjustment: number;
}

export interface MealItem {
  food: string;
  grams: number;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface Meal {
  name: string;
  items: MealItem[];
  total: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  templateName?: string;
  difficulty?: string;
  prepTime?: number;
}

export interface ActivityFormData {
  activity_type: string;
  duration_minutes: string;
  calories_burned: string;
  steps: string;
  notes: string;
}

export interface DashboardStats {
  today: string;
  todaysLogs: ActivityLog[];
  totalCalories: number;
  totalSteps: number;
  totalDuration: number;
}

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
  intensity: 'Low' | 'Medium' | 'High';
  category: 'Cardio' | 'Strength' | 'Flexibility';
  videoId: string;
  benefits: string[];
  instructions: string[];
  tips: string[];
  equipment: string[];
  calories: string;
}