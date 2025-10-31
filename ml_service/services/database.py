# services/database.py (FIXED)

"""Database service for managing connections and operations"""

import json
from typing import Optional, Any, Dict
import asyncpg
from contextlib import asynccontextmanager
from datetime import datetime

from config.settings import settings
from config.logging_config import logger, log_database_operation, log_error


class DatabaseService:
    """Service for database connection management and operations"""

    def __init__(self):
        """Initialize database service"""
        self.pool: Optional[asyncpg.Pool] = None

    async def initialize(self) -> None:
        """Initialize database connection pool"""
        try:
            if not all([settings.DB_USER, settings.DB_PASSWORD, settings.DB_HOST, settings.DB_PORT, settings.DB_NAME]):
                logger.warning("Database credentials not fully configured. Skipping DB initialization.")
                return

            self.pool = await asyncpg.create_pool(
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database=settings.DB_NAME,
                min_size=settings.DB_POOL_MIN_SIZE,
                max_size=settings.DB_POOL_MAX_SIZE
            )
            logger.info("Database connection pool initialized successfully")

        except Exception as e:
            log_error(e, "Database pool initialization")
            raise

    async def close(self) -> None:
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")

    @asynccontextmanager
    async def get_connection(self):
        """Context manager for database connections"""
        if not self.pool:
            raise Exception("Database pool not initialized")

        async with self.pool.acquire() as connection:
            yield connection

    async def initialize_plan_status(self, user_id: str, quiz_result_id: str) -> bool:
        """Initialize plan generation status records with placeholder values"""
        try:
            if not self.pool:
                logger.warning("Database not initialized. Skipping status initialization.")
                return False

            async with self.get_connection() as conn:
                # Initialize meal plan with generating status and placeholder values
                await conn.execute(
                    """
                    INSERT INTO ai_meal_plans 
                    (user_id, quiz_result_id, plan_data, status, is_active, daily_calories, preferences, restrictions)
                    VALUES ($1, $2, NULL, 'generating', false, 0, '[]', '')
                    ON CONFLICT (user_id, quiz_result_id) 
                    DO UPDATE SET status = 'generating', updated_at = NOW()
                    """,
                    user_id,
                    quiz_result_id
                )
                
                # Initialize workout plan with generating status and placeholder values
                await conn.execute(
                    """
                    INSERT INTO ai_workout_plans 
                    (user_id, quiz_result_id, plan_data, status, is_active, workout_type, duration_per_session, frequency_per_week)
                    VALUES ($1, $2, NULL, 'generating', false, '[]', '', 0)
                    ON CONFLICT (user_id, quiz_result_id)
                    DO UPDATE SET status = 'generating', updated_at = NOW()
                    """,
                    user_id,
                    quiz_result_id
                )

            log_database_operation("INSERT", "plan_status_init", user_id, success=True)
            return True

        except Exception as e:
            log_error(e, "Failed to initialize plan status", user_id)
            return False

    async def save_meal_plan(
        self,
        user_id: str,
        quiz_result_id: str,
        plan_data: Dict[str, Any],
        daily_calories: int,
        preferences: list,
        restrictions: str
    ) -> bool:
        """Save meal plan to database with completed status"""
        try:
            if not self.pool:
                logger.warning("Database not initialized. Skipping meal plan save.")
                return False

            async with self.get_connection() as conn:
                await conn.execute(
                    """
                    INSERT INTO ai_meal_plans
                    (user_id, quiz_result_id, plan_data, daily_calories, preferences, restrictions, status, is_active, generated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, 'completed', true, NOW())
                    ON CONFLICT (user_id, quiz_result_id)
                    DO UPDATE SET 
                        plan_data = $3,
                        daily_calories = $4,
                        preferences = $5,
                        restrictions = $6,
                        status = 'completed',
                        is_active = true,
                        generated_at = NOW(),
                        updated_at = NOW()
                    """,
                    user_id,
                    quiz_result_id,
                    json.dumps(plan_data),
                    daily_calories,
                    json.dumps(preferences),
                    restrictions
                )

            log_database_operation("UPSERT", "ai_meal_plans", user_id, success=True)
            return True

        except Exception as e:
            log_error(e, "Failed to save meal plan", user_id)
            await self.update_plan_status(user_id, "meal", "failed", str(e))
            return False

    async def save_workout_plan(
        self,
        user_id: str,
        quiz_result_id: str,
        plan_data: Dict[str, Any],
        workout_type: list,
        duration_per_session: str,
        frequency_per_week: int
    ) -> bool:
        """Save workout plan to database with completed status"""
        try:
            if not self.pool:
                logger.warning("Database not initialized. Skipping workout plan save.")
                return False

            async with self.get_connection() as conn:
                await conn.execute(
                    """
                    INSERT INTO ai_workout_plans
                    (user_id, quiz_result_id, plan_data, workout_type, duration_per_session, frequency_per_week, status, is_active, generated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, 'completed', true, NOW())
                    ON CONFLICT (user_id, quiz_result_id)
                    DO UPDATE SET 
                        plan_data = $3,
                        workout_type = $4,
                        duration_per_session = $5,
                        frequency_per_week = $6,
                        status = 'completed',
                        is_active = true,
                        generated_at = NOW(),
                        updated_at = NOW()
                    """,
                    user_id,
                    quiz_result_id,
                    json.dumps(plan_data),
                    json.dumps(workout_type),
                    duration_per_session,
                    frequency_per_week
                )

            log_database_operation("UPSERT", "ai_workout_plans", user_id, success=True)
            return True

        except Exception as e:
            log_error(e, "Failed to save workout plan", user_id)
            await self.update_plan_status(user_id, "workout", "failed", str(e))
            return False

    async def update_plan_status(
        self,
        user_id: str,
        plan_type: str,
        status: str,
        error_message: Optional[str] = None
    ) -> bool:
        """Update plan generation status"""
        try:
            if not self.pool:
                return False

            table = "ai_meal_plans" if plan_type == "meal" else "ai_workout_plans"

            async with self.get_connection() as conn:
                await conn.execute(
                    f"""
                    UPDATE {table}
                    SET status = $1, error_message = $2, updated_at = NOW()
                    WHERE user_id = $3
                    AND id = (SELECT id FROM {table} WHERE user_id = $3 ORDER BY created_at DESC LIMIT 1)
                    """,
                    status,
                    error_message,
                    user_id
                )

            log_database_operation("UPDATE", f"{table}_status", user_id, success=True)
            return True

        except Exception as e:
            log_error(e, f"Failed to update {plan_type} plan status", user_id)
            return False

    async def get_plan_status(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get current plan generation status for user"""
        try:
            if not self.pool:
                return None

            async with self.get_connection() as conn:
                meal_status = await conn.fetchrow(
                    """
                    SELECT status, error_message, generated_at
                    FROM ai_meal_plans
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    user_id
                )
                
                workout_status = await conn.fetchrow(
                    """
                    SELECT status, error_message, generated_at
                    FROM ai_workout_plans
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    user_id
                )

            return {
                "meal_plan_status": meal_status["status"] if meal_status else "not_started",
                "meal_plan_error": meal_status["error_message"] if meal_status else None,
                "meal_plan_generated_at": meal_status["generated_at"].isoformat() if meal_status and meal_status["generated_at"] else None,
                "workout_plan_status": workout_status["status"] if workout_status else "not_started",
                "workout_plan_error": workout_status["error_message"] if workout_status else None,
                "workout_plan_generated_at": workout_status["generated_at"].isoformat() if workout_status and workout_status["generated_at"] else None
            }

        except Exception as e:
            log_error(e, "Failed to get plan status", user_id)
            return None

    async def update_quiz_calculations(self, quiz_result_id: str, calculations: Dict[str, Any]) -> bool:
        """Update quiz result with calculations"""
        try:
            if not self.pool:
                logger.warning("Database not initialized. Skipping calculations update.")
                return False

            async with self.get_connection() as conn:
                await conn.execute(
                    """
                    UPDATE quiz_results
                    SET calculations = $1
                    WHERE id = $2
                    """,
                    json.dumps(calculations),
                    quiz_result_id
                )

            log_database_operation("UPDATE", "quiz_results", success=True)
            return True

        except Exception as e:
            log_error(e, f"Failed to update calculations for quiz_result_id {quiz_result_id}")
            log_database_operation("UPDATE", "quiz_results", success=False)
            return False

    # In db_service
    async def set_user_plan(self, user_id: str, plan_id: str, stripe_customer_id: str = None):
        # Start with the first positional placeholder
        q = "UPDATE profiles SET plan_id = $1, plan_renewal_date = NOW() + INTERVAL '1 month'"
        params = [plan_id]

        # Add stripe_customer_id if provided
        if stripe_customer_id:
            q += ", stripe_customer_id = $2"
            params.append(stripe_customer_id)
            q += " WHERE id = $3"
            params.append(user_id)
        else:
            q += " WHERE id = $2"
            params.append(user_id)

        async with self.pool.acquire() as conn:
            await conn.execute(q, *params)

    async def lookup_user_by_stripe(self, stripe_customer_id: str):
        q = "SELECT id FROM profiles WHERE stripe_customer_id = $1"
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(q, stripe_customer_id)
            return row["id"] if row else None

db_service = DatabaseService()