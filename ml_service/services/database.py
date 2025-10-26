"""Database service for managing connections and operations"""

import json
from typing import Optional, Any, Dict
import asyncpg
from contextlib import asynccontextmanager

from config.settings import settings
from config.logging_config import logger, log_database_operation, log_error


class DatabaseService:
    """Service for database connection management and operations"""

    def __init__(self):
        """Initialize database service"""
        self.pool: Optional[asyncpg.Pool] = None

    async def initialize(self) -> None:
        """
        Initialize database connection pool.

        Raises:
            Exception: If database initialization fails
        """
        try:
            if not all([
                settings.DB_USER,
                settings.DB_PASSWORD,
                settings.DB_HOST,
                settings.DB_PORT,
                settings.DB_NAME
            ]):
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
        """
        Context manager for database connections.

        Yields:
            Database connection from pool

        Raises:
            Exception: If no pool is available
        """
        if not self.pool:
            raise Exception("Database pool not initialized")

        async with self.pool.acquire() as connection:
            yield connection

    async def save_meal_plan(
        self,
        user_id: str,
        quiz_result_id: str,
        plan_data: Dict[str, Any],
        daily_calories: int,
        preferences: list,
        restrictions: str
    ) -> bool:
        """
        Save meal plan to database.

        Args:
            user_id: User ID
            quiz_result_id: Quiz result ID
            plan_data: Generated meal plan data
            daily_calories: Target daily calories
            preferences: User preferences list
            restrictions: Dietary restrictions

        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.pool:
                logger.warning("Database not initialized. Skipping meal plan save.")
                return False

            async with self.get_connection() as conn:
                await conn.execute(
                    """
                    INSERT INTO ai_meal_plans
                    (user_id, quiz_result_id, plan_data, daily_calories, preferences, restrictions, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6, true)
                    """,
                    user_id,
                    quiz_result_id,
                    json.dumps(plan_data),
                    daily_calories,
                    json.dumps(preferences),
                    restrictions
                )

            log_database_operation("INSERT", "ai_meal_plans", user_id, success=True)
            return True

        except Exception as e:
            log_error(e, "Failed to save meal plan", user_id)
            log_database_operation("INSERT", "ai_meal_plans", user_id, success=False)
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
        """
        Save workout plan to database.

        Args:
            user_id: User ID
            quiz_result_id: Quiz result ID
            plan_data: Generated workout plan data
            workout_type: Types of workouts
            duration_per_session: Exercise frequency
            frequency_per_week: Workouts per week

        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.pool:
                logger.warning("Database not initialized. Skipping workout plan save.")
                return False

            async with self.get_connection() as conn:
                await conn.execute(
                    """
                    INSERT INTO ai_workout_plans
                    (user_id, quiz_result_id, plan_data, workout_type, duration_per_session, frequency_per_week, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6, true)
                    """,
                    user_id,
                    quiz_result_id,
                    json.dumps(plan_data),
                    json.dumps(workout_type),
                    duration_per_session,
                    frequency_per_week
                )

            log_database_operation("INSERT", "ai_workout_plans", user_id, success=True)
            return True

        except Exception as e:
            log_error(e, "Failed to save workout plan", user_id)
            log_database_operation("INSERT", "ai_workout_plans", user_id, success=False)
            return False

    async def update_quiz_calculations(
        self,
        quiz_result_id: str,
        calculations: Dict[str, Any]
    ) -> bool:
        """
        Update quiz result with calculations.

        Args:
            quiz_result_id: Quiz result ID
            calculations: Calculated metrics

        Returns:
            True if successful, False otherwise
        """
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


# Global database service instance
db_service = DatabaseService()
