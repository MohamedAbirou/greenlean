import { supabase } from "@/lib/supabase";
import {
    FoodHealthMapping,
    GenerationLog,
    HealthConditions,
    Macros,
    MacroTargets,
    Meal,
    MealGenerationConfig,
    MealTemplate,
    TemplateScore,
    UserPreference,
    UserProfile
} from "@/types/mealGeneration";
import { logError } from "./errorLogger";
import { foods } from "./foods";
import { mealTemplates } from "./mealTemplates";

// Default configuration for meal generation
const DEFAULT_CONFIG: MealGenerationConfig = {
  enableMLPredictions: true,
  maxTemplatesToConsider: 10,
  minTemplateScore: 0.3,
  macroTolerance: 0.15, // 15% tolerance
  healthConditionWeight: 0.3,
  varietyWeight: 0.2,
  userPreferenceWeight: 0.25,
  macroAlignmentWeight: 0.25
};

/**
 * Enhanced meal generation system with intelligent scoring, health condition filtering,
 * and ML integration for personalized meal recommendations.
 */
export class MealGeneratorV2 {
  private config: MealGenerationConfig;
  private sessionId: string;
  private usedTemplates: Set<string> = new Set();
  private userPreferences: UserPreference[] = [];
  private foodHealthMappings: FoodHealthMapping[] = [];

  constructor(config: Partial<MealGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Main entry point for generating a complete meal plan
   */
  async generateMealPlan(
    userProfile: UserProfile,
    macroTargets: MacroTargets
  ): Promise<Meal[]> {
    try {
      // Load user preferences and health mappings
      await this.loadUserData(userProfile.userId);

      // Generate meals based on user preferences
      const mealNames = this.getMealNames(userProfile.mealsPerDay);
      const calorieDistribution = this.calculateCalorieDistribution(
        userProfile.mealsPerDay,
        userProfile.goal,
        userProfile.activityLevel
      );

      const meals: Meal[] = [];

      for (let i = 0; i < mealNames.length; i++) {
        const mealName = mealNames[i];
        const targetCalories = macroTargets.calories * calorieDistribution[i];
        const targetMacros = this.calculateMealMacroTargets(
          macroTargets,
          calorieDistribution[i]
        );

        const meal = await this.generateSingleMeal(
          mealName,
          targetCalories,
          targetMacros,
          userProfile,
          i
        );

        meals.push(meal);
      }

      // Log generation session
      await this.logGenerationSession(meals, userProfile);

      return meals;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      await logError(
        'error',
        'frontend',
        'Failed to generate meal plan',
        error instanceof Error ? error.message : String(error),
        { userId: userProfile.userId, sessionId: this.sessionId }
      );
      throw error;
    }
  }

  /**
   * Generate a single meal with intelligent template selection and scaling
   */
  private async generateSingleMeal(
    mealName: string,
    targetCalories: number,
    targetMacros: MacroTargets,
    userProfile: UserProfile,
    _mealIndex: number
  ): Promise<Meal> {
    // Get available templates for this meal type
    const availableTemplates = this.getTemplatesForMealType(mealName, userProfile.dietType);
    
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for ${mealName} with diet type ${userProfile.dietType}`);
    }

    // Score and rank templates
    const scoredTemplates = await this.scoreTemplates(
      availableTemplates,
      targetMacros,
      userProfile,
      _mealIndex
    );

    // Select best template
    const selectedTemplate = this.selectBestTemplate(scoredTemplates);
    
    if (!selectedTemplate) {
      throw new Error(`No suitable template found for ${mealName}`);
    }

    // Generate meal from template with intelligent scaling
    const meal = await this.createMealFromTemplate(
      mealName,
      selectedTemplate.template,
      targetCalories,
      targetMacros,
      userProfile
    );

    // Add scoring information to meal
    meal.macroAlignmentScore = selectedTemplate.macroAlignmentScore;
    meal.healthConditionScore = selectedTemplate.healthConditionScore;
    meal.varietyScore = selectedTemplate.varietyScore;
    meal.totalScore = selectedTemplate.totalScore;
    meal.generationReason = selectedTemplate.reason;

    // Mark template as used
    this.usedTemplates.add(selectedTemplate.template.name || `${mealName}_${_mealIndex}`);

    return meal;
  }

  /**
   * Score templates based on multiple criteria
   */
  private async scoreTemplates(
    templates: MealTemplate[],
    targetMacros: MacroTargets,
    userProfile: UserProfile,
    _mealIndex: number
  ): Promise<TemplateScore[]> {
    const scoredTemplates: TemplateScore[] = [];

    for (const template of templates) {
      // Skip if template already used
      if (this.usedTemplates.has(template.name || '')) {
        continue;
      }

      // Calculate macro alignment score
      const macroAlignmentScore = this.calculateMacroAlignmentScore(
        template,
        targetMacros
      );

      // Calculate health condition score
      const healthConditionScore = this.calculateHealthConditionScore(
        template,
        userProfile.healthConditions
      );

      // Calculate variety score
      const varietyScore = this.calculateVarietyScore(template, _mealIndex);

      // Calculate user preference score
      const userPreferenceScore = this.calculateUserPreferenceScore(
        template,
        userProfile.userId
      );

      // Calculate total score
      const totalScore = 
        macroAlignmentScore * this.config.macroAlignmentWeight +
        healthConditionScore * this.config.healthConditionWeight +
        varietyScore * this.config.varietyWeight +
        userPreferenceScore * this.config.userPreferenceWeight;

      // Only include templates that meet minimum score threshold
      if (totalScore >= this.config.minTemplateScore) {
        scoredTemplates.push({
          template,
          macroAlignmentScore,
          healthConditionScore,
          varietyScore,
          userPreferenceScore,
          totalScore,
          reason: this.generateSelectionReason(
            macroAlignmentScore,
            healthConditionScore,
            varietyScore,
            userPreferenceScore
          )
        });
      }
    }

    // Sort by total score (descending)
    return scoredTemplates.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Calculate how well a template aligns with macro targets
   */
  private calculateMacroAlignmentScore(
    template: MealTemplate,
    targetMacros: MacroTargets
  ): number {
    // Calculate base macros for template
    const baseMacros = this.calculateTemplateMacros(template);
    
    // Calculate scaling factor to reach target calories
    const scaleFactor = targetMacros.calories / baseMacros.calories;
    const scaledMacros = this.scaleMacros(baseMacros, scaleFactor);

    // Calculate alignment scores for each macro
    const proteinAlignment = 1 - Math.abs(scaledMacros.protein - targetMacros.protein) / targetMacros.protein;
    const carbsAlignment = 1 - Math.abs(scaledMacros.carbs - targetMacros.carbs) / targetMacros.carbs;
    const fatsAlignment = 1 - Math.abs(scaledMacros.fats - targetMacros.fats) / targetMacros.fats;

    // Weighted average (protein is most important for most goals)
    return Math.max(0, (proteinAlignment * 0.4 + carbsAlignment * 0.3 + fatsAlignment * 0.3));
  }

  /**
   * Calculate health condition compatibility score
   */
  private calculateHealthConditionScore(
    template: MealTemplate,
    healthConditions: HealthConditions
  ): number {
    let score = 0.5; // Base neutral score

    for (const item of template.items) {
      const food = foods[item.food];
      if (!food) continue;

      // Check health condition mappings
      for (const condition of Object.keys(healthConditions)) {
        if (healthConditions[condition as keyof HealthConditions]) {
          const mapping = this.foodHealthMappings.find(
            m => m.foodKey === item.food && m.healthCondition === condition
          );
          
          if (mapping) {
            // Weight by portion size (base grams)
            const weight = Math.min(item.base / 100, 1); // Normalize to 0-1
            score += mapping.benefitScore * weight * 0.1; // Scale down impact
          }
        }
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate variety score to encourage diverse meal selection
   */
  private calculateVarietyScore(template: MealTemplate, _mealIndex: number): number {
    let score = 0.5; // Base score

    // Bonus for different food categories
    const categories = new Set(template.items.map(item => foods[item.food]?.category));
    score += categories.size * 0.1;

    // Bonus for different cooking methods (based on template name)
    if (template.name) {
      const cookingMethods = ['grilled', 'baked', 'steamed', 'stir-fried', 'roasted', 'raw'];
      const hasMethod = cookingMethods.some(method => 
        template.name!.toLowerCase().includes(method)
      );
      if (hasMethod) score += 0.1;
    }

    // Slight penalty for very similar templates to recently used ones
    const recentTemplates = Array.from(this.usedTemplates).slice(-3);
    const similarityPenalty = recentTemplates.some(used => 
      this.calculateTemplateSimilarity(template, used)
    ) ? -0.1 : 0;

    return Math.max(0, Math.min(1, score + similarityPenalty));
  }

  /**
   * Calculate user preference score based on historical feedback
   */
  private calculateUserPreferenceScore(template: MealTemplate, userId: string): number {
    let score = 0.5; // Base neutral score

    // Check for food restrictions first - if any restricted food is found, heavily penalize
    for (const item of template.items) {
      const foodRestriction = this.userPreferences.find(
        p => p.preferenceType === 'food_restrictions' && p.preferenceKey === item.food
      );
      
      if (foodRestriction && foodRestriction.preferenceValue < -0.5) {
        // Heavy penalty for restricted foods
        return 0.1; // Very low score for templates with restricted foods
      }
    }

    // Check user preferences for foods in this template
    for (const item of template.items) {
      const foodPreference = this.userPreferences.find(
        p => p.preferenceType === 'food_likes' && p.preferenceKey === item.food
      );
      
      if (foodPreference) {
        // Weight by portion size and confidence
        const weight = Math.min(item.base / 100, 1) * foodPreference.confidence;
        score += foodPreference.preferenceValue * weight * 0.2;
      }
    }

    // Check template preferences
    if (template.name) {
      const templatePreference = this.userPreferences.find(
        p => p.preferenceType === 'template_likes' && p.preferenceKey === template.name
      );
      
      if (templatePreference) {
        score += templatePreference.preferenceValue * templatePreference.confidence * 0.3;
      }
    }

    // Check cooking style preferences
    if (template.difficulty) {
      const stylePreference = this.userPreferences.find(
        p => p.preferenceType === 'cooking_style' && p.preferenceKey === template.difficulty
      );
      
      if (stylePreference) {
        score += stylePreference.preferenceValue * stylePreference.confidence * 0.1;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Create meal from template with intelligent scaling
   */
  private async createMealFromTemplate(
    mealName: string,
    template: MealTemplate,
    targetCalories: number,
    targetMacros: MacroTargets,
    userProfile: UserProfile
  ): Promise<Meal> {
    // Calculate base macros
    const baseMacros = this.calculateTemplateMacros(template);
    
    // Calculate initial scaling factor
    let scaleFactor = targetCalories / baseMacros.calories;
    
    // Apply intelligent scaling to better match macro targets
    scaleFactor = this.optimizeScalingFactor(
      template,
      scaleFactor,
      targetMacros
    );

    // Ensure scaling is within reasonable bounds
    scaleFactor = Math.max(0.5, Math.min(2.5, scaleFactor));

    // Create meal items
    const items = template.items.map(({ food, base }) => {
      const foodData = foods[food];
      if (!foodData) {
        throw new Error(`Food not found: ${food}`);
      }

      const grams = Math.round(base * scaleFactor);
      const protein = (foodData.protein * grams) / 100;
      const carbs = (foodData.carbs * grams) / 100;
      const fats = (foodData.fats * grams) / 100;
      const calories = (foodData.calories * grams) / 100;

      // Calculate health score for this item
      const healthScore = this.calculateItemHealthScore(food, userProfile.healthConditions);

      return {
        food: foodData.name,
        grams,
        protein,
        carbs,
        fats,
        calories,
        healthScore
      };
    });

    // Calculate totals
    const total = items.reduce(
      (acc, item) => ({
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fats: acc.fats + item.fats,
        calories: acc.calories + item.calories
      }),
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );

    return {
      name: mealName,
      items,
      total,
      templateName: template.name,
      difficulty: template.difficulty,
      prepTime: template.prepTime
    };
  }

  /**
   * Optimize scaling factor to better match macro targets
   */
  private optimizeScalingFactor(
    template: MealTemplate,
    initialScale: number,
    targetMacros: MacroTargets
  ): number {
    const baseMacros = this.calculateTemplateMacros(template);
    
    // Try different scaling factors and pick the one with best macro alignment
    const testScales = [
      initialScale,
      initialScale * 0.9,
      initialScale * 1.1,
      initialScale * 0.8,
      initialScale * 1.2
    ];

    let bestScale = initialScale;
    let bestScore = -Infinity;

    for (const scale of testScales) {
      const scaledMacros = this.scaleMacros(baseMacros, scale);
      
      // Calculate macro alignment score
      const proteinError = Math.abs(scaledMacros.protein - targetMacros.protein) / targetMacros.protein;
      const carbsError = Math.abs(scaledMacros.carbs - targetMacros.carbs) / targetMacros.carbs;
      const fatsError = Math.abs(scaledMacros.fats - targetMacros.fats) / targetMacros.fats;
      
      const score = 1 - (proteinError * 0.4 + carbsError * 0.3 + fatsError * 0.3);
      
      if (score > bestScore) {
        bestScore = score;
        bestScale = scale;
      }
    }

    return bestScale;
  }

  /**
   * Load user preferences and health mappings from database
   */
  private async loadUserData(userId: string): Promise<void> {
    try {
      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);

      this.userPreferences = preferences || [];

      // Load food health mappings
      const { data: mappings } = await supabase
        .from('food_health_mappings')
        .select('*');

      this.foodHealthMappings = mappings || [];
    } catch (error) {
      console.error('Error loading user data:', error);
      // Continue with empty data rather than failing
      this.userPreferences = [];
      this.foodHealthMappings = [];
    }
  }

  /**
   * Log generation session for ML training and analysis
   */
  private async logGenerationSession(meals: Meal[], userProfile: UserProfile): Promise<void> {
    try {
      const logs: Omit<GenerationLog, 'sessionId'>[] = meals.map(meal => ({
        mealName: meal.name,
        templateName: meal.templateName,
        templateScore: meal.totalScore,
        macroAlignmentScore: meal.macroAlignmentScore,
        healthConditionScore: meal.healthConditionScore,
        varietyScore: meal.varietyScore,
        totalScore: meal.totalScore,
        selectedReason: meal.generationReason,
        alternativesConsidered: [], // Could be populated with rejected options
        scalingFactor: 1, // Could be calculated from actual scaling
        finalMacros: meal.total,
        userProfile
      }));

      // Insert logs in batch
      const { error } = await supabase
        .from('meal_generation_logs')
        .insert(
          logs.map(log => ({
            user_id: userProfile.userId,
            session_id: this.sessionId,
            meal_name: log.mealName,
            template_name: log.templateName,
            template_score: log.templateScore,
            macro_alignment_score: log.macroAlignmentScore,
            health_condition_score: log.healthConditionScore,
            variety_score: log.varietyScore,
            total_score: log.totalScore,
            selected_reason: log.selectedReason,
            alternatives_considered: log.alternativesConsidered,
            scaling_factor: log.scalingFactor,
            final_calories: log.finalMacros?.calories,
            final_protein: log.finalMacros?.protein,
            final_carbs: log.finalMacros?.carbs,
            final_fats: log.finalMacros?.fats,
            health_conditions: userProfile.healthConditions,
            dietary_restrictions: userProfile.dietaryRestrictions,
            goal: userProfile.goal,
            diet_type: userProfile.dietType
          }))
        );

      if (error) {
        console.error('Error logging generation session:', error);
      }
    } catch (error) {
      console.error('Error logging generation session:', error);
    }
  }

  // Helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMealNames(mealsPerDay: number): string[] {
    switch (mealsPerDay) {
      case 2: return ["Lunch", "Dinner"];
      case 3: return ["Breakfast", "Lunch", "Dinner"];
      case 4: return ["Breakfast", "Lunch", "Dinner", "Snack"];
      case 5: return ["Breakfast", "Lunch", "Dinner", "Snack 1", "Snack 2"];
      case 6: return ["Breakfast", "Lunch", "Dinner", "Snack 1", "Snack 2", "Snack 3"];
      default: return Array(mealsPerDay).fill(0).map((_, i) => `Meal ${i + 1}`);
    }
  }

  private calculateCalorieDistribution(
    mealsPerDay: number,
    goal: string,
    activityLevel: string
  ): number[] {
    // Base distributions (same as original logic)
    let baseDistribution: number[];
    
    switch (mealsPerDay) {
      case 2: baseDistribution = [0.4, 0.6]; break;
      case 3: baseDistribution = [0.3, 0.4, 0.3]; break;
      case 4: baseDistribution = [0.25, 0.3, 0.3, 0.15]; break;
      case 5: baseDistribution = [0.2, 0.25, 0.25, 0.2, 0.1]; break;
      default: baseDistribution = Array(mealsPerDay).fill(1 / mealsPerDay);
    }

    // Adjust based on goal and activity (same as original logic)
    if (goal === "Build muscle" && mealsPerDay >= 3) {
      baseDistribution[1] += 0.05; // Lunch
      if (mealsPerDay >= 3) baseDistribution[2] += 0.05; // Dinner
      baseDistribution[0] -= 0.05; // Breakfast
      if (mealsPerDay > 3) baseDistribution[3] -= 0.05; // Snacks
    } else if (goal === "Lose fat" && mealsPerDay >= 3) {
      baseDistribution[0] += 0.05; // Breakfast
      baseDistribution[2] -= 0.05; // Dinner
    }

    if (activityLevel.includes("Very active") || activityLevel.includes("Extremely active")) {
      if (mealsPerDay >= 3) {
        baseDistribution[1] += 0.03; // Lunch
        baseDistribution[2] += 0.03; // Dinner
        baseDistribution[0] -= 0.03; // Breakfast
        if (mealsPerDay > 3) baseDistribution[3] -= 0.03; // Snacks
      }
    }

    return baseDistribution;
  }

  private calculateMealMacroTargets(
    dailyTargets: MacroTargets,
    calorieRatio: number
  ): MacroTargets {
    return {
      protein: dailyTargets.protein * calorieRatio,
      carbs: dailyTargets.carbs * calorieRatio,
      fats: dailyTargets.fats * calorieRatio,
      calories: dailyTargets.calories * calorieRatio,
      proteinPercentage: dailyTargets.proteinPercentage,
      carbsPercentage: dailyTargets.carbsPercentage,
      fatsPercentage: dailyTargets.fatsPercentage
    };
  }

  private getTemplatesForMealType(mealName: string, dietType: string): MealTemplate[] {
    const normalizedDietType = this.normalizeDietType(dietType);
    const templates = mealTemplates[normalizedDietType] || mealTemplates["omnivore"];

    if (mealName.includes("Breakfast")) {
      return (templates.breakfast || []) as MealTemplate[];
    } else if (mealName.includes("Lunch")) {
      return (templates.lunch || []) as MealTemplate[];
    } else if (mealName.includes("Dinner")) {
      return (templates.dinner || []) as MealTemplate[];
    } else {
      return (templates.snacks || []) as MealTemplate[];
    }
  }

  private normalizeDietType(dietType: string): keyof typeof mealTemplates {
    const dietMapping: Record<string, keyof typeof mealTemplates> = {
      "None": "omnivore",
      "Vegetarian": "vegetarian", 
      "Vegan": "vegan",
      "Pescatarian": "pescatarian",
      "Keto": "keto",
      "omnivore": "omnivore",
      "vegetarian": "vegetarian",
      "vegan": "vegan",
      "pescatarian": "pescatarian",
      "keto": "keto"
    };
    return dietMapping[dietType] || "omnivore";
  }

  private calculateTemplateMacros(template: MealTemplate): Macros {
    return template.items.reduce(
      (acc, item) => {
        const food = foods[item.food];
        if (!food) return acc;

        const protein = (food.protein * item.base) / 100;
        const carbs = (food.carbs * item.base) / 100;
        const fats = (food.fats * item.base) / 100;
        const calories = (food.calories * item.base) / 100;

        return {
          protein: acc.protein + protein,
          carbs: acc.carbs + carbs,
          fats: acc.fats + fats,
          calories: acc.calories + calories
        };
      },
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );
  }

  private scaleMacros(macros: Macros, scale: number): Macros {
    return {
      protein: macros.protein * scale,
      carbs: macros.carbs * scale,
      fats: macros.fats * scale,
      calories: macros.calories * scale
    };
  }

  private calculateItemHealthScore(foodKey: string, healthConditions: HealthConditions): number {
    let score = 0.5; // Base neutral score

    for (const condition of Object.keys(healthConditions)) {
      if (healthConditions[condition as keyof HealthConditions]) {
        const mapping = this.foodHealthMappings.find(
          m => m.foodKey === foodKey && m.healthCondition === condition
        );
        
        if (mapping) {
          score += mapping.benefitScore * 0.2;
        }
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateTemplateSimilarity(template: MealTemplate, usedTemplateName: string): boolean {
    // Simple similarity check - could be enhanced
    if (!template.name) return false;
    
    const templateWords = template.name.toLowerCase().split(' ');
    const usedWords = usedTemplateName.toLowerCase().split(' ');
    
    const commonWords = templateWords.filter(word => usedWords.includes(word));
    return commonWords.length >= 2; // Similar if 2+ common words
  }

  private selectBestTemplate(scoredTemplates: TemplateScore[]): TemplateScore | null {
    if (scoredTemplates.length === 0) return null;
    
    // Return the highest scoring template
    return scoredTemplates[0];
  }

  private generateSelectionReason(
    macroScore: number,
    healthScore: number,
    varietyScore: number,
    preferenceScore: number
  ): string {
    const reasons: string[] = [];
    
    if (macroScore > 0.8) reasons.push("excellent macro alignment");
    if (healthScore > 0.7) reasons.push("beneficial for health conditions");
    if (varietyScore > 0.6) reasons.push("adds variety to diet");
    if (preferenceScore > 0.6) reasons.push("matches user preferences");
    
    return reasons.length > 0 
      ? `Selected for: ${reasons.join(", ")}`
      : "Selected as best available option";
  }
}

/**
 * Convert legacy quiz answers to new UserProfile format
 */
export function convertQuizAnswersToUserProfile(
  answers: { [key: number]: string | number },
  userId: string
): UserProfile {
  return {
    userId,
    age: answers[1] as number,
    gender: answers[2] as 'Male' | 'Female',
    weight: answers[3] as number,
    height: answers[4] as number,
    goalWeight: answers[5] as number,
    activityLevel: answers[6] as string,
    dietType: answers[7] as string,
    goal: answers[8] as 'Lose fat' | 'Build muscle' | 'Maintain weight' | 'Improve health & wellbeing',
    mealsPerDay: parseMealsPerDay(answers[9] as string | number),
    healthConditions: parseHealthConditions(answers),
    dietaryRestrictions: parseDietaryRestrictions(answers[7] as string),
    exerciseTime: answers[11] as string,
    exerciseType: answers[12] as string
  };
}

function parseMealsPerDay(mealsPerDay: string | number): number {
  if (typeof mealsPerDay === "number") {
    return mealsPerDay > 0 ? mealsPerDay : 3;
  }

  if (typeof mealsPerDay === "string") {
    const match = mealsPerDay.match(/^(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > 0 ? num : 3;
    }
  }

  return 3;
}

function parseHealthConditions(answers: { [key: number]: string | number }): HealthConditions {
  if (!answers[10]) return {};

  const healthCondition = answers[10] as string;
  return {
    diabetes: healthCondition === "Diabetes",
    highBloodPressure: healthCondition === "High blood pressure",
    heartDisease: healthCondition === "Heart disease",
    thyroidIssues: healthCondition === "Thyroid issues",
    other: healthCondition === "Other" ? "Other condition" : undefined,
  };
}

function parseDietaryRestrictions(dietType: string): string[] {
  const restrictions: string[] = [];
  
  if (dietType === "Vegetarian") restrictions.push("meat");
  if (dietType === "Vegan") restrictions.push("meat", "dairy", "eggs");
  if (dietType === "Keto") restrictions.push("high_carb");
  if (dietType === "Gluten-free") restrictions.push("gluten");
  if (dietType === "Lactose intolerant") restrictions.push("lactose");
  
  return restrictions;
}

/**
 * Calculate macro targets based on user profile and goals
 */
export function calculateMacroTargets(
  userProfile: UserProfile,
  dailyCalories: number
): MacroTargets {
  let proteinPercentage: number;
  let carbsPercentage: number;
  let fatsPercentage: number;

  switch (userProfile.goal) {
    case "Lose fat":
      proteinPercentage = 0.35;
      carbsPercentage = 0.35;
      fatsPercentage = 0.30;
      break;
    case "Build muscle":
      proteinPercentage = 0.30;
      carbsPercentage = 0.45;
      fatsPercentage = 0.25;
      break;
    case "Maintain weight":
      proteinPercentage = 0.25;
      carbsPercentage = 0.45;
      fatsPercentage = 0.30;
      break;
    case "Improve health & wellbeing":
      proteinPercentage = 0.25;
      carbsPercentage = 0.50;
      fatsPercentage = 0.25;
      break;
    default:
      proteinPercentage = 0.25;
      carbsPercentage = 0.45;
      fatsPercentage = 0.30;
  }

  // Adjust for diet type
  if (userProfile.dietType === "Keto") {
    proteinPercentage = 0.20;
    carbsPercentage = 0.05;
    fatsPercentage = 0.75;
  }

  // Adjust for health conditions
  if (userProfile.healthConditions.diabetes) {
    carbsPercentage = Math.min(carbsPercentage, 0.40);
    proteinPercentage = Math.max(proteinPercentage, 0.30);
  }

  const protein = (dailyCalories * proteinPercentage) / 4; // 4 cal/g
  const carbs = (dailyCalories * carbsPercentage) / 4; // 4 cal/g
  const fats = (dailyCalories * fatsPercentage) / 9; // 9 cal/g

  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
    calories: Math.round(dailyCalories),
    proteinPercentage,
    carbsPercentage,
    fatsPercentage
  };
}
