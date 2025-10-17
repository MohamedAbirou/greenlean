// Enhanced types for the new meal generation system

export interface UserProfile {
  userId: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: number;
  height: number;
  goalWeight: number;
  activityLevel: string;
  dietType: string;
  goal: 'Lose fat' | 'Build muscle' | 'Maintain weight' | 'Improve health & wellbeing';
  mealsPerDay: number;
  healthConditions: HealthConditions;
  dietaryRestrictions: string[];
  exerciseTime: string;
  exerciseType: string;
}

export interface HealthConditions {
  diabetes?: boolean;
  highBloodPressure?: boolean;
  heartDisease?: boolean;
  thyroidIssues?: boolean;
  other?: string;
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface MacroTargets {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatsPercentage: number;
}

export interface MealComponent {
  food: string;
  grams: number;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  healthScore?: number;
}

export interface Meal {
  name: string;
  items: MealComponent[];
  total: Macros;
  templateName?: string;
  difficulty?: 'easy' | 'medium' | 'advanced';
  prepTime?: number;
  macroAlignmentScore?: number;
  healthConditionScore?: number;
  varietyScore?: number;
  totalScore?: number;
  generationReason?: string;
}

export interface MealTemplate {
  items: {
    food: string;
    base: number;
  }[];
  name?: string;
  difficulty?: 'easy' | 'medium' | 'advanced';
  prepTime?: number;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  tags?: string[];
}

export interface TemplateScore {
  template: MealTemplate;
  macroAlignmentScore: number;
  healthConditionScore: number;
  varietyScore: number;
  userPreferenceScore: number;
  totalScore: number;
  reason: string;
}

export interface FoodHealthMapping {
  foodKey: string;
  healthCondition: string;
  benefitType: 'beneficial' | 'neutral' | 'restricted' | 'avoid';
  benefitScore: number;
  notes?: string;
}

export interface UserPreference {
  preferenceType: 'food_likes' | 'food_dislikes' | 'meal_timing' | 'cooking_style' | 'food_restrictions' | 'template_likes';
  preferenceKey: string;
  preferenceValue: number; // -1 to +1
  confidence: number; // 0 to 1
}

export interface MealFeedback {
  userId: string;
  mealId: string;
  mealName: string;
  templateName?: string;
  rating?: number;
  liked?: boolean;
  satietyScore?: number;
  goalProgressScore?: number;
  feedbackText?: string;
  consumed?: boolean;
  consumedDate?: string;
}

export interface GenerationLog {
  sessionId: string;
  mealName: string;
  templateName?: string;
  templateScore?: number;
  macroAlignmentScore?: number;
  healthConditionScore?: number;
  varietyScore?: number;
  totalScore?: number;
  selectedReason?: string;
  alternativesConsidered?: TemplateScore[];
  scalingFactor?: number;
  finalMacros?: Macros;
  userProfile: UserProfile;
}

export interface MLPrediction {
  recommendedTemplates: string[];
  portionSizes: Record<string, number>;
  confidence: number;
  reasoning: string;
}

export interface MealGenerationConfig {
  enableMLPredictions: boolean;
  maxTemplatesToConsider: number;
  minTemplateScore: number;
  macroTolerance: number; // percentage tolerance for macro targets
  healthConditionWeight: number;
  varietyWeight: number;
  userPreferenceWeight: number;
  macroAlignmentWeight: number;
}
