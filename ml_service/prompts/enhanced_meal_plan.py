# ml_service/prompts/enhanced_meal_plan.py
"""
Enhanced meal plan prompt with better structure and examples
Ensures AI returns all required fields reliably
"""

from models.quiz import QuizAnswers
from typing import Dict, Any

# Example output to show AI exact format
EXAMPLE_MEAL_PLAN = """{
  "weekly_plan": [
    {
      "day": "monday",
      "breakfast": {
        "name": "Protein-Packed Oatmeal",
        "calories": 380,
        "protein": 18.0,
        "carbs": 52.0,
        "fats": 10.0,
        "ingredients": ["rolled oats (1 cup)", "protein powder (1 scoop)", "banana (1 medium)", "almond butter (1 tbsp)", "cinnamon"],
        "instructions": [
          "Cook oats with water or milk for 5 minutes",
          "Mix in protein powder while hot",
          "Top with sliced banana and almond butter",
          "Sprinkle with cinnamon"
        ],
        "meal_type": "breakfast",
        "prep_time": 5,
        "cook_time": 5
      },
      "lunch": {
        "name": "Grilled Chicken Salad Bowl",
        "calories": 420,
        "protein": 38.0,
        "carbs": 35.0,
        "fats": 14.0,
        "ingredients": ["chicken breast (6 oz)", "mixed greens (3 cups)", "quinoa (1/2 cup cooked)", "cherry tomatoes (1 cup)", "cucumber (1/2)", "olive oil (1 tbsp)", "lemon juice"],
        "instructions": [
          "Grill chicken breast seasoned with salt and pepper",
          "Cook quinoa according to package",
          "Combine greens, quinoa, tomatoes, cucumber in bowl",
          "Slice chicken and add on top",
          "Drizzle with olive oil and lemon juice"
        ],
        "meal_type": "lunch",
        "prep_time": 10,
        "cook_time": 15
      },
      "dinner": {
        "name": "Salmon with Roasted Vegetables",
        "calories": 485,
        "protein": 36.0,
        "carbs": 28.0,
        "fats": 24.0,
        "ingredients": ["salmon fillet (6 oz)", "broccoli (2 cups)", "sweet potato (1 medium)", "olive oil (1 tbsp)", "garlic (2 cloves)", "lemon"],
        "instructions": [
          "Preheat oven to 400°F",
          "Cut sweet potato and broccoli into bite-sized pieces",
          "Toss vegetables with olive oil and minced garlic",
          "Place salmon and vegetables on baking sheet",
          "Bake for 20 minutes until salmon is cooked through",
          "Squeeze lemon over salmon before serving"
        ],
        "meal_type": "dinner",
        "prep_time": 10,
        "cook_time": 20
      },
      "snacks": [
        {
          "name": "Greek Yogurt with Berries",
          "calories": 150,
          "protein": 12.0,
          "carbs": 18.0,
          "fats": 2.0,
          "ingredients": ["Greek yogurt (1 cup)", "mixed berries (1/2 cup)", "honey (1 tsp)"],
          "instructions": ["Mix yogurt with berries", "Drizzle with honey"],
          "meal_type": "snack",
          "prep_time": 2,
          "cook_time": 0
        }
      ],
      "total_calories": 1435,
      "total_protein": 104.0,
      "total_carbs": 133.0,
      "total_fats": 50.0
    }
  ],
  "weekly_summary": {
    "avg_daily_calories": 1950,
    "avg_daily_protein": 145.0,
    "avg_daily_carbs": 200.0,
    "avg_daily_fats": 60.0,
    "total_unique_meals": 21,
    "prep_friendly": true
  },
  "shopping_list": [
    "Protein powder",
    "Rolled oats",
    "Bananas",
    "Almond butter",
    "Chicken breast (3 lbs)",
    "Salmon fillets (6)",
    "Mixed greens",
    "Quinoa",
    "Cherry tomatoes",
    "Broccoli",
    "Sweet potatoes",
    "Greek yogurt",
    "Mixed berries",
    "Olive oil",
    "Lemons",
    "Garlic",
    "Cinnamon",
    "Honey"
  ],
  "meal_prep_tips": [
    "Cook all quinoa and brown rice for the week on Sunday",
    "Grill chicken breasts in bulk (3-4 at once)",
    "Chop vegetables for the week and store in containers",
    "Pre-portion snacks into grab-and-go containers"
  ],
  "nutritional_notes": "This meal plan is designed to support your weight loss goal while maintaining muscle mass. Each meal is balanced with protein to keep you satisfied, complex carbs for energy, and healthy fats for hormone health."
}"""


def generate_enhanced_meal_plan_prompt(
    quiz_data: QuizAnswers,
    calculations: Dict[str, Any],
    user_preferences: Dict[str, Any] = None
) -> str:
    """
    Generate an enhanced prompt that ensures reliable AI responses

    Args:
        quiz_data: User's quiz answers
        calculations: Macro calculations from backend
        user_preferences: Optional preferences for regeneration

    Returns:
        Formatted prompt string
    """

    # Extract key data
    target_cals = calculations.get('target_calories', 2000)
    protein_g = calculations.get('protein_grams', 150)
    carbs_g = calculations.get('carbs_grams', 200)
    fat_g = calculations.get('fat_grams', 60)

    # Build preference notes
    pref_notes = []
    if user_preferences:
        if user_preferences.get('vary_recipes'):
            pref_notes.append("IMPORTANT: Create DIFFERENT recipes than previous plan")
        if user_preferences.get('more_protein'):
            pref_notes.append("Increase protein content in meals")
        if user_preferences.get('simpler_recipes'):
            pref_notes.append("Use simpler recipes with fewer ingredients")

    preference_section = "\n".join(pref_notes) if pref_notes else ""

    return f"""You are an expert nutritionist creating a 7-day personalized meal plan.

====================
USER PROFILE
====================
Goal: {quiz_data.mainGoal}
Timeframe: {quiz_data.timeFrame}
Target Weight: {quiz_data.targetWeight} kg

DAILY NUTRITION TARGETS:
- Calories: {target_cals} kcal (±50 kcal acceptable)
- Protein: {protein_g}g
- Carbs: {carbs_g}g
- Fats: {fat_g}g

DIETARY CONSTRAINTS:
- Style: {quiz_data.dietaryStyle}
- Meals/Day: {quiz_data.mealsPerDay}
- Cooking Skill: {quiz_data.cookingSkill}
- Time Per Meal: {quiz_data.cookingTime}
- Budget: {quiz_data.groceryBudget}

{preference_section}

====================
CRITICAL REQUIREMENTS
====================
1. Return ONLY valid JSON - no markdown, no explanations
2. Include ALL required fields (see schema below)
3. Daily calories MUST be within ±50 of {target_cals} kcal
4. All 7 days MUST be included (monday through sunday)
5. Each day MUST have breakfast, lunch, dinner
6. Use REAL recipes with specific measurements
7. Match cooking skill level ({quiz_data.cookingSkill})
8. Respect time constraint ({quiz_data.cookingTime} per meal)

====================
QUALITY STANDARDS
====================
✓ Recipes must be diverse (no repeats within 3 days)
✓ Ingredients must match dietary style ({quiz_data.dietaryStyle})
✓ Balanced macros across all meals
✓ Clear, step-by-step cooking instructions
✓ Specific ingredient quantities (e.g., "1 cup", "6 oz")
✓ Realistic prep/cook times
✓ Budget-appropriate ingredients ({quiz_data.groceryBudget})

====================
JSON SCHEMA (REQUIRED)
====================
YOU MUST RETURN THIS EXACT STRUCTURE:

{EXAMPLE_MEAL_PLAN}

====================
FIELD REQUIREMENTS
====================
EVERY meal MUST include:
- name: string (meal name)
- calories: integer (positive number)
- protein: float (grams)
- carbs: float (grams)
- fats: float (grams)
- ingredients: array of strings (with quantities)
- instructions: array of strings (step-by-step)
- meal_type: "breakfast" | "lunch" | "dinner" | "snack"
- prep_time: integer (minutes, can be 0)
- cook_time: integer (minutes, can be 0)

EVERY day MUST include:
- day: "monday" | "tuesday" | ... (lowercase)
- breakfast: meal object
- lunch: meal object
- dinner: meal object
- snacks: array of meal objects (can be empty)
- total_calories: integer (sum of all meals)
- total_protein: float (sum of all meals)
- total_carbs: float (sum of all meals)
- total_fats: float (sum of all meals)

====================
VALIDATION RULES
====================
- Daily calories MUST be {target_cals} ± 50 kcal
- Protein per meal should be 20-50g (except snacks)
- All ingredient lists must have at least 3 items
- All instruction lists must have at least 2 steps
- Prep time + cook time should match time constraint
- Shopping list should include ALL ingredients used

====================
NOW CREATE THE PLAN
====================
Generate a complete 7-day meal plan following ALL requirements above.
Return ONLY the JSON - no formatting, no comments, no explanations.

START JSON OUTPUT:
"""


def generate_retry_prompt_with_errors(
    original_prompt: str,
    validation_errors: list,
    attempt_number: int
) -> str:
    """
    Enhance prompt with validation error feedback for retry attempts

    Args:
        original_prompt: Original generation prompt
        validation_errors: List of validation errors from previous attempt
        attempt_number: Current retry attempt (1-indexed)

    Returns:
        Enhanced prompt with error guidance
    """

    # Extract missing/invalid fields
    error_fields = []
    for error in validation_errors:
        field_path = ".".join(str(loc) for loc in error.get('loc', []))
        error_msg = error.get('msg', 'unknown error')
        error_fields.append(f"  - {field_path}: {error_msg}")

    error_summary = "\n".join(error_fields)

    return f"""{original_prompt}

⚠️ PREVIOUS ATTEMPT #{attempt_number} FAILED ⚠️

VALIDATION ERRORS:
{error_summary}

FIX THESE ISSUES:
1. Double-check that ALL fields listed above are included
2. Ensure field types match requirements (string, integer, float, array)
3. Verify day names are lowercase ("monday", not "Monday")
4. Confirm meal_type values are exactly: "breakfast", "lunch", "dinner", or "snack"
5. Make sure arrays are not empty where required

RETRY #{attempt_number + 1} - BE EXTRA CAREFUL:
"""
