"""
FastAPI application with async background plan generation.
"""

import asyncio
import time
import os
import stripe
from contextlib import asynccontextmanager
from typing import Dict, Any
from datetime import datetime, timedelta, timezone

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
        success_url = data.get("success_url", "https://greenlean.vercel.app/profile/settings?stripe=success")
        cancel_url = data.get("cancel_url", "https://greenlean.vercel.app/profile/settings?stripe=cancel")
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

@app.api_route("/api/stripe/webhook", methods=["POST", "GET", "HEAD"])
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Stripe webhook endpoint"""
    
    if request.method != "POST":
        return {"status": "ok"}  # respond safely to HEAD/GET checks

    payload = await request.body()
    sig_header = stripe_signature or request.headers.get("Stripe-Signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    event = None
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"error": str(e)}

    logger.info(f"Received Stripe webhook: {event['type']}")
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
    subs_iterator = stripe.Subscription.list(
        status="all",
        limit=100,
        expand=["data.items.data.price", "data.latest_invoice.customer"]
    ).auto_paging_iter()

    invoices_iterator = stripe.Invoice.list(limit=100).auto_paging_iter()

    product_cache = {}

    def get_product_name(price_id):
        if price_id not in product_cache:
            try:
                price_with_product = stripe.Price.retrieve(price_id, expand=["product"])
                product_cache[price_id] = price_with_product.product.name
            except stripe.error.StripeError:
                product_cache[price_id] = "Unknown Plan"
        return product_cache[price_id]

    all_subs = list(subs_iterator)
    all_invoices = list(invoices_iterator)

    active_subs = [s for s in all_subs if s.status in ("active", "trialing", "past_due")]
    canceled_subs = [s for s in all_subs if s.status == "canceled"]

    # --- MRR
    mrr = sum(
        item.price.unit_amount for s in active_subs for item in dict(s.items())['items'].data
        if item.price.recurring and item.price.recurring.interval == "month"
    ) / 100

    # --- Earnings
    all_earnings = sum(i.amount_paid for i in all_invoices) / 100
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_30 = now - timedelta(days=30)

    earnings_this_month = sum(
        i.amount_paid for i in all_invoices if datetime.fromtimestamp(i.created, tz=timezone.utc) >= start_of_month
    ) / 100

    earnings_last_30 = sum(
        i.amount_paid for i in all_invoices if datetime.fromtimestamp(i.created, tz=timezone.utc) >= last_30
    ) / 100

    # --- Subscribers by month
    by_month = {}
    for s in all_subs:
        dt = datetime.fromtimestamp(s.created, tz=timezone.utc)
        label = dt.strftime("%Y-%m")
        by_month[label] = by_month.get(label, 0) + 1

    # --- New / churned
    new_this_month = sum(
        1 for s in all_subs
        if datetime.fromtimestamp(s.created, tz=timezone.utc) >= start_of_month and s.status in ("active", "trialing")
    )
    new_last_30 = sum(
        1 for s in all_subs
        if datetime.fromtimestamp(s.created, tz=timezone.utc) >= last_30 and s.status in ("active", "trialing")
    )
    churned_this_month = sum(
        1 for s in all_subs
        if s.canceled_at and datetime.fromtimestamp(s.canceled_at, tz=timezone.utc) >= start_of_month
    )

    # --- Conversion rates
    total_created = len(all_subs)
    created_last_30 = sum(1 for s in all_subs if datetime.fromtimestamp(s.created, tz=timezone.utc) >= last_30)

    conversion_rate = (new_this_month / total_created * 100) if total_created > 0 else 0
    conversion_rate_last_30 = (new_last_30 / created_last_30 * 100) if created_last_30 > 0 else 0

    # --- Recent canceled
    recent_canceled = []
    for s in canceled_subs[:20]:
        items_list = dict(s.items())['items'].data
        plan_name = get_product_name(items_list[0].price.id) if items_list else "Unknown Plan"
        customer_email = (
            s.latest_invoice.customer.email
            if s.latest_invoice and s.latest_invoice.customer and s.latest_invoice.customer.email
            else ""
        )
        recent_canceled.append({
            "customer_email": customer_email,
            "canceled_at": s.canceled_at,
            "plan": plan_name,
        })

    # --- Compute LTV for current period (already done)
    if len(active_subs) > 0:
        arpu = mrr / len(active_subs)
    else:
        arpu = 0

    if (len(active_subs) + churned_this_month) > 0:
        churn_rate = churned_this_month / (len(active_subs) + churned_this_month)
    else:
        churn_rate = 0

    if churn_rate > 0:
        ltv = arpu / churn_rate
    else:
        ltv = arpu * 12  # fallback assumption

    # --- Estimate previous month's LTV
    one_month_ago = now - timedelta(days=30)
    subs_last_month = [s for s in all_subs if datetime.fromtimestamp(s.created, tz=timezone.utc) < one_month_ago]
    active_last_month = [s for s in subs_last_month if s.status in ("active", "trialing", "past_due")]
    churned_last_month = [
        s for s in subs_last_month
        if s.canceled_at and datetime.fromtimestamp(s.canceled_at, tz=timezone.utc) >= (one_month_ago - timedelta(days=30))
    ]

    mrr_last_month = sum(
        item.price.unit_amount for s in active_last_month for item in dict(s.items())['items'].data
        if item.price.recurring and item.price.recurring.interval == "month"
    ) / 100

    if len(active_last_month) > 0:
        arpu_last_month = mrr_last_month / len(active_last_month)
    else:
        arpu_last_month = 0

    if (len(active_last_month) + len(churned_last_month)) > 0:
        churn_rate_last_month = len(churned_last_month) / (len(active_last_month) + len(churned_last_month))
    else:
        churn_rate_last_month = 0

    if churn_rate_last_month > 0:
        ltv_last_month = arpu_last_month / churn_rate_last_month
    else:
        ltv_last_month = arpu_last_month * 12

    # --- LTV Growth
    if ltv_last_month > 0:
        ltv_growth_percent = ((ltv - ltv_last_month) / ltv_last_month) * 100
    else:
        ltv_growth_percent = 0


    return {
        "mrr": mrr,
        "totalEarnings": all_earnings,
        "earningsThisMonth": earnings_this_month,
        "earningsLast30Days": earnings_last_30,
        "activeSubscribers": len(active_subs),
        "totalSubscribers": len(all_subs),
        "newSubsThisMonth": new_this_month,
        "churnedThisMonth": churned_this_month,
        "subscribersByMonth": by_month,
        "recentCanceled": recent_canceled,
        "conversionRate": conversion_rate,
        "conversionRateLast30Days": conversion_rate_last_30,
        "arpu": round(arpu, 2),
        "churnRate": round(churn_rate * 100, 2),
        "ltv": round(ltv, 2),
        "ltvGrowth": round(ltv_growth_percent, 2),
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
    subs_iterator = stripe.Subscription.list(
        status="all",
        limit=100,
        expand=["data.customer", "data.items.data.price"]
    ).auto_paging_iter()

    product_cache = {}
    def get_product_name(price_id):
        if price_id not in product_cache:
            try:
                # Retrieve the price and expand the product in a separate call
                price_with_product = stripe.Price.retrieve(price_id, expand=["product"])
                product_cache[price_id] = price_with_product.product.name
            except stripe.error.StripeError as e:
                print(f"Error retrieving product for price {price_id}: {e}")
                product_cache[price_id] = "Unknown Plan"
        return product_cache[price_id]

    user_data = []

    for s in subs_iterator:
        # --- filters ---
        if status and getattr(s, "status", None) != status:
            continue

        try:
            items_list = dict(s.items())["items"].data
        except Exception:
            items_list = []

        # --- Plan/date filtering ---
        if plan_id or created_after or created_before:
            match = False
            for item in items_list:
                price = getattr(item, "price", None)
                if plan_id and price and getattr(price, "id", None) == plan_id:
                    match = True
                if created_after and getattr(s, "created", 0) < int(created_after):
                    continue
                if created_before and getattr(s, "created", 0) > int(created_before):
                    continue
            if plan_id and not match:
                continue

        # --- Customer email ---
        customer_email = ""
        if hasattr(s.customer, "email"):
            customer_email = s.customer.email
        elif isinstance(s.customer, dict):
            customer_email = s.customer.get("email", "")

        # --- Plan/item details ---
        plans = []
        for item in items_list:
            price = getattr(item, "price", None)
            if not price:
                continue
            plans.append({
                "price_id": getattr(price, "id", None),
                "product_name": get_product_name(getattr(price, "id", None)),
                "product_id": getattr(price.product, "id", None) if hasattr(price, "product") else None,
                "nickname": getattr(price, "nickname", None),
                "amount": getattr(price, "unit_amount", None),
                "currency": getattr(price, "currency", None),
                "interval": getattr(getattr(price, "recurring", None), "interval", None)
                if getattr(price, "recurring", None) else None,
                "quantity": getattr(item, "quantity", None),
            })

        # --- Safely extract subscription info ---
        user_entry = {
            "customer_id": getattr(s.customer, "id", s.customer if isinstance(s.customer, str) else None),
            "subscription_id": getattr(s, "id", None),
            "email": customer_email,
            "status": getattr(s, "status", None),
            "created": getattr(s, "created", None),
            "current_period_end": getattr(s, "current_period_end", None),
            "canceled_at": getattr(s, "canceled_at", None),
            "is_active": getattr(s, "status", None) in ("active", "trialing", "past_due"),
            "plans": plans,
        }

        user_data.append(user_entry)

    return {"subscribers": user_data}

@app.post("/api/admin/stripe/cancel-subscription")
async def cancel_subscription(request: Request):
    """Cancel a subscription"""
    try:
        data = await request.json()
        subscription_id = data["subscription_id"]
        user_id = data["user_id"]
        
        # Cancel the subscription at period end (or immediately)
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True  # Change to False for immediate cancellation
        )
        
        # Update user plan to free
        await db_service.set_user_plan(user_id, "free")

        return {"success": True, "subscription": subscription}
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e} for user {data['user_id']}")
        return {"success": False, "error": str(e)}

@app.get("/api/stripe/invoices")
async def get_invoices(customer_id: str):
    """Get all invoices for a customer"""
    try:
        if not customer_id:
            return {"success": False, "error": "Missing customer_id"}

        invoices = stripe.Invoice.list(
            customer=customer_id,
            limit=100
        )

        formatted_invoices = []
        for invoice in invoices.data:
            formatted_invoices.append({
                "id": invoice.id,
                "amount_due": invoice.amount_due,
                "amount_paid": invoice.amount_paid,
                "created": invoice.created,
                "currency": invoice.currency,
                "hosted_invoice_url": invoice.hosted_invoice_url,
                "invoice_pdf": invoice.invoice_pdf,
                "status": invoice.status,
                "period_start": invoice.period_start,
                "period_end": invoice.period_end,
            })

        return {
            "success": True,
            "invoices": formatted_invoices
        }
    except Exception as e:
        logger.error(f"Error fetching invoices: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/admin/stripe/resend-invoice")
async def resend_invoice(request: Request):
    """Resend or share an invoice depending on its type."""
    try:
        data = await request.json()
        invoice_id = data.get("invoice_id")
        if not invoice_id:
            return {"success": False, "error": "Missing invoice_id"}

        # Resolve to latest invoice if subscription or customer ID provided
        if invoice_id.startswith("sub_"):
            invoices = stripe.Invoice.list(subscription=invoice_id, limit=1)
        elif invoice_id.startswith("cus_"):
            invoices = stripe.Invoice.list(customer=invoice_id, limit=1)
        else:
            invoices = stripe.Invoice.list(limit=1, starting_after=invoice_id)

        if not invoices.data:
            return {"success": False, "error": "No invoices found for given ID."}

        invoice = invoices.data[0]
        invoice = stripe.Invoice.retrieve(invoice.id, expand=["customer"])

        # --- Validation & logic ---
        customer_email = getattr(invoice.customer, "email", None)
        collection_method = invoice.collection_method
        status = invoice.status

        # Check invoice status
        if status not in ["draft", "open", "paid", "void", "uncollectible"]:
            return {
                "success": False,
                "reason": "invalid_status",
                "note": f"Invoice status '{status}' cannot be resent.",
            }

        # 1️⃣ Manual invoice (send_invoice)
        if collection_method == "send_invoice":
            if not customer_email:
                return {
                    "success": False,
                    "reason": "missing_email",
                    "note": "Customer has no email on file. Cannot send invoice.",
                }

            # Make sure it's finalized
            if invoice.status == "draft":
                invoice = stripe.Invoice.finalize_invoice(invoice.id)

            sent_invoice = stripe.Invoice.send_invoice(invoice.id)
            return {
                "success": True,
                "type": "manual_invoice",
                "note": f"Invoice sent successfully to {customer_email}.",
                "invoice": sent_invoice,
            }

        # 2️⃣ Auto-charge invoice (charge_automatically)
        elif collection_method == "charge_automatically":
            hosted_url = invoice.hosted_invoice_url or stripe.Invoice.retrieve(invoice.id).hosted_invoice_url
            return {
                "success": True,
                "type": "auto_charge",
                "note": "This invoice is automatically charged; email not sent. You can share the hosted link manually.",
                "invoice_url": hosted_url,
            }

        # 3️⃣ Unknown type
        else:
            return {
                "success": False,
                "reason": "unknown_method",
                "note": f"Unsupported collection method '{collection_method}'.",
            }

    except Exception as e:
        logger.error(f"Error resending invoice: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/admin/stripe/change-plan")
async def change_plan(request: Request):
    """Change a subscription's plan"""
    try:
        data = await request.json()
        subscription_id = data["subscription_id"]
        new_price_id = data["new_price_id"]
        
        # Get the subscription
        subscription = stripe.Subscription.retrieve(subscription_id)
        
        # Update the subscription with new price
        updated_subscription = stripe.Subscription.modify(
            subscription_id,
            items=[{
                'id': subscription['items']['data'][0].id,
                'price': new_price_id,
            }],
            proration_behavior='create_prorations'  # or 'none' to not prorate
        )
        
        return {"success": True, "subscription": updated_subscription}
    except Exception as e:
        logger.error(f"Error changing plan: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/admin/stripe/apply-coupon")
async def apply_coupon(request: Request):
    """Apply a coupon to a subscription"""
    try:
        data = await request.json()
        subscription_id = data["subscription_id"]
        coupon_id = data["coupon_id"]
        
        # Apply the coupon
        subscription = stripe.Subscription.modify(
            subscription_id,
            coupon=coupon_id
        )
        
        return {"success": True, "subscription": subscription}
    except Exception as e:
        logger.error(f"Error applying coupon: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/admin/stripe/extend-trial")
async def extend_trial(request: Request):
    """Extend the trial period of a subscription"""
    try:
        data = await request.json()
        subscription_id = data["subscription_id"]
        trial_end = data["trial_end"]  # Unix timestamp
        
        # Update trial end date
        subscription = stripe.Subscription.modify(
            subscription_id,
            trial_end=trial_end
        )
        
        return {"success": True, "subscription": subscription}
    except Exception as e:
        logger.error(f"Error extending trial: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/admin/stripe/refund")
async def create_refund(request: Request):
    """Create a refund for a payment"""
    try:
        data = await request.json()
        payment_intent_id = data["payment_intent_id"]
        amount = data.get("amount")  # Optional: partial refund amount in cents
        
        refund_params = {"payment_intent": payment_intent_id}
        if amount:
            refund_params["amount"] = amount
        
        refund = stripe.Refund.create(**refund_params)
        
        return {"success": True, "refund": refund}
    except Exception as e:
        logger.error(f"Error creating refund: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/admin/stripe/customer/{customer_id}")
async def get_customer_details(customer_id: str):
    """Get detailed information about a customer"""
    try:
        customer = stripe.Customer.retrieve(
            customer_id,
            expand=["subscriptions", "invoices"]
        )
        
        # Get payment methods
        payment_methods = stripe.PaymentMethod.list(
            customer=customer_id,
            type="card"
        )
        
        return {
            "success": True,
            "customer": customer,
            "payment_methods": payment_methods.data
        }
    except Exception as e:
        logger.error(f"Error fetching customer: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/admin/stripe/update-payment-method")
async def update_payment_method(request: Request):
    """Update default payment method for a subscription"""
    try:
        data = await request.json()
        subscription_id = data["subscription_id"]
        payment_method_id = data["payment_method_id"]
        
        subscription = stripe.Subscription.modify(
            subscription_id,
            default_payment_method=payment_method_id
        )
        
        return {"success": True, "subscription": subscription}
    except Exception as e:
        logger.error(f"Error updating payment method: {e}")
        return {"success": False, "error": str(e)}



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
