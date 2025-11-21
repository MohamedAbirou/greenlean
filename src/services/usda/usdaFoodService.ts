/**
 * USDA FoodData Central API Service
 * Provides access to 350,000+ foods from the USDA database
 *
 * API Documentation: https://fdc.nal.usda.gov/api-guide.html
 * Get Free API Key: https://fdc.nal.usda.gov/api-key-signup.html
 */

const USDA_API_BASE_URL = "https://api.nal.usda.gov/fdc/v1";
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || "";

/**
 * USDA Food Item Interface
 */
export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: USDANutrient[];
  // Calculated nutrition per serving
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export interface USDAFoodDetails extends USDAFood {
  foodClass?: string;
  foodCode?: string;
  publicationDate?: string;
  foodCategory?: {
    description: string;
  };
  labelNutrients?: {
    calories?: { value: number };
    fat?: { value: number };
    carbohydrates?: { value: number };
    protein?: { value: number };
  };
}

/**
 * Nutrient IDs from USDA database
 */
const NUTRIENT_IDS = {
  ENERGY: 1008, // Calories (kcal)
  PROTEIN: 1003, // Protein (g)
  CARBS: 1005, // Carbohydrates (g)
  FAT: 1004, // Total fat (g)
  FIBER: 1079, // Fiber (g)
  SUGAR: 2000, // Sugars (g)
  SODIUM: 1093, // Sodium (mg)
};

class USDAFoodService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = USDA_API_KEY;
    this.baseUrl = USDA_API_BASE_URL;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search for foods in USDA database
   * @param query Search term (e.g., "chicken breast", "apple")
   * @param pageSize Number of results per page (max 200)
   * @param pageNumber Page number (1-indexed)
   * @param dataType Filter by data type: 'Branded', 'Foundation', 'Survey', 'SR Legacy'
   */
  async searchFoods(
    query: string,
    pageSize: number = 25,
    pageNumber: number = 1,
    dataType?: string[]
  ): Promise<USDASearchResult> {
    if (!this.isConfigured()) {
      throw new Error(
        "USDA API key not configured. Please set VITE_USDA_API_KEY in your .env file."
      );
    }

    if (!query || query.trim().length === 0) {
      return {
        foods: [],
        totalHits: 0,
        currentPage: 1,
        totalPages: 0,
      };
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        query: query.trim(),
        pageSize: Math.min(pageSize, 200).toString(),
        pageNumber: pageNumber.toString(),
      });

      if (dataType && dataType.length > 0) {
        params.append("dataType", dataType.join(","));
      }

      const response = await fetch(`${this.baseUrl}/foods/search?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Invalid USDA API key. Please check your configuration.");
        }
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Process foods to calculate nutrition
      const foods: USDAFood[] = data.foods.map((food: any) => this.processFoodItem(food));

      return {
        foods,
        totalHits: data.totalHits || 0,
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
      };
    } catch (error) {
      console.error("USDA food search error:", error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific food item
   * @param fdcId FoodData Central ID
   */
  async getFoodDetails(fdcId: number): Promise<USDAFoodDetails> {
    if (!this.isConfigured()) {
      throw new Error("USDA API key not configured.");
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.processFoodItem(data) as USDAFoodDetails;
    } catch (error) {
      console.error("USDA food details error:", error);
      throw error;
    }
  }

  /**
   * Process food item to extract and calculate nutrition
   */
  private processFoodItem(food: any): USDAFood {
    const nutrients = food.foodNutrients || [];

    // Extract key nutrients
    const getNutrient = (nutrientId: number): number => {
      const nutrient = nutrients.find(
        (n: any) =>
          n.nutrientId === nutrientId ||
          n.nutrientNumber === nutrientId.toString()
      );
      return nutrient?.value || 0;
    };

    const nutrition = {
      calories: getNutrient(NUTRIENT_IDS.ENERGY),
      protein: getNutrient(NUTRIENT_IDS.PROTEIN),
      carbs: getNutrient(NUTRIENT_IDS.CARBS),
      fat: getNutrient(NUTRIENT_IDS.FAT),
      fiber: getNutrient(NUTRIENT_IDS.FIBER),
      sugar: getNutrient(NUTRIENT_IDS.SUGAR),
      sodium: getNutrient(NUTRIENT_IDS.SODIUM),
    };

    // For branded foods, use label nutrients if available
    if (food.labelNutrients) {
      nutrition.calories = food.labelNutrients.calories?.value || nutrition.calories;
      nutrition.protein = food.labelNutrients.protein?.value || nutrition.protein;
      nutrition.carbs = food.labelNutrients.carbohydrates?.value || nutrition.carbs;
      nutrition.fat = food.labelNutrients.fat?.value || nutrition.fat;
    }

    return {
      fdcId: food.fdcId,
      description: food.description || food.lowercaseDescription || "Unknown Food",
      dataType: food.dataType,
      brandOwner: food.brandOwner,
      brandName: food.brandName,
      ingredients: food.ingredients,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      householdServingFullText: food.householdServingFullText,
      foodNutrients: nutrients,
      nutrition,
    };
  }

  /**
   * Get popular/suggested foods (common items users search for)
   */
  async getPopularFoods(): Promise<USDAFood[]> {
    const popularQueries = [
      "chicken breast",
      "brown rice",
      "banana",
      "broccoli",
      "egg",
      "salmon",
      "oatmeal",
      "greek yogurt",
    ];

    try {
      const results = await Promise.all(
        popularQueries.map(async (query) => {
          const result = await this.searchFoods(query, 1);
          return result.foods[0];
        })
      );

      return results.filter(Boolean);
    } catch (error) {
      console.error("Error fetching popular foods:", error);
      return [];
    }
  }

  /**
   * Search foods with autocomplete suggestions
   * Returns quick results for autocomplete UI
   */
  async autocomplete(query: string, limit: number = 10): Promise<USDAFood[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const result = await this.searchFoods(query, limit, 1);
      return result.foods;
    } catch (error) {
      console.error("USDA autocomplete error:", error);
      return [];
    }
  }

  /**
   * Convert USDA food to our meal log format
   */
  convertToMealLog(
    food: USDAFood,
    servings: number = 1
  ): {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_size?: string;
    brand?: string;
  } {
    const multiplier = servings;

    return {
      food_name: food.description,
      calories: Math.round((food.nutrition?.calories || 0) * multiplier),
      protein: Math.round((food.nutrition?.protein || 0) * multiplier * 10) / 10,
      carbs: Math.round((food.nutrition?.carbs || 0) * multiplier * 10) / 10,
      fat: Math.round((food.nutrition?.fat || 0) * multiplier * 10) / 10,
      serving_size: food.householdServingFullText ||
                    `${food.servingSize} ${food.servingSizeUnit}`,
      brand: food.brandName || food.brandOwner,
    };
  }
}

// Export singleton instance
export const usdaFoodService = new USDAFoodService();

export default usdaFoodService;
