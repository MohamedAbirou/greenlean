from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel
import os
import logging
import asyncpg
import anthropic
import google.generativeai as genai
from llamaapi import LlamaAPI
from openai import OpenAI
from dotenv import load_dotenv
import json

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
                                            max_size=10,
                                            ssl=True
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
You are a professional nutritionist creating a personalized daily meal plan.

User Profile:
- Age: {age}, Gender: {gender}
- Current Weight: {weight}kg, Height: {height}cm
- Goal: {goal}
- Activity Level: {activity_level}
- Dietary Preferences: {diet_type}
- Cuisine Preference: {cuisine}
- Restrictions: {restrictions}
- Meals per day: {meals_per_day}

Daily Nutrition Targets:
- Calories: {daily_calories} kcal
- Protein: {protein}g
- Carbs: {carbs}g
- Fats: {fats}g

Create a detailed daily meal plan in JSON format with this exact structure:
{{
  "meals": [
    {{
      "meal_type": "breakfast",
      "meal_name": "Protein-Packed Breakfast Bowl",
      "prep_time_minutes": 15,
      "foods": [
        {{
          "name": "Oatmeal",
          "portion": "1 cup cooked",
          "grams": 240,
          "calories": 150,
          "protein": 5,
          "carbs": 27,
          "fats": 3
        }}
      ],
      "recipe": "Step-by-step cooking instructions",
      "total_calories": 400,
      "total_protein": 25,
      "total_carbs": 45,
      "total_fats": 12
    }}
  ],
  "daily_totals": {{
    "calories": {daily_calories},
    "protein": {protein},
    "carbs": {carbs},
    "fats": {fats}
  }},
  "hydration_recommendation": "8-10 glasses of water",
  "tips": ["Meal prep tip 1", "Nutrition tip 2"]
}}

IMPORTANT:
1. Return ONLY valid JSON, no markdown or extra text
2. Match the calorie and macro targets closely (within 5%)
3. Include appropriate portions and realistic recipes
4. Consider the user's cuisine preference for meal selection
5. Respect all dietary restrictions
6. Distribute calories appropriately across meals
"""

WORKOUT_PLAN_PROMPT = """
You are a certified fitness trainer creating a personalized weekly workout plan.

User Profile:
- Age: {age}, Gender: {gender}
- Current Weight: {weight}kg, Height: {height}cm
- Fitness Goal: {goal}
- Activity Level: {activity_level}
- Exercise Preference: {exercise_preference}
- Time Available: {time_available}
- Health Conditions: {health_conditions}

Create a detailed 7-day workout plan in JSON format with this exact structure:
{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout_type": "Upper Body Strength",
      "duration_minutes": 45,
      "exercises": [
        {{
          "name": "Push-ups",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "instructions": "Keep your core tight and body in a straight line",
          "muscle_groups": ["chest", "triceps", "shoulders"],
          "difficulty": "beginner"
        }}
      ],
      "warmup": "5 minutes light cardio + dynamic stretches",
      "cooldown": "5 minutes stretching",
      "estimated_calories_burned": 250
    }}
  ],
  "weekly_summary": {{
    "total_workout_days": 5,
    "rest_days": 2,
    "total_time_minutes": 225,
    "estimated_weekly_calories_burned": 1200
  }},
  "tips": ["Progressive overload tip", "Recovery tip"],
  "notes": "Adjust weights/reps based on your fitness level"
}}

IMPORTANT:
1. Return ONLY valid JSON, no markdown or extra text
2. Include appropriate exercises for the user's fitness level
3. Balance workout types (cardio, strength, flexibility, rest)
4. Consider health conditions and limitations
5. Provide clear form instructions
6. Include warm-up and cool-down for each session
"""

# ====== Input Models ======
class QuizAnswers(BaseModel):
    age: int
    gender: str
    weight: float
    height: float
    goal_weight: float
    activity_level: str
    diet_type: str
    goal: str
    meals_per_day: str
    cuisine: str
    health_conditions: str
    exercise_time: str
    exercise_preference: str

class Calculations(BaseModel):
    bmi: float
    bmr: float
    tdee: float
    goalCalories: int
    goalWeight: float

class GeneratePlansRequest(BaseModel):
    user_id: str
    quiz_result_id: str
    answers: QuizAnswers
    calculations: Calculations
    ai_provider: str = "openai"
    model_name: str = "gpt-4o-mini"

# ====== Helper Functions ======
def calculate_macros(daily_calories: int, goal: str) -> dict:
    """Calculate macro distribution based on goal"""
    if "muscle" in goal.lower():
        protein_pct, carbs_pct, fats_pct = 0.30, 0.40, 0.30
    elif "fat" in goal.lower() or "lose" in goal.lower():
        protein_pct, carbs_pct, fats_pct = 0.35, 0.35, 0.30
    else:
        protein_pct, carbs_pct, fats_pct = 0.25, 0.45, 0.30

    return {
        "protein": int((daily_calories * protein_pct) / 4),
        "carbs": int((daily_calories * carbs_pct) / 4),
        "fats": int((daily_calories * fats_pct) / 9)
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

        macros = calculate_macros(request.calculations.goalCalories, request.answers.goal)

        prompt = MEAL_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            weight=request.answers.weight,
            height=request.answers.height,
            goal=request.answers.goal,
            activity_level=request.answers.activity_level,
            diet_type=request.answers.diet_type,
            cuisine=request.answers.cuisine,
            restrictions=request.answers.diet_type,
            meals_per_day=request.answers.meals_per_day,
            daily_calories=request.calculations.goalCalories,
            protein=macros["protein"],
            carbs=macros["carbs"],
            fats=macros["fats"]
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
                    request.calculations.goalCalories,
                    request.answers.cuisine,
                    request.answers.diet_type
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

        prompt = WORKOUT_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            weight=request.answers.weight,
            height=request.answers.height,
            goal=request.answers.goal,
            activity_level=request.answers.activity_level,
            exercise_preference=request.answers.exercise_preference,
            time_available=request.answers.exercise_time,
            health_conditions=request.answers.health_conditions
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
                    request.answers.exercise_preference,
                    request.answers.exercise_time,
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

        meal_result = await generate_meal_plan(request)
        workout_result = await generate_workout_plan(request)

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
