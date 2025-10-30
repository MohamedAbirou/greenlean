"""
FastAPI application with async background plan generation.
"""

import asyncio
import time
import os
import stripe
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Header
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.logging_config import logger, log_api_request, log_api_response, log_error
from prompts.json_formats.meal_plan_format import MEAL_PLAN_JSON_FORMAT
from prompts.json_formats.workout_plan_format import WORKOUT_PLAN_JSON_FORMAT
from models.quiz import GeneratePlansRequest, Calculations, Macros
from services.ai_service import ai_service
from services.database import db_service
from utils.calculations import calculate_nutrition_profile
from prompts.meal_plan import MEAL_PLAN_PROMPT
from prompts.workout_plan import WORKOUT_PLAN_PROMPT


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    logger.info(f"Starting {settings.APP_TITLE} v{settings.APP_VERSION}")
    
    try:
        await db_service.initialize()
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}. Continuing without database.")
    
    yield
    
    logger.info("Shutting down application...")
    await db_service.close()
    logger.info("Application shutdown complete")

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
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


async def _generate_meal_plan_background(
    user_id: str,
    quiz_result_id: str,
    request: GeneratePlansRequest,
    nutrition: Dict[str, Any]
):
    """Background task to generate meal plan - FIXED"""
    try:
        logger.info(f"Starting background meal plan generation for user {user_id}")
        
        macros = nutrition["macros"]
        display = nutrition["display"]
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )
        
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
            MEAL_PLAN_JSON_FORMAT=MEAL_PLAN_JSON_FORMAT
        )
        
        full_prompt = (
            prompt + "\n\nDouble-check all values align with the user's "
            "calorie/macro targets before finalizing the JSON output."
        )
        
        meal_plan = await ai_service.generate_plan(
            full_prompt,
            request.ai_provider,
            request.model_name,
            user_id
        )
        
        await db_service.save_meal_plan(
            user_id,
            quiz_result_id,
            meal_plan,
            nutrition["goalCalories"],
            request.answers.preferredExercise,
            request.answers.dietaryStyle
        )
        
        await db_service.update_plan_status(user_id, "meal", "completed")
        logger.info(f"Meal plan generated successfully for user {user_id}")
        
    except Exception as e:
        log_error(e, "Background meal plan generation", user_id)
        await db_service.update_plan_status(user_id, "meal", "failed", str(e))

async def _generate_workout_plan_background(
    user_id: str,
    quiz_result_id: str,
    request: GeneratePlansRequest,
    nutrition: Dict[str, Any]
):
    """Background task to generate workout plan - FIXED"""
    try:
        logger.info(f"Starting background workout plan generation for user {user_id}")
        
        display = nutrition["display"]
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )
        
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
            equipment=request.answers.equipment,
            WORKOUT_PLAN_JSON_FORMAT=WORKOUT_PLAN_JSON_FORMAT
        )
        
        workout_plan = await ai_service.generate_plan(
            prompt,
            request.ai_provider,
            request.model_name,
            user_id
        )
        
        await db_service.save_workout_plan(
            user_id,
            quiz_result_id,
            workout_plan,
            request.answers.preferredExercise,
            request.answers.exerciseFrequency,
            5
        )
        
        await db_service.update_plan_status(user_id, "workout", "completed")
        logger.info(f"Workout plan generated successfully for user {user_id}")
        
    except Exception as e:
        log_error(e, "Background workout plan generation", user_id)
        await db_service.update_plan_status(user_id, "workout", "failed", str(e))

@app.post("/generate-plans")
async def generate_plans(
    request: GeneratePlansRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Generate plans with instant response and background AI generation.
    
    Returns calculations immediately and kicks off background tasks for AI plans.
    """
    start_time = time.time()
    log_api_request(
        "/generate-plans",
        request.user_id,
        request.ai_provider,
        request.model_name
    )
    
    try:
        # Calculate nutrition profile immediately
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
        
        # Update quiz results with calculations FIRST
        await db_service.update_quiz_calculations(
            request.quiz_result_id,
            calculations.model_dump()
        )
        
        # Initialize plan status as generating
        await db_service.initialize_plan_status(
            request.user_id,
            request.quiz_result_id
        )
        
        # Schedule background tasks for AI generation
        # background_tasks.add_task(
        #     _generate_meal_plan_background,
        #     request.user_id,
        #     request.quiz_result_id,
        #     request,
        #     calc_result
        # )
        
        # background_tasks.add_task(
        #     _generate_workout_plan_background,
        #     request.user_id,
        #     request.quiz_result_id,
        #     request,
        #     calc_result
        # )

        # 3️⃣ Fire both AI generation tasks concurrently
        asyncio.create_task(
            _generate_meal_plan_background(request.user_id, request.quiz_result_id, request, calc_result)
        )
        asyncio.create_task(
            _generate_workout_plan_background(request.user_id, request.quiz_result_id, request, calc_result)
        )
        
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-plans", request.user_id, True, duration_ms)
        
        return {
            "success": True,
            "calculations": calculations.model_dump(),
            "macros": calculations.macros.model_dump(),
            "meal_plan_status": "generating",
            "workout_plan_status": "generating",
            "message": "Calculations complete. Plans are being generated in the background."
        }
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-plans", request.user_id, False, duration_ms)
        log_error(e, "Plan generation initialization", request.user_id)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plan-status/{user_id}")
async def get_plan_status(user_id: str) -> Dict[str, Any]:
    """Check status of plan generation for a user"""
    try:
        status = await db_service.get_plan_status(user_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="No plan generation found for user")
        
        return {
            "success": True,
            "meal_plan_status": status["meal_plan_status"],
            "workout_plan_status": status["workout_plan_status"],
            "meal_plan_error": status.get("meal_plan_error"),
            "workout_plan_error": status.get("workout_plan_error")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Plan status check", user_id)
        raise HTTPException(status_code=500, detail=str(e))

# STRIPE
@app.post("/api/stripe/create-checkout-session")
async def create_checkout_session(request: Request):
    """Create a checkout session for a user"""

    try:
        data = await request.json()
        user_id = data["user_id"]  # from auth/session/cookie
        # success_url = data.get("success_url", "https://greenlean.vercel.app/account?stripe=success")
        # cancel_url = data.get("cancel_url", "https://greenlean.vercel.app/account?stripe=cancel")
        success_url = data.get("success_url", "http://localhost:5173/account?stripe=success")
        cancel_url = data.get("cancel_url", "http://localhost:5173/account?stripe=cancel")
        # You may hardcode your pro plan price_id or product for now:
        price_id = os.getenv("STRIPE_PRICE_ID")

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=user_id,
            metadata={"user_id": user_id}
        )

        log_api_response("/generate-plans", data["user_id"], True)

        return {"session_url": checkout_session.url}
    except Exception as e:
        log_api_response("/api/stripe/create-checkout-session", data["user_id"], False)
        log_error(e, "Create checkout session", data["user_id"])
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Stripe webhook endpoint"""

    payload = await request.body()
    sig_header = stripe_signature or request.headers.get("Stripe-Signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    event = None
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"error": str(e)}

    # Subscription created or upgraded
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["client_reference_id"]
        customer_id = session["customer"]
        # Update user profile plan and stripe_customer_id
        await db_service.set_user_plan(user_id, "pro", customer_id)
    elif event["type"] == "customer.subscription.deleted":
        # Downgrade user to free
        user_id = event["data"]["object"]["client_reference_id"] or await db_service.lookup_user_by_stripe(event["data"]["object"]["customer"])
        await db_service.set_user_plan(user_id, "free")
    # Add more Stripe event types as needed

    return {"status": "success"}


# ANALYTICS ENDPOINTS
@app.get("/api/admin/saas-metrics")
async def get_saas_metrics():
    # MRR and revenue
    subs = stripe.Subscription.list(status="all", limit=100)  # adjust limit as needed
    invoices = stripe.Invoice.list(limit=100)  # for all-time revenue

    active_subs = [s for s in subs.auto_paging_iter() if s.status in ("active", "trialing", "past_due")]
    canceled_subs = [s for s in subs.auto_paging_iter() if s.status == "canceled"]

    mrr = sum(
        item["plan"]["amount"] for s in active_subs for item in s["items"]["data"]
        if item["plan"]["interval"] == "month"
    ) / 100  # in dollars

    all_earnings = sum(i.amount_paid for i in invoices.auto_paging_iter()) / 100

    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_30 = now - timedelta(days=30)

    earnings_this_month = sum(
        i.amount_paid for i in invoices.auto_paging_iter() if datetime.fromtimestamp(i.created, tz=timezone.utc) >= start_of_month
    ) / 100
    earnings_last_30 = sum(
        i.amount_paid for i in invoices.auto_paging_iter() if datetime.fromtimestamp(i.created, tz=timezone.utc) >= last_30
    ) / 100

    # Subscribers by month (for past 12 months, for chart)
    by_month = {}
    for s in subs.auto_paging_iter():
        dt = datetime.fromtimestamp(s.created, tz=timezone.utc)
        label = dt.strftime("%Y-%m")
        by_month[label] = by_month.get(label, 0) + 1

    # New this month, churn this month
    new_this_month = sum(
        1 for s in subs.auto_paging_iter()
        if datetime.fromtimestamp(s.created, tz=timezone.utc) >= start_of_month and s.status in ("active", "trialing")
    )
    churned_this_month = sum(
        1 for s in subs.auto_paging_iter()
        if s.canceled_at and datetime.fromtimestamp(s.canceled_at, tz=timezone.utc) >= start_of_month
    )

    recent_canceled = [
        {
            "customer_email": s.customer_email,
            "canceled_at": s.canceled_at,
            "plan": s["plan"]["nickname"] if s["plan"] else "",
        }
        for s in canceled_subs
    ][:20]

    return {
        "mrr": mrr,
        "totalEarnings": all_earnings,
        "earningsThisMonth": earnings_this_month,
        "earningsLast30Days": earnings_last_30,
        "activeSubscribers": len(active_subs),
        "totalSubscribers": len(list(subs.auto_paging_iter())),
        "newSubsThisMonth": new_this_month,
        "churnedThisMonth": churned_this_month,
        "subscribersByMonth": by_month,
        "recentCanceled": recent_canceled
    }

@app.get("/api/admin/subscribers")
async def get_all_subscribers(
    status: str = None,
    plan_id: str = None,
    created_after: int = None,    # unix timestamp
    created_before: int = None    # unix timestamp
):
    """
    Returns all subscribers, with full plan/item info and filtering:
    - status: Filter subscriptions by status
    - plan_id: Only users on a given Stripe price_id
    - created_after, created_before: Filter by creation time (unix timestamp)
    """
    subs = stripe.Subscription.list(
        status="all",
        limit=100,
        expand=["data.customer", "data.items.data.price"]
    )

    user_data = []
    for s in subs.auto_paging_iter():
        # Apply status filter
        if status and s.get("status") != status:
            continue
        # Apply plan and date filters (check all items)
        if plan_id or created_after or created_before:
            match = False
            for item in s.get("items", {}).get("data", []):
                price = item.get("price", {})
                if plan_id and price.get("id") == plan_id:
                    match = True
                if created_after and s.get("created") < int(created_after):
                    continue
                if created_before and s.get("created") > int(created_before):
                    continue
            if plan_id and not match:
                continue

        # Customer email
        customer_email = None
        if isinstance(s.customer, dict):
            customer_email = s.customer.get("email")
        elif hasattr(s.customer, "email"):
            customer_email = s.customer.email

        # Gather all plan/item details
        plans = []
        for item in s.get("items", {}).get("data", []):
            price = item.get("price", {})
            plans.append({
                "price_id": price.get("id"),
                "nickname": price.get("nickname"),
                "amount": price.get("unit_amount"),
                "currency": price.get("currency"),
                "interval": price.get("recurring", {}).get("interval"),
                "quantity": item.get("quantity"),
            })

        user_entry = {
            "customer_id": s.get("customer"),
            "subscription_id": s.get("id"),
            "email": customer_email,
            "status": s.get("status"),
            "created": s.get("created"),
            "current_period_end": s.get("current_period_end"),
            "canceled_at": s.get("canceled_at"),
            "is_active": s.get("status") in ("active", "trialing", "past_due"),
            "plans": plans,
        }
        user_data.append(user_entry)

    return {"subscribers": user_data}


# Keep legacy endpoints for backward compatibility
@app.post("/generate-meal-plan")
async def generate_meal_plan(request: GeneratePlansRequest) -> Dict[str, Any]:
    """Legacy endpoint - generates meal plan synchronously"""
    start_time = time.time()
    log_api_request("/generate-meal-plan", request.user_id, request.ai_provider, request.model_name)
    
    try:
        nutrition = calculate_nutrition_profile(request.answers)
        macros = nutrition["macros"]
        display = nutrition["display"]
        
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )
        
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
            MEAL_PLAN_JSON_FORMAT=MEAL_PLAN_JSON_FORMAT
        )
        
        full_prompt = prompt + "\n\nDouble-check all values align with the user's calorie/macro targets before finalizing the JSON output."
        
        meal_plan = await ai_service.generate_plan(full_prompt, request.ai_provider, request.model_name, request.user_id)
        
        await db_service.save_meal_plan(
            request.user_id,
            request.quiz_result_id,
            meal_plan,
            nutrition["goalCalories"],
            request.answers.preferredExercise,
            request.answers.dietaryStyle
        )
        
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
    """Legacy endpoint - generates workout plan synchronously"""
    start_time = time.time()
    log_api_request("/generate-workout-plan", request.user_id, request.ai_provider, request.model_name)
    
    try:
        nutrition = calculate_nutrition_profile(request.answers)
        display = nutrition["display"]
        
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )
        
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
            equipment=request.answers.equipment,
            WORKOUT_PLAN_JSON_FORMAT=WORKOUT_PLAN_JSON_FORMAT
        )
        
        workout_plan = await ai_service.generate_plan(prompt, request.ai_provider, request.model_name, request.user_id)
        
        await db_service.save_workout_plan(
            request.user_id,
            request.quiz_result_id,
            workout_plan,
            request.answers.preferredExercise,
            request.answers.exerciseFrequency,
            workout_plan.get('weekly_summary', {}).get('total_workout_days', 5)
        )
        
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
    """Legacy endpoint - redirects to new async endpoint"""
    background_tasks = BackgroundTasks()
    return await generate_plans(request, background_tasks)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )