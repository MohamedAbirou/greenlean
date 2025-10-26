"""
Refactored FastAPI application for AI Health & Fitness ML Service.
Clean, modular architecture with comprehensive error handling and logging.
"""

import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.logging_config import logger, log_api_request, log_api_response, log_error
from models.quiz import GeneratePlansRequest, Calculations, Macros
from services.ai_service import ai_service
from services.database import db_service
from utils.calculations import calculate_nutrition_profile
from prompts.meal_plan import MEAL_PLAN_PROMPT
from prompts.workout_plan import WORKOUT_PLAN_PROMPT


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    # Startup
    logger.info(f"Starting {settings.APP_TITLE} v{settings.APP_VERSION}")

    try:
        await db_service.initialize()
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}. Continuing without database.")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    await db_service.close()
    logger.info("Application shutdown complete")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.

    Returns:
        Service status and available AI providers
    """
    return {
        "status": "healthy",
        "service": settings.APP_TITLE,
        "version": settings.APP_VERSION,
        "ai_providers": {
            "openai": settings.has_openai,
            "anthropic": settings.has_anthropic,
            "gemini": settings.has_gemini,
            "llama": settings.has_llama,
        },
        "database": db_service.pool is not None
    }


@app.post("/generate-meal-plan")
async def generate_meal_plan(request: GeneratePlansRequest) -> Dict[str, Any]:
    """
    Generate a personalized AI meal plan based on quiz results.

    Args:
        request: GeneratePlansRequest with user data and preferences

    Returns:
        Generated meal plan with nutritional information

    Raises:
        HTTPException: If generation fails
    """
    start_time = time.time()
    log_api_request(
        "/generate-meal-plan",
        request.user_id,
        request.ai_provider,
        request.model_name
    )

    try:
        # Calculate nutrition profile
        nutrition = calculate_nutrition_profile(request.answers)
        macros = nutrition["macros"]
        display = nutrition["display"]

        # Format body fat percentage
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )

        # Format prompt with user data
        prompt = MEAL_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            current_weight=display["weight"],
            target_weight=display["targetWeight"],
            height=display["height"],
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

        # Add quality reminder
        full_prompt = (
            prompt + "\n\nDouble-check all values align with the user's "
            "calorie/macro targets before finalizing the JSON output."
        )

        # Generate meal plan using AI service
        meal_plan = ai_service.generate_plan(
            full_prompt,
            request.ai_provider,
            request.model_name,
            request.user_id
        )

        # Save to database
        await db_service.save_meal_plan(
            request.user_id,
            request.quiz_result_id,
            meal_plan,
            nutrition["goalCalories"],
            request.answers.preferredExercise,
            request.answers.dietaryStyle
        )

        # Log success
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-meal-plan", request.user_id, True, duration_ms)

        return {
            "success": True,
            "meal_plan": meal_plan,
            "macros": macros,
            "message": "Meal plan generated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-meal-plan", request.user_id, False, duration_ms)
        log_error(e, "Meal plan generation", request.user_id)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-workout-plan")
async def generate_workout_plan(request: GeneratePlansRequest) -> Dict[str, Any]:
    """
    Generate a personalized AI workout plan based on quiz results.

    Args:
        request: GeneratePlansRequest with user data and preferences

    Returns:
        Generated workout plan

    Raises:
        HTTPException: If generation fails
    """
    start_time = time.time()
    log_api_request(
        "/generate-workout-plan",
        request.user_id,
        request.ai_provider,
        request.model_name
    )

    try:
        # Calculate nutrition profile for body metrics
        nutrition = calculate_nutrition_profile(request.answers)
        display = nutrition["display"]

        # Format body fat percentage
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )

        # Format prompt with user data
        prompt = WORKOUT_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            current_weight=display["weight"],
            target_weight=display["targetWeight"],
            height=display["height"],
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

        # Generate workout plan using AI service
        workout_plan = ai_service.generate_plan(
            prompt,
            request.ai_provider,
            request.model_name,
            request.user_id
        )

        # Save to database
        await db_service.save_workout_plan(
            request.user_id,
            request.quiz_result_id,
            workout_plan,
            request.answers.preferredExercise,
            request.answers.exerciseFrequency,
            workout_plan.get('weekly_summary', {}).get('total_workout_days', 5)
        )

        # Log success
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-workout-plan", request.user_id, True, duration_ms)

        return {
            "success": True,
            "workout_plan": workout_plan,
            "message": "Workout plan generated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-workout-plan", request.user_id, False, duration_ms)
        log_error(e, "Workout plan generation", request.user_id)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-complete-plan")
async def generate_complete_plan(request: GeneratePlansRequest) -> Dict[str, Any]:
    """
    Generate both meal and workout plans in one call.

    Args:
        request: GeneratePlansRequest with user data and preferences

    Returns:
        Combined meal and workout plans with calculations

    Raises:
        HTTPException: If generation fails
    """
    start_time = time.time()
    log_api_request(
        "/generate-complete-plan",
        request.user_id,
        request.ai_provider,
        request.model_name
    )

    try:
        # Calculate nutrition profile
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

        # Generate both plans
        meal_result = await generate_meal_plan(request)
        workout_result = await generate_workout_plan(request)

        # Update quiz results with calculations
        await db_service.update_quiz_calculations(
            request.quiz_result_id,
            calculations.model_dump()
        )

        # Log success
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-complete-plan", request.user_id, True, duration_ms)

        return {
            "success": True,
            "meal_plan": meal_result["meal_plan"],
            "workout_plan": workout_result["workout_plan"],
            "macros": meal_result["macros"],
            "message": "Complete health plan generated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-complete-plan", request.user_id, False, duration_ms)
        log_error(e, "Complete plan generation", request.user_id)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
