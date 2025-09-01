
import { foods } from "./foods";
import { mealTemplates } from "./mealTemplates";

interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  name: string;
  items: { food: string; grams: number; protein: number; carbs: number; fats: number; calories: number }[];
  total: { protein: number; carbs: number; fats: number; calories: number };
  templateName?: string;
  difficulty?: 'easy' | 'medium' | 'advanced';
  prepTime?: number;
}

interface QuizAnswers {
  [key: number]: string | number;
}

interface HealthConditions {
  diabetes?: boolean;
  highBloodPressure?: boolean;
  heartDisease?: boolean;
  thyroidIssues?: boolean;
  other?: string;
}

export function generateMealPlan(
  dailyCalories: number,
  macros: Macros,
  dietType: string,
  goal: "Lose fat" | "Build muscle" | "Maintain weight" | "Improve health & wellbeing",
  mealsPerDay: string | number,
  quizAnswers?: QuizAnswers
): Meal[] {
  // Map quiz diet type to template key
  const normalizedDietType = normalizeDietType(dietType);
  const templates = mealTemplates[normalizedDietType] || mealTemplates["omnivore"];
  
  // Parse health conditions from quiz answers
  const healthConditions = parseHealthConditions(quizAnswers);
  
  // Get activity level for meal timing adjustments
  const activityLevel = quizAnswers?.[6] as string || "Moderately active";
  
  // Get exercise time for meal complexity adjustments
  const exerciseTime = quizAnswers?.[11] as string || "30–60 minutes";

  // Parse meals per day from quiz answer (could be string like "2 (intermittent fasting)" or number)
  const parseMealsPerDay = (mealsPerDay: string | number): number => {
    if (typeof mealsPerDay === 'number') {
      return mealsPerDay > 0 ? mealsPerDay : 3;
    }
    
    if (typeof mealsPerDay === 'string') {
      // Extract number from strings like "2 (intermittent fasting)", "3 (standard)", "4 meals", etc.
      const match = mealsPerDay.match(/^(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > 0 ? num : 3;
      }
    }
    
    return 3; // Default fallback
  };
  
  const validMealsPerDay = parseMealsPerDay(mealsPerDay);
  
  // Smart calorie distribution based on goal and activity level
  const distribution = getSmartCalorieDistribution(validMealsPerDay, goal, activityLevel);

  // Smart meal naming based on number of meals
  const getMealNames = (numMeals: number): string[] => {
    if (numMeals === 2) {
      return ["Lunch", "Dinner"]; // Intermittent fasting - skip breakfast
    } else if (numMeals === 3) {
      return ["Breakfast", "Lunch", "Dinner"];
    } else if (numMeals === 4) {
      return ["Breakfast", "Lunch", "Dinner", "Snack"];
    } else if (numMeals === 5) {
      return ["Breakfast", "Lunch", "Dinner", "Snack 1", "Snack 2"];
    } else if (numMeals === 6) {
      return ["Breakfast", "Lunch", "Dinner", "Snack 1", "Snack 2", "Snack 3"];
    } else {
      return ["Breakfast", "Lunch", "Dinner", "Snack 1", "Snack 2", "Snack 3"].slice(0, numMeals);
    }
  };
  
  const mealNames = getMealNames(validMealsPerDay);

  // Track used templates to avoid repetition
  const usedTemplates = new Set<string>();

  return mealNames.map((name, i) => {
    const kcalTarget = dailyCalories * distribution[i];

    // Get appropriate template pool with health condition filtering
    const templatePool = getFilteredTemplates(
      name, 
      templates, 
      healthConditions, 
      goal, 
      exerciseTime,
      usedTemplates
    );

    if (templatePool.length === 0) {
      // Fallback to basic template if no suitable options
      let fallbackPool;
      if (name.includes("Breakfast")) {
        fallbackPool = templates.breakfast;
      } else if (name.includes("Lunch")) {
        fallbackPool = templates.lunch;
      } else if (name.includes("Dinner")) {
        fallbackPool = templates.dinner;
      } else {
        fallbackPool = templates.snacks;
      }
      
      if (fallbackPool && fallbackPool.length > 0) {
        const template = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        return createMealFromTemplate(name, template, kcalTarget, macros);
      } else {
        // Ultimate fallback - use any available template
        const allTemplates = [...(templates.breakfast || []), ...(templates.lunch || []), ...(templates.dinner || []), ...(templates.snacks || [])];
        if (allTemplates.length > 0) {
          const template = allTemplates[Math.floor(Math.random() * allTemplates.length)];
          return createMealFromTemplate(name, template, kcalTarget, macros);
        }
      }
    }

    const template = templatePool[Math.floor(Math.random() * templatePool.length)];
    usedTemplates.add(template.name || `${name}_${i}`);

    return createMealFromTemplate(name, template, kcalTarget, macros);
  });
}

function parseHealthConditions(quizAnswers?: QuizAnswers): HealthConditions {
  if (!quizAnswers?.[10]) return {};
  
  const healthCondition = quizAnswers[10] as string;
  return {
    diabetes: healthCondition === "Diabetes",
    highBloodPressure: healthCondition === "High blood pressure",
    heartDisease: healthCondition === "Heart disease",
    thyroidIssues: healthCondition === "Thyroid issues",
    other: healthCondition === "Other" ? "Other condition" : undefined
  };
}

function getSmartCalorieDistribution(
  mealsPerDay: number, 
  goal: string, 
  activityLevel: string
): number[] {
  // Base distributions
  let baseDistribution: number[];
  
  if (mealsPerDay === 2) {
    // Intermittent fasting - larger meals, typically lunch and dinner
    baseDistribution = [0.4, 0.6];
  } else if (mealsPerDay === 3) {
    baseDistribution = [0.3, 0.4, 0.3];
  } else if (mealsPerDay === 4) {
    baseDistribution = [0.25, 0.3, 0.3, 0.15];
  } else if (mealsPerDay === 5) {
    baseDistribution = [0.2, 0.25, 0.25, 0.2, 0.1];
  } else {
    baseDistribution = Array(mealsPerDay).fill(1 / mealsPerDay);
  }

  // Adjust based on goal
  if (goal === "Build muscle") {
    // More calories in post-workout meals (lunch/dinner)
    if (mealsPerDay >= 3) {
      baseDistribution[1] += 0.05; // Lunch
      if (mealsPerDay >= 3) baseDistribution[2] += 0.05; // Dinner
      baseDistribution[0] -= 0.05; // Breakfast
      if (mealsPerDay > 3) baseDistribution[3] -= 0.05; // Snacks
    } else if (mealsPerDay === 2) {
      // For 2 meals, distribute more evenly for muscle building
      baseDistribution = [0.45, 0.55];
    }
  } else if (goal === "Lose fat") {
    // More calories in breakfast, less in dinner
    if (mealsPerDay >= 3) {
      baseDistribution[0] += 0.05; // Breakfast
      baseDistribution[2] -= 0.05; // Dinner
    } else if (mealsPerDay === 2) {
      // For intermittent fasting fat loss, slightly more in first meal
      baseDistribution = [0.45, 0.55];
    }
  }

  // Adjust based on activity level
  if (activityLevel.includes("Very active") || activityLevel.includes("Extremely active")) {
    // More calories in main meals
    if (mealsPerDay >= 3) {
      baseDistribution[1] += 0.03; // Lunch
      baseDistribution[2] += 0.03; // Dinner
      baseDistribution[0] -= 0.03; // Breakfast
      if (mealsPerDay > 3) baseDistribution[3] -= 0.03; // Snacks
    } else if (mealsPerDay === 2) {
      // For very active people with 2 meals, distribute more evenly
      baseDistribution = [0.48, 0.52];
    }
  }

  return baseDistribution;
}

function getFilteredTemplates(
  mealName: string,
  templates: any,
  healthConditions: HealthConditions,
  _goal: string,
  exerciseTime: string,
  usedTemplates: Set<string>
) {
  let templatePool: any[];
  
  if (mealName.includes("Breakfast")) {
    templatePool = templates.breakfast;
  } else if (mealName.includes("Lunch")) {
    templatePool = templates.lunch;
  } else if (mealName.includes("Dinner")) {
    templatePool = templates.dinner;
  } else {
    templatePool = templates.snacks;
  }

  // Filter based on health conditions
  let filteredTemplates = templatePool.filter(template => {
    return template.items.every((item: any) => {
      const food = foods[item.food];
      if (!food.restrictions) return true;
      
      // Check if food conflicts with health conditions
      if (healthConditions.diabetes && food.restrictions.includes('diabetes')) return false;
      if (healthConditions.heartDisease && food.restrictions.includes('heart disease')) return false;
      if (healthConditions.highBloodPressure && food.restrictions.includes('high blood pressure')) return false;
      
      return true;
    });
  });

  // Prefer foods that benefit health conditions
  if (Object.values(healthConditions).some(condition => condition)) {
    filteredTemplates = filteredTemplates.sort((a, b) => {
      const aHealthScore = calculateHealthScore(a, healthConditions);
      const bHealthScore = calculateHealthScore(b, healthConditions);
      return bHealthScore - aHealthScore;
    });
  }

  // Adjust difficulty based on exercise time
  if (exerciseTime === "Less than 30 minutes") {
    // Prefer easier meals
    filteredTemplates = filteredTemplates.filter(t => t.difficulty === 'easy' || t.difficulty === 'medium');
  } else if (exerciseTime === "More than 1 hour") {
    // Can handle more complex meals
    filteredTemplates = filteredTemplates.sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'advanced': 3 };
      return (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 1) - 
             (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 1);
    });
  }

  // Remove already used templates
  filteredTemplates = filteredTemplates.filter(template => 
    !usedTemplates.has(template.name || '')
  );

  return filteredTemplates;
}

function calculateHealthScore(template: any, healthConditions: HealthConditions): number {
  let score = 0;
  
  template.items.forEach((item: any) => {
    const food = foods[item.food];
    if (food.healthBenefits) {
      food.healthBenefits.forEach(benefit => {
        if (healthConditions.diabetes && benefit === 'diabetes') score += 2;
        if (healthConditions.heartDisease && benefit === 'heart disease') score += 2;
        if (healthConditions.highBloodPressure && benefit === 'high blood pressure') score += 2;
      });
    }
  });
  
  return score;
}

function normalizeDietType(dietType: string): keyof typeof mealTemplates {
  const dietMapping: Record<string, keyof typeof mealTemplates> = {
    "None": "omnivore",
    "Vegetarian": "vegetarian", 
    "Vegan": "vegan",
    "Pescatarian": "pescatarian",
    "Keto": "keto",
    "omnivore": "omnivore",
  };
  
  return dietMapping[dietType] || "omnivore";
}

function createMealFromTemplate(
  mealName: string, 
  template: any, 
  kcalTarget: number, 
  _macros: Macros
): Meal {
  // Calculate base calories of the chosen template
  const baseCalories = template.items.reduce((sum: number, it: any) => {
    const f = foods[it.food];
    return sum + f.calories * (it.base / 100);
  }, 0);

  // Scale factor to meet kcalTarget
  const scale = Math.max(0.5, Math.min(2.0, kcalTarget / baseCalories)); // Limit scaling to reasonable range

  const total = { protein: 0, carbs: 0, fats: 0, calories: 0 };
  const items = template.items.map(({ food, base }: any) => {
    const f = foods[food];
    const grams = Math.round(base * scale);

    const protein = (f.protein * grams) / 100;
    const carbs = (f.carbs * grams) / 100;
    const fats = (f.fats * grams) / 100;
    const calories = (f.calories * grams) / 100;

    total.protein += protein;
    total.carbs += carbs;
    total.fats += fats;
    total.calories += calories;

    return { food: f.name, grams, protein, carbs, fats, calories };
  });

  return { 
    name: mealName, 
    items, 
    total,
    templateName: template.name,
    difficulty: template.difficulty,
    prepTime: template.prepTime
  };
}
