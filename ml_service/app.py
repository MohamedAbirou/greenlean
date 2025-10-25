from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
from contextlib import asynccontextmanager
from pydantic import BaseModel
import os, logging, asyncpg, anthropic, json, math
import google.generativeai as genai
from llamaapi import LlamaAPI
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Optional, Union
from pydantic import BaseModel

# Load environment variables from .env
load_dotenv()

# ====== Environment Keys ======
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Initialize clients
if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
if LLAMA_API_KEY:
    llama_client = LlamaAPI(LLAMA_API_KEY)
if ANTHROPIC_API_KEY:
    anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for database connection
db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database connection on startup"""
    global db_pool
    
    try:
        # Initialize database connection pool
        db_pool = await asyncpg.create_pool(user=USER,
                                            password=PASSWORD,
                                            host=HOST,
                                            port=PORT,
                                            database=DBNAME,
                                            min_size=1,
                                            max_size=10
                                            )
        logger.info("Database connection pool initialized")
        
        yield
        
    finally:
        # Cleanup
        if db_pool:
            await db_pool.close()
        logger.info("Application shutdown complete")

app = FastAPI(
    title="AI Health & Fitness ML Service",
    description="Machine learning service for personalized meal and workout plan generation",
    version="2.0.0",
    lifespan=lifespan
)


origins = [
    "http://localhost:5173",
    "https://rsufjeprivwzzygrbvdb.supabase.co",
    "https://greenlean.vercel.app/",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEAL_PLAN_PROMPT = """
You are a professional nutrition assistant and meal designer, helping create realistic, evidence-based plans. 
You guide and suggest meals — not prescribe — emphasizing flexibility and personal choice.
Create a deeply personalized daily meal plan with 3–5 meals (depending on {meals_per_day}), optimized for the user's preferences, goals, and calorie/macro targets, designed for sustainable progress and optimal health outcomes.

User Profile Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMOGRAPHICS & PHYSIQUE:
- Age: {age} years | Gender: {gender}
- Height: {height} | Current Weight: {current_weight}
- Target Weight: {target_weight} | Body Type: {body_type} | Body Fat Percentage: {body_fat}

HEALTH STATUS:
- Health Conditions: {health_conditions}
- Additional Conditions: {health_conditions_other}
- Current Medications: {medications}
- Sleep Quality: {sleep_quality} | Stress Level: {stress_level}/10

LIFESTYLE & CONSTRAINTS:
- Occupation: {occupation_activity}
- Lifestyle Habits: {lifestyle}
- Location: {country}
- Exercise Frequency: {exercise_frequency}
- Preferred Exercise: {preferred_exercise}

NUTRITION PREFERENCES:
- Dietary Style: {dietary_style}
- Food Restrictions/Dislikes: {disliked_foods}
- Food Allergies: {foodAllergies}
- Meals per Day: {meals_per_day}
- Cooking Skill: {cooking_skill}
- Available Cooking Time: {cooking_time}
- Grocery Budget: {grocery_budget}

GOALS & CHALLENGES:
- Primary Goal: {main_goal}
- Secondary Goals: {secondary_goals}
- Target Timeframe: {time_frame}
- Motivation Level: {motivation_level}/10
- Main Challenges: {challenges}

CALCULATED NUTRITION TARGETS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Daily Calories: {daily_calories} kcal
- Protein: {protein}g ({protein_pct_of_calories}% of calories)
- Carbohydrates: {carbs}g ({carbs_pct_of_calories}% of calories)
- Fats: {fats}g ({fat_pct_of_calories}% of calories)

IMPORTANT CONSIDERATIONS:
1. **Health-Condition-Based Adjustments** (If Applicable):
   - Tailor the plan based on any reported health conditions (e.g., IBS, lactose intolerance, diabetes, hypertension, gluten sensitivity, etc.).
   - Avoid or minimize foods that may worsen the user’s specific condition(s).
   - Suggest safe and suitable alternatives where possible (e.g., lactose-free dairy for lactose intolerance, gluten-free grains for celiac sensitivity).
   - If a condition requires special nutrition (e.g., high fiber for cholesterol, low sodium for hypertension), adjust meal composition accordingly.
   - Always prioritize balance, comfort, and tolerability for the individual user.

2. **Cuisine & Cultural Adaptation**:
   - Adapt recipes to local ingredient availability in {country}
   - Respect cultural food preferences and cooking methods

3. **Budget & Time Optimization**:
   - Keep recipes within {grocery_budget} budget range
   - Ensure prep time aligns with {cooking_time} constraint
   - Suggest affordable alternatives for expensive ingredients
   - Include batch cooking tips when appropriate

4. **Goal-Specific Optimization**:
   - For "Lose fat": Create slight calorie deficit, high protein, high satiety
   - For "Build muscle": Ensure adequate protein timing, pre/post-workout nutrition
   - For "Body recomposition": Balance protein high, strategic carb timing
   - For "Maintain weight": Focus on nutrient density and sustainability

5. **Medication & Supplement Interactions**:
   - Consider timing with medications (e.g., probiotics with meals)
   - Avoid contraindicated foods if relevant
   - Support medication effectiveness through nutrition
   
6. **Consistency & Sustainability**:
   - Allow some meal repetition across days to support routine and consistency.
   - Favor practical, repeatable recipes over excessive novelty.


OUTPUT FORMAT:
Return ONLY valid JSON — no markdown or extra explanations.
Use this **exact structure and field names**:

{{
  "meals": [
    {{
      "meal_type": "breakfast/lunch/dinner/snack",
      "meal_name": "Creative, appetizing name (e.g., 'Mediterranean Power Bowl')",
      "prep_time_minutes": 10-30,
      "difficulty": "easy/medium/advanced",
      "meal_timing": "Specific realistic range like '7:00 AM - 8:00 AM'",
      "total_calories": number,
      "total_protein": number,
      "total_carbs": number,
      "total_fats": number,
      "total_fiber": number,
      "tags": ["short descriptive tags, like 'high-protein', 'quick', 'gut-friendly'"],
      "foods": [
        {{
          "name": "Food item name",
          "portion": "e.g., 1 cup / 150g / 2 slices",
          "grams": number,
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
        }}
      ],
      "recipe": "Full recipe instructions on how to exactly cook each mean written as natural text, not a list.",
      "tips": ["2-3 short practical tips about preparation, substitutions, or storage."]
    }}
  ],
  "daily_totals": {{
    "calories": {daily_calories},
    "protein": {protein},
    "carbs": {carbs},
    "fats": {fats},
    "fiber": 25,
    "variance": "± 5%"
  }},
  "hydration_plan": {{
    "daily_water_intake": "Quantify clearly, e.g. '3–4 liters (12–16 cups)'",
    "timing": [
      "Morning: 2 glasses upon waking",
      "Pre-workout: 1–2 glasses 30 min before",
      "During workout: Sip every 15–20 min",
      "Post-workout: 2–3 glasses",
      "With meals: 1 glass each",
      "Before bed: 1 glass"
    ],
    "electrolyte_needs": "Add electrolytes if exercising >60 min or in hot climate"
  }},
  "shopping_list": {{
    "proteins": ["List of all protein items with estimated weekly quantity"],
    "vegetables": ["List of vegetables required for all meals"],
    "carbs": ["List of carbohydrate sources"],
    "fats": ["Healthy fat sources used"],
    "pantry_staples": ["Condiments, herbs, spices, sauces"],
    "estimated_cost": "Estimated weekly cost aligned with {grocery_budget}"
  }},
  "personalized_tips": [
    "💡 Tip addressing {challenges}",
    "🎯 Motivation boost based on motivation level {motivation_level}/10",
    "😌 Stress management nutrition tip (stress level {stress_level}/10)",
    "😴 Sleep optimization nutrition tip for {sleep_quality}",
    "🏋️ Goal-specific advice for {main_goal}",
    "🧘 Reminder: Use this plan as guidance, not a rulebook — adjust portions based on hunger and energy levels."
  ],
  "meal_prep_strategy": {{
    "batch_cooking": ["Batch ideas, e.g., cook 4 chicken breasts on Sunday", "Prep grains ahead"],
    "storage_tips": ["Storage times and methods for cooked meals"],
    "time_saving_hacks": ["Practical hacks based on {cooking_time} constraint"]
  }}
}}

Before finalizing output:
- Recalculate total macros from all foods to verify alignment within ±5% of targets.
- If variance exceeds 5%, adjust portion sizes or food selections to correct it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY CONTROL CHECKLIST:
✓ Macros match targets within ±5%
✓ Meals culturally and regionally appropriate  
✓ All health conditions respected
✓ Dietary restrictions 100% followed
✓ Cooking time and skill level appropriate and matched
✓ Budget-conscious (Affordable) ingredient choices within {grocery_budget}  
✓ Creative, appetizing names and practical recipes  
✓ Realistic portions and measurements
✓ Goal-aligned nutrient timing
✓ Sustainable and enjoyable (not overly restrictive)
✓ Daily hydration and prep strategies included  
✓ Output strictly valid JSON — no text outside the JSON

IMPORTANT: Return ONLY valid JSON strictly matching the structure above. 
Do NOT include markdown, explanations, or comments. 
If any field has no data, return an empty string ("") instead of omitting it. 
Every key must be present exactly as shown.
"""

WORKOUT_PLAN_PROMPT = """
You are a certified fitness coach, exercise physiologist, and strength & conditioning specialist. Create a comprehensive, science-based 7-day workout plan that maximizes results while respecting the user's limitations and lifestyle.

User Profile Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMOGRAPHICS & PHYSIQUE:
- Age: {age} years | Gender: {gender}
- Height: {height} | Current Weight: {current_weight}
- Target Weight: {target_weight} | Body Type: {body_type} | Body Fat Percentage: {body_fat}

TRAINING PROFILE:
- Current Activity Level: {exercise_frequency}
- Preferred Exercise Types: {preferred_exercise}
- Training Locations: {training_environment}
- Available Equipment: {equipment}
- Injuries/Limitations: Check health conditions below

HEALTH & RECOVERY:
- Health Conditions: {health_conditions}
- Additional Conditions: {health_conditions_other}
- Current Medications: {medications}
- Sleep Quality: {sleep_quality} | Stress Level: {stress_level}/10
- Lifestyle: {lifestyle}

GOALS & CONTEXT:
- Primary Goal: {main_goal}
- Secondary Goals: {secondary_goals}
- Target Timeframe: {time_frame}
- Motivation Level: {motivation_level}/10
- Main Challenges: {challenges}
- Occupation: {occupation_activity}
- Location: {country}

TRAINING ENVIRONMENT INTERPRETATION:
Based on user's selected environment: {training_environment}
- If "Gym" is selected: Provide gym-based exercises for those days
- If "Home" is selected: Use bodyweight/minimal equipment for home days
- If "Outdoor" is selected: Include outdoor activities (running, calisthenics, sports)
- If multiple selected: Strategically alternate throughout the week
Available Equipment: {equipment}

PROGRAMMING PRINCIPLES:
1. **Goal-Specific Periodization**:
   - Lose fat: Higher volume, moderate intensity, metabolic conditioning
   - Build muscle: Progressive overload, hypertrophy rep ranges (8-12), adequate rest
   - Body recomposition: Mix strength (4-6 reps) + hypertrophy (8-12) + conditioning
   - Improve strength: Lower reps (3-5), longer rest, compound movements
   - Improve endurance: Higher reps (15+), shorter rest, circuit training
   - General health: Balanced approach with variety

2. **Recovery & Adaptation** (Critical):
   - Sleep Quality: {sleep_quality} → Adjust volume accordingly
   - Stress Level: {stress_level}/10 → Higher stress = lower volume/intensity
   - Age Factor: {age} years → Recovery needs and injury prevention
   - Medications: {medications} → Energy levels and recovery capacity

3. **Progressive Overload Strategy**:
   - Week 1-2: Adaptation phase (learn movements, build work capacity)
   - Week 3-4: Increase intensity (add weight, reduce rest)
   - Week 5-6: Peak volume (maximize stimulus)
   - Week 7: Deload (active recovery, reduced volume)

4. **Exercise Selection Logic**:
   - Respect injuries/limitations: {injuries}
   - Match equipment availability: {equipment}
   - Suit training environment: {training_environment}
   - Align with preferences: {preferred_exercise}
   - Consider IBS if applicable: Avoid excessive core compression exercises

5. **Time & Adherence Optimization**:
   - Exercise frequency: {exercise_frequency} → Realistic weekly commitment
   - Challenges: {challenges} → Address specific barriers
   - Motivation: {motivation_level}/10 → Adjust complexity and variety
   - Occupation: {occupation_activity} → Energy availability

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure (no markdown, no extra text):

{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout_type": "Upper Body Strength",
      "training_location": "Gym",
      "focus": "Chest, Back, Shoulders",
      "duration_minutes": 60,
      "intensity": "Moderate-High",
      "exercises": [
        {{
          "name": "Barbell Bench Press",
          "category": "compound",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "tempo": "2-0-2-0",
          "instructions": "Clear, safe execution cues. Form > weight. Control eccentric.",
          "muscle_groups": ["chest", "triceps", "shoulders"],
          "difficulty": "intermediate",
          "equipment_needed": ["barbell", "bench"],
          "alternatives": {{
            "home": "Push-ups with elevation",
            "outdoor": "Decline push-ups on bench",
            "easier": "Dumbbell press",
            "harder": "Incline barbell press"
          }},
          "progression": "Add 2.5kg when you hit 4x10 with good form",
          "safety_notes": "Keep shoulder blades retracted, avoid flaring elbows"
        }}
      ],
      "warmup": {{
        "duration_minutes": 10,
        "activities": [
          "5 min light cardio (treadmill/bike)",
          "Arm circles: 10 each direction",
          "Band pull-aparts: 2x15",
          "Push-up plus: 2x10",
          "Specific warm-up sets for first exercise"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 10,
        "activities": [
          "Child's pose: 60 seconds",
          "Chest doorway stretch: 60s each side",
          "Shoulder dislocations with band: 2x10",
          "Deep breathing exercises: 3 minutes"
        ]
      }},
      "estimated_calories_burned": 350,
      "rpe_target": "7-8 out of 10",
      "success_criteria": "Complete all sets with good form, feel muscle engagement",
      "if_low_energy": "Reduce sets by 25%, maintain intensity on key lifts"
    }},
    {{
      "day": "Tuesday",
      "workout_type": "Active Recovery / Mobility",
      "training_location": "Home or Outdoor",
      "focus": "Recovery, flexibility, stress reduction",
      "duration_minutes": 30,
      "intensity": "Low",
      "exercises": [
        {{
          "name": "Yoga Flow",
          "category": "mobility",
          "sets": 1,
          "reps": "20 minutes",
          "rest_seconds": 0,
          "instructions": "Gentle flow focusing on breath and movement quality",
          "muscle_groups": ["full body"],
          "difficulty": "beginner",
          "equipment_needed": ["yoga mat"],
          "alternatives": {{
            "home": "Follow online yoga video",
            "outdoor": "Light walk in nature",
            "easier": "Stretching routine",
            "if_busy": "10-min mobility routine"
          }}
        }}
      ],
      "purpose": "Facilitate recovery, reduce stress (current level: {stress_level}/10), improve sleep",
      "optional": true,
      "if_feeling_good": "Can do light cardio instead (20-30 min walk/bike)"
    }}
  ],
  "weekly_summary": {{
    "total_workout_days": 5,
    "strength_days": 3,
    "cardio_days": 2,
    "rest_days": 2,
    "total_time_minutes": 300,
    "estimated_weekly_calories_burned": 2100,
    "training_split": "Upper/Lower/Full Body + Conditioning",
    "progression_strategy": "Linear progression with deload every 4th week"
  }},
  "periodization_plan": {{
    "week_1_2": "Adaptation: Focus on form, establish baseline",
    "week_3_4": "Build: Increase load 5-10%, maintain volume",
    "week_5_6": "Peak: Max volume, push intensity",
    "week_7": "Deload: Reduce volume by 40%, maintain intensity",
    "week_8_plus": "Repeat cycle with higher baseline"
  }},
  "exercise_library_by_location": {{
    "gym_exercises": ["List key gym exercises for their goals"],
    "home_exercises": ["Bodyweight/minimal equipment alternatives"],
    "outdoor_exercises": ["Running routes, park workouts, trails"]
  }},
  "progression_tracking": {{
    "what_to_track": ["Weight lifted", "Reps completed", "RPE", "Energy levels"],
    "when_to_progress": "When you can complete top end of rep range for all sets",
    "how_much_to_add": "2.5-5kg for upper body, 5-10kg for lower body",
    "plateau_breakers": ["Deload week", "Change rep ranges", "Modify exercise selection"]
  }},
  "personalized_tips": [
    "Recovery tip based on sleep quality: {sleep_quality}",
    "Stress management: Given stress level {stress_level}/10, incorporate more recovery",
    "IBS consideration: Avoid high-impact core work immediately after meals if IBS-D present",
    "Goal-specific tip for {main_goal}",
    "Motivation strategy for level {motivation_level}/10",
    "Time management tip addressing: {challenges}",
    "Age-appropriate intensity for {age} years old"
  ],
  "injury_prevention": {{
    "mobility_work": "Daily 10-min routine focusing on weak points",
    "red_flags": "Stop if sharp pain, dizziness, or unusual symptoms",
    "modification_guidelines": "How to adjust based on how you feel",
    "pre_existing_considerations": "Specific to {health_conditions_other}"
  }},
  "nutrition_timing": {{
    "pre_workout": "Eat 1-2 hours before, focus on carbs + moderate protein",
    "post_workout": "Within 2 hours, protein + carbs for recovery",
    "rest_days": "Maintain protein, slightly lower carbs",
    "hydration": "Drink 500ml 2 hours before, sip during workout"
  }},
  "lifestyle_integration": {{
    "busy_day_workouts": "Quick 20-30 min options",
    "travel_workouts": "Hotel room/minimal equipment routines",
    "social_considerations": "How to maintain consistency with social life",
    "work_schedule_tips": "Best times to train based on {occupation_activity}"
  }}
}}

QUALITY CONTROL CHECKLIST:
✓ Goal alignment: {main_goal} is primary focus
✓ Frequency matches: {exercise_frequency}
✓ Equipment is available: {equipment}
✓ Location feasible: {training_environment}
✓ Health conditions respected: {health_conditions_other}
✓ Recovery adequate for: Sleep {sleep_quality}, Stress {stress_level}/10
✓ Age-appropriate: {age} years
✓ Progressive overload built in
✓ Injury prevention emphasized
✓ Realistic time commitment
✓ Enjoyment factor (preferences: {preferred_exercise})
✓ Challenges addressed: {challenges}
✓ Alternative exercises provided
✓ Clear progression rules
✓ Sustainable long-term
"""


# ====== Core Measurement Models ======
class WeightMeasurement(BaseModel):
    """Supports weight input in either kg or lbs."""
    kg: Optional[Union[str, float]] = None
    lbs: Optional[Union[str, float]] = None

class LengthMeasurement(BaseModel):
    """Supports length input in either cm or ft/in."""
    cm: Optional[Union[str, float]] = None
    ft: Optional[Union[str, float]] = None
    inch: Optional[Union[str, float]] = None

# ====== Core Models ======
class QuizAnswers(BaseModel):
    # Basic info
    age: Union[str, int]
    gender: str
    country: Optional[str] = None

    # Body metrics
    height: LengthMeasurement
    currentWeight: WeightMeasurement
    targetWeight: WeightMeasurement
    neck: Optional[LengthMeasurement] = None
    waist: Optional[LengthMeasurement] = None
    hip: Optional[LengthMeasurement] = None
    bodyFat: Optional[Union[int, float]] = None

    # Goals
    mainGoal: str
    secondaryGoals: Optional[List[str]] = None
    timeFrame: str
    bodyType: Optional[str] = None

    # Lifestyle
    lifestyle: str
    occupation_activity: Optional[str] = None
    groceryBudget: Optional[str] = None
    dietaryStyle: str
    mealsPerDay: str
    motivationLevel: int
    stressLevel: int
    sleepQuality: str

    # Health
    healthConditions: Optional[List[str]] = None
    healthConditions_other: Optional[str] = None
    medications: Optional[str] = None
    injuries: Optional[str] = None
    foodAllergies: Optional[str] = None

    # Exercise & training
    exerciseFrequency: str
    preferredExercise: List[str]
    trainingEnvironment: List[str]
    equipment: Optional[List[str]] = None

    # Food preferences
    dislikedFoods: Optional[str] = None
    cookingSkill: str
    cookingTime: str

    # Other
    challenges: Optional[List[str]] = None
    country: Optional[str] = None
    groceryBudget: str
    medications: Optional[str] = None

class Macros(BaseModel):
    protein_g: int
    carbs_g: int
    fat_g: int
    protein_pct_of_calories: int
    carbs_pct_of_calories: int
    fat_pct_of_calories: int

class Calculations(BaseModel):
    bmi: float
    bmr: float
    tdee: float
    bodyFatPercentage: float
    macros: Macros
    goalCalories: int
    goalWeight: float

class GeneratePlansRequest(BaseModel):
    user_id: str
    quiz_result_id: str
    answers: QuizAnswers
    ai_provider: str = "openai"
    model_name: str = "gpt-4o-mini"

# ====== Helper Functions ======
def parse_height(height_input):
    cm = parse_measurement(height_input)
    if cm is None:
        return None, ""
    # Return formatted string
    if isinstance(height_input, dict) and ("ft" in height_input or "inch" in height_input):
        ft = float(height_input.get("ft", 0))
        inch = float(height_input.get("inch", 0))
        return cm, f"{int(ft)}'{int(inch)}\""
    return cm, f"{cm} cm"

def parse_weight(weight_input):
    """
    Parse weight input into kilograms, formatted display, and unit.
    Returns (weight_kg, display_str, unit).
    """
    if not weight_input:
        return None, "", None

    # Convert model to dict
    if hasattr(weight_input, "dict"):
        weight_input = weight_input.dict()

    # Dict case
    if isinstance(weight_input, dict):
        if "kg" in weight_input and weight_input["kg"] is not None:
            val = float(weight_input["kg"])
            return val, f"{val} kg", "kg"
        elif "lbs" in weight_input and weight_input["lbs"] is not None:
            val = float(weight_input["lbs"])
            kg = val / 2.2046226218
            return kg, f"{val} lbs", "lbs"

    # String cases
    if isinstance(weight_input, str):
        lower = weight_input.lower().strip()
        if "kg" in lower:
            val = float(lower.replace("kg", "").strip())
            return val, f"{val} kg", "kg"
        elif "lb" in lower:
            val = float(lower.replace("lbs", "").replace("lb", "").strip())
            kg = val / 2.2046226218
            return kg, f"{val} lbs", "lbs"

    # Raw numeric fallback
    if isinstance(weight_input, (int, float)):
        return float(weight_input), f"{float(weight_input)} kg", "kg"

    return None, "", None

def parse_measurement(m):
    """
    Parse measurement into cm.
    Returns (value_in_cm, formatted_str, unit).
    """
    if not m:
        return None, "", None

    # Convert model to dict
    if hasattr(m, "dict"):
        m = m.dict()

    if "cm" in m and m["cm"] is not None:
        val = float(m["cm"])
        return val, f"{val} cm", "cm"

    ft = float(m.get("ft", 0))
    inch = float(m.get("inch", 0))
    if ft or inch:
        cm = ft * 30.48 + inch * 2.54
        return cm, f"{int(ft)}'{int(inch)}\"", "ft/in"

    return None, "", None

def calculate_navy_bfp(gender: str, height_m: float, neck_cm: float, waist_cm: float, hip_cm: float = None) -> float:
    """
    Calculate approximate body fat % using U.S. Navy Method.
    All measurements must be in cm.
    """
    try:
        if gender.lower() == "male":
            bfp = 495 / (1.0324 - 0.19077 * math.log10(waist_cm - neck_cm) + 0.15456 * math.log10(height_m*100)) - 450
        elif gender.lower() == "female":
            if hip_cm is None:
                raise ValueError("Hip measurement required for female BFP calculation")
            bfp = 495 / (1.29579 - 0.35004 * math.log10(waist_cm + hip_cm - neck_cm) + 0.22100 * math.log10(height_m*100)) - 450
        else:
            return None  # Cannot calculate for non-binary / unspecified
        return round(bfp, 1)
    except:
        return None

def calculate_nutrition_profile(answers: QuizAnswers):
    """
    Compute BMI, BMR, TDEE, goal calories, macros, and estimated weeks to reach target weight.
    Handles multiple input formats for height and weight.
    """

    # --- Basic info ---
    age = int(answers.age)
    gender = answers.gender
    goal = answers.mainGoal
    dietary_style = (answers.dietaryStyle or "").lower()
    exercise_freq = answers.exerciseFrequency or "Never"
    occupation = (answers.occupation_activity or "").lower()
    body_fat_pct = getattr(answers, "bodyFat", None)

    # --- Height conversion (ft/in) ---
    height_cm, height_str, height_unit = parse_measurement(answers.height)
    if height_cm is None:
        raise ValueError("Height not provided")
    height_m = height_cm / 100

    # --- Weight conversion ---
    weight_kg, weight_str, weight_unit = parse_weight(answers.currentWeight)
    if weight_kg is None:
        raise ValueError("Weight not provided")

    target_weight_kg, target_weight_str, target_weight_unit = parse_weight(answers.targetWeight) if answers.targetWeight else (None, "", None)
    
    # --- Optional Navy body fat ---
    neck_cm, _, _ = parse_measurement(answers.neck)
    waist_cm, _, _ = parse_measurement(answers.waist)
    hip_cm, _, _ = parse_measurement(answers.hip)

    # Calculate approximate BFP if all measurements provided
    calculated_bfp = None
    if neck_cm and waist_cm and (gender.lower() == "male" or (gender.lower() == "female" and hip_cm)):
        calculated_bfp = calculate_navy_bfp(gender, height_m, neck_cm, waist_cm, hip_cm)

    # Use user-provided BFP if available, otherwise use calculated
    body_fat_pct = float(body_fat_pct) if body_fat_pct else calculated_bfp

    # --- BMI ---
    bmi = weight_kg / (height_m ** 2)

    # --- BMR ---
    if body_fat_pct and 2 < float(body_fat_pct) < 60:
        lean_mass_kg = weight_kg * (1 - float(body_fat_pct)/100)
        bmr = 370 + 21.6 * lean_mass_kg  # Katch-McArdle
    else:
        s = 5 if gender.lower() == "male" else -161 if gender.lower() == "female" else -78
        bmr = 10 * weight_kg + 6.25 * (height_m * 100) - 5 * age + s

    # --- Activity multiplier ---
    freq_map = {
        "Never": 1.2,
        "1-2 times/week": 1.375,
        "3-4 times/week": 1.55,
        "5-6 times/week": 1.725,
        "Daily": 1.9,
    }
    activity_multiplier = freq_map.get(exercise_freq, 1.2)
    if any(x in occupation for x in ["physical", "on feet", "active job", "manual"]):
        activity_multiplier = min(1.9, activity_multiplier + 0.15)
    elif any(x in occupation for x in ["desk", "sedentary"]):
        activity_multiplier = max(1.2, activity_multiplier - 0.1)
    tdee = bmr * activity_multiplier

    # --- Goal calories ---
    goal_lower = goal.lower()
    
    goal_map = {
        "maintain weight": 1.0,
        "mild weight loss": 0.92,
        "weight loss": 0.84,
        "extreme weight loss": 0.69,
        "body recomposition": 0.94,
        "build muscle": 1.12,
        "improve strength": 1.05,
        "improve endurance": 1.05,
        "improve flexibility": 1.0,
        "general health": 1.0,
    }
    
    # Find closest match (default maintain)
    multiplier = next((v for k, v in goal_map.items() if k in goal_lower), 1.0)
    goal_calories = tdee * multiplier

    # --- Safety limits ---
    safe_min = max(bmr * 1.1, 1200 if gender.lower() != "male" else 1500)
    safe_max = tdee + 700
    goal_calories = round(max(safe_min, min(goal_calories, safe_max)))

    # --- Macros ---
    fat_pct = 0.28
    if "keto" in dietary_style:
        fat_pct = 0.35
    elif "vegan" in dietary_style:
        fat_pct = 0.25
    fat_calories = round(goal_calories * fat_pct)
    fat_g = round(fat_calories / 9)

    protein_per_kg = 2.0 if "recomposition" in goal_lower else 1.8
    protein_g = round(weight_kg * protein_per_kg)
    protein_calories = protein_g * 4
    carbs_g = round(max(0, (goal_calories - (protein_calories + fat_calories)) / 4))
    
    # ✅ ensure perfect calorie alignment
    total_calories_check = protein_calories + fat_calories + (carbs_g * 4)
    if total_calories_check != goal_calories:
        diff = goal_calories - total_calories_check
        carbs_g += round(diff / 4)

    # --- Estimated weeks to reach target ---
    if target_weight_kg:
        weight_diff = target_weight_kg - weight_kg
        weekly_calorie_change = goal_calories - tdee
        kg_per_week = weekly_calorie_change * 7 / 7700 if weekly_calorie_change != 0 else None
        estimated_weeks = round(abs(weight_diff / kg_per_week)) if kg_per_week else None
    else:
        estimated_weeks = None

    return {
        "bmi": round(bmi, 1),
        "bmr": round(bmr, 2),
        "tdee": round(tdee, 2),
        "goalCalories": int(round(goal_calories)),
        "bodyFatPercentage": body_fat_pct,
        "macros": {
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fat_g": fat_g,
            "protein_pct_of_calories": round(protein_calories / goal_calories * 100),
            "carbs_pct_of_calories": round(carbs_g * 4 / goal_calories * 100),
            "fat_pct_of_calories": round(fat_calories / goal_calories * 100),
        },
        "activityMultiplier": round(activity_multiplier, 2),
        "targetWeight": round(target_weight_kg),
        "estimatedWeeks": estimated_weeks,
        "units": {
            "weight": weight_unit,
            "height": height_unit,
        },
        "display": {
            "weight": weight_str,
            "targetWeight": target_weight_str,
            "height": height_str,
        },
    }

def call_ai_model(prompt: str, provider: str, model: str) -> str:
    """Call the specified AI model"""
    try:
        if provider == "openai" and OPENAI_API_KEY:
            response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a professional nutritionist and fitness trainer. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        elif provider == "anthropic" and ANTHROPIC_API_KEY:
            message = anthropic_client.messages.create(
                model=model if model.startswith("claude") else "claude-3-5-sonnet-20241022",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text.strip()
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported AI provider: {provider}")
    except Exception as e:
        logger.error(f"AI model call failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# ====== API Routes ======
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Health & Fitness ML Service",
        "version": "2.0.0",
        "ai_providers": {
            "openai": bool(OPENAI_API_KEY),
            "anthropic": bool(ANTHROPIC_API_KEY),
            "gemini": bool(GEMINI_API_KEY)
        }
    }

@app.post("/generate-meal-plan")
async def generate_meal_plan(request: GeneratePlansRequest):
    """
    Generate a personalized AI meal plan based on quiz results
    """
    try:
        logger.info(f"Generating meal plan for user: {request.user_id}")
        
        nutrition = calculate_nutrition_profile(request.answers)
        macros = nutrition["macros"]
        display = nutrition["display"]
        body_fat_str = f"{nutrition['bodyFatPercentage']}%" if nutrition.get("bodyFatPercentage") else "Not provided"
        
        weight = display["weight"]
        target_weight = display["targetWeight"]
        height = display["height"]

        prompt = MEAL_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            current_weight=weight,
            target_weight=target_weight,
            height=height,
            main_goal=request.answers.mainGoal,
            secondary_goals=request.answers.secondaryGoals,
            time_frame=request.answers.timeFrame,
            body_type=request.answers.bodyType,
            body_fat=body_fat_str,
            health_conditions=request.answers.healthConditions,
            health_conditions_other=request.answers.healthConditions_other,
            medications=request.answers.medications,
            lifestyle=request.answers.lifestyle,
            stress_level=request.answers.stressLevel,
            sleep_quality=request.answers.sleepQuality,
            motivation_level=request.answers.motivationLevel,
            occupation_activity=request.answers.occupation_activity,
            country=request.answers.country,
            cooking_skill=request.answers.cookingSkill,
            cooking_time=request.answers.cookingTime,
            grocery_budget=request.answers.groceryBudget,
            dietary_style=request.answers.dietaryStyle,
            disliked_foods=request.answers.dislikedFoods,
            foodAllergies=request.answers.foodAllergies,
            meals_per_day=request.answers.mealsPerDay,
            challenges=request.answers.challenges,
            exercise_frequency=request.answers.exerciseFrequency,
            preferred_exercise=request.answers.preferredExercise,
            daily_calories=nutrition["goalCalories"],
            protein=macros["protein_g"],
            carbs=macros["carbs_g"],
            fats=macros["fat_g"],
            protein_pct_of_calories=macros["protein_pct_of_calories"],
            carbs_pct_of_calories=macros["carbs_pct_of_calories"],
            fat_pct_of_calories=macros["fat_pct_of_calories"],
        )
        
        user_prompt = prompt + "\n\nDouble-check all values align with the user's calorie/macro targets before finalizing the JSON output."

        ai_response = call_ai_model(user_prompt, request.ai_provider, request.model_name)

        ai_response_clean = ai_response.strip()
        if ai_response_clean.startswith("```json"):
            ai_response_clean = ai_response_clean[7:]
        if ai_response_clean.startswith("```"):
            ai_response_clean = ai_response_clean[3:]
        if ai_response_clean.endswith("```"):
            ai_response_clean = ai_response_clean[:-3]
        ai_response_clean = ai_response_clean.strip()

        meal_plan = json.loads(ai_response_clean)

        if db_pool:
            async with db_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO ai_meal_plans
                    (user_id, quiz_result_id, plan_data, daily_calories, preferences, restrictions, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6, true)
                    """,
                    request.user_id,
                    request.quiz_result_id,
                    json.dumps(meal_plan),
                    nutrition["goalCalories"],
                    json.dumps(request.answers.preferredExercise),
                    request.answers.dietaryStyle
                )
                logger.info(f"Meal plan saved to database for user: {request.user_id}")

        return {
            "success": True,
            "meal_plan": meal_plan,
            "macros": macros,
            "message": "Meal plan generated successfully"
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {str(e)}")
        logger.error(f"AI Response (first 1000 chars): {ai_response[:1000] if 'ai_response' in locals() else 'No response'}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI-generated meal plan: {str(e)}")
    except Exception as e:
        logger.error(f"Meal plan generation error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-workout-plan")
async def generate_workout_plan(request: GeneratePlansRequest):
    """
    Generate a personalized AI workout plan based on quiz results
    """
    try:
        logger.info(f"Generating workout plan for user: {request.user_id}")

        nutrition = calculate_nutrition_profile(request.answers)
        display = nutrition["display"]
        body_fat_str = f"{nutrition['bodyFatPercentage']}%" if nutrition.get("bodyFatPercentage") else "Not provided"
        
        weight = display["weight"]
        target_weight = display["targetWeight"]
        height = display["height"]

        prompt = WORKOUT_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            current_weight=weight,
            target_weight=target_weight,
            height=height,
            main_goal=request.answers.mainGoal,
            secondary_goals=request.answers.secondaryGoals,
            time_frame=request.answers.timeFrame,
            body_type=request.answers.bodyType,
            body_fat=body_fat_str,
            health_conditions=request.answers.healthConditions,
            health_conditions_other=request.answers.healthConditions_other,
            injuries=request.answers.injuries,
            medications=request.answers.medications,
            lifestyle=request.answers.lifestyle,
            stress_level=request.answers.stressLevel,
            sleep_quality=request.answers.sleepQuality,
            motivation_level=request.answers.motivationLevel,
            occupation_activity=request.answers.occupation_activity,
            country=request.answers.country,
            challenges=request.answers.challenges,
            exercise_frequency=request.answers.exerciseFrequency,
            preferred_exercise=request.answers.preferredExercise,
            training_environment=request.answers.trainingEnvironment,
            equipment=request.answers.equipment
        )

        ai_response = call_ai_model(prompt, request.ai_provider, request.model_name)

        ai_response_clean = ai_response.strip()
        if ai_response_clean.startswith("```json"):
            ai_response_clean = ai_response_clean[7:]
        if ai_response_clean.startswith("```"):
            ai_response_clean = ai_response_clean[3:]
        if ai_response_clean.endswith("```"):
            ai_response_clean = ai_response_clean[:-3]
        ai_response_clean = ai_response_clean.strip()

        workout_plan = json.loads(ai_response_clean)

        if db_pool:
            async with db_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO ai_workout_plans
                    (user_id, quiz_result_id, plan_data, workout_type, duration_per_session, frequency_per_week, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6, true)
                    """,
                    request.user_id,
                    request.quiz_result_id,
                    json.dumps(workout_plan),
                    json.dumps(request.answers.preferredExercise),
                    request.answers.exerciseFrequency,
                    workout_plan.get('weekly_summary', {}).get('total_workout_days', 5)
                )
                logger.info(f"Workout plan saved to database for user: {request.user_id}")

        return {
            "success": True,
            "workout_plan": workout_plan,
            "message": "Workout plan generated successfully"
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {str(e)}")
        logger.error(f"AI Response (first 1000 chars): {ai_response[:1000] if 'ai_response' in locals() else 'No response'}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI-generated workout plan: {str(e)}")
    except Exception as e:
        logger.error(f"Workout plan generation error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-complete-plan")
async def generate_complete_plan(request: GeneratePlansRequest):
    """
    Generate both meal and workout plans in one call
    """
    try:
        logger.info(f"Generating complete plan for user: {request.user_id}")

        calc_result = calculate_nutrition_profile(request.answers)
        calculations = Calculations(
            bmi=calc_result["bmi"],
            bmr=calc_result["bmr"],
            tdee=calc_result["tdee"],
            bodyFatPercentage=calc_result["bodyFatPercentage"],
            macros=Macros(**calc_result["macros"]),
            goalCalories=calc_result["goalCalories"],
            goalWeight=calc_result["targetWeight"] or 0.0,
        )

        meal_result = await generate_meal_plan(request)
        workout_result = await generate_workout_plan(request)
        
        if db_pool:
            async with db_pool.acquire() as conn:
                await conn.execute(
                    """
                    UPDATE quiz_results
                    SET calculations = $1
                    WHERE id = $2
                    """,
                    json.dumps(calculations.model_dump()),
                    request.quiz_result_id,
                )
                logger.info(f"Updated calculations for quiz_result_id {request.quiz_result_id}")

        return {
            "success": True,
            "meal_plan": meal_result["meal_plan"],
            "workout_plan": workout_result["workout_plan"],
            "macros": meal_result["macros"],
            "message": "Complete health plan generated successfully"
        }
    except Exception as e:
        logger.error(f"Complete plan generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
