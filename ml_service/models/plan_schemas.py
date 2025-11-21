# ml_service/models/plan_schemas.py

"""
Pydantic validation schemas for AI-generated meal and workout plans.
These schemas ensure AI responses have all required fields before saving to database.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


# ========================
# MEAL PLAN SCHEMAS
# ========================

class MealItem(BaseModel):
    """Individual meal within a meal plan"""
    name: str = Field(..., min_length=1, max_length=200)
    calories: int = Field(..., ge=0, le=5000)
    protein: float = Field(..., ge=0, le=500)
    carbs: float = Field(..., ge=0, le=500)
    fats: float = Field(..., ge=0, le=300)
    ingredients: List[str] = Field(..., min_length=1)
    instructions: List[str] = Field(..., min_length=1)
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner|snack)$")
    prep_time: Optional[int] = Field(None, ge=0, le=300)
    cook_time: Optional[int] = Field(None, ge=0, le=480)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or v.strip() == "":
            raise ValueError("Meal name cannot be empty")
        return v.strip()


class DayMeals(BaseModel):
    """Meals for a single day"""
    day: str = Field(..., pattern="^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$")
    breakfast: MealItem
    lunch: MealItem
    dinner: MealItem
    snacks: Optional[List[MealItem]] = []
    total_calories: int = Field(..., ge=0, le=10000)
    total_protein: float = Field(..., ge=0)
    total_carbs: float = Field(..., ge=0)
    total_fats: float = Field(..., ge=0)


class WeeklySummary(BaseModel):
    """Weekly summary for meal plan"""
    avg_daily_calories: int = Field(..., ge=0)
    avg_daily_protein: float = Field(..., ge=0)
    avg_daily_carbs: float = Field(..., ge=0)
    avg_daily_fats: float = Field(..., ge=0)
    total_unique_meals: Optional[int] = Field(None, ge=0)
    prep_friendly: Optional[bool] = None

    @field_validator('avg_daily_calories')
    @classmethod
    def validate_calories(cls, v):
        if v < 800 or v > 8000:
            raise ValueError(f"Average daily calories {v} seems unrealistic (800-8000)")
        return v


class MealPlanSchema(BaseModel):
    """Complete meal plan validation schema"""
    weekly_plan: List[DayMeals] = Field(..., min_length=7, max_length=7)
    weekly_summary: WeeklySummary
    shopping_list: Optional[List[str]] = []
    meal_prep_tips: Optional[List[str]] = []
    nutritional_notes: Optional[str] = None

    @field_validator('weekly_plan')
    @classmethod
    def validate_weekly_plan(cls, v):
        if len(v) != 7:
            raise ValueError("Weekly plan must contain exactly 7 days")

        days = [day.day.lower() for day in v]
        expected_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

        if sorted(days) != sorted(expected_days):
            raise ValueError(f"Weekly plan must include all 7 days. Got: {days}")

        return v


# ========================
# WORKOUT PLAN SCHEMAS
# ========================

class Exercise(BaseModel):
    """Individual exercise within a workout"""
    name: str = Field(..., min_length=1, max_length=200)
    sets: int = Field(..., ge=1, le=20)
    reps: Optional[str] = None  # "8-12" or "12" or "AMRAP"
    duration: Optional[int] = Field(None, ge=0, le=600)  # seconds
    rest: Optional[int] = Field(None, ge=0, le=600)  # seconds
    intensity: Optional[str] = Field(None, pattern="^(low|moderate|high)$")
    instructions: Optional[List[str]] = []
    target_muscles: Optional[List[str]] = []
    equipment: Optional[List[str]] = []

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or v.strip() == "":
            raise ValueError("Exercise name cannot be empty")
        return v.strip()


class WorkoutDay(BaseModel):
    """Workout for a single day"""
    day: str = Field(..., pattern="^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$")
    workout_name: str = Field(..., min_length=1)
    focus: Optional[str] = None  # "Upper Body", "Lower Body", "Cardio", etc.
    exercises: List[Exercise] = Field(..., min_length=1)
    warm_up: Optional[List[str]] = []
    cool_down: Optional[List[str]] = []
    estimated_duration: Optional[int] = Field(None, ge=10, le=300)  # minutes
    difficulty: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    calories_burned: Optional[int] = Field(None, ge=0, le=2000)


class RestDay(BaseModel):
    """Rest or active recovery day"""
    day: str = Field(..., pattern="^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$")
    is_rest_day: bool = True
    active_recovery: Optional[List[str]] = []  # "Light walking", "Stretching", etc.
    notes: Optional[str] = None


class WorkoutWeeklySummary(BaseModel):
    """Weekly summary for workout plan"""
    total_workout_days: int = Field(..., ge=1, le=7)
    total_rest_days: int = Field(..., ge=0, le=6)
    avg_workout_duration: Optional[int] = Field(None, ge=0)
    total_weekly_calories_burned: Optional[int] = Field(None, ge=0)
    primary_focus: Optional[str] = None
    equipment_needed: Optional[List[str]] = []

    @field_validator('total_workout_days', 'total_rest_days')
    @classmethod
    def validate_days(cls, v, info):
        if info.field_name == 'total_workout_days' and v < 1:
            raise ValueError("Must have at least 1 workout day")
        return v


class WorkoutPlanSchema(BaseModel):
    """Complete workout plan validation schema"""
    weekly_plan: List[WorkoutDay] = Field(..., min_length=1, max_length=7)
    rest_days: Optional[List[RestDay]] = []
    weekly_summary: WorkoutWeeklySummary
    progression_notes: Optional[List[str]] = []
    safety_tips: Optional[List[str]] = []

    @field_validator('weekly_plan')
    @classmethod
    def validate_weekly_plan(cls, v):
        if len(v) < 1 or len(v) > 7:
            raise ValueError("Weekly plan must have 1-7 workout days")

        # Check for duplicate days
        days = [day.day.lower() for day in v]
        if len(days) != len(set(days)):
            raise ValueError(f"Duplicate workout days found: {days}")

        return v

    @field_validator('weekly_summary')
    @classmethod
    def validate_summary_consistency(cls, v, info):
        """Ensure summary matches actual workout days"""
        weekly_plan = info.data.get('weekly_plan', [])
        rest_days = info.data.get('rest_days', [])

        actual_workout_days = len(weekly_plan)
        actual_rest_days = len(rest_days)

        if v.total_workout_days != actual_workout_days:
            raise ValueError(
                f"Summary workout days ({v.total_workout_days}) doesn't match "
                f"actual workout days ({actual_workout_days})"
            )

        if v.total_rest_days != actual_rest_days:
            raise ValueError(
                f"Summary rest days ({v.total_rest_days}) doesn't match "
                f"actual rest days ({actual_rest_days})"
            )

        return v


# ========================
# HELPER FUNCTIONS
# ========================

def validate_meal_plan(data: Dict[str, Any]) -> MealPlanSchema:
    """
    Validate AI-generated meal plan response.

    Args:
        data: Raw JSON data from AI

    Returns:
        Validated MealPlanSchema instance

    Raises:
        ValidationError: If data doesn't match schema
    """
    return MealPlanSchema(**data)


def validate_workout_plan(data: Dict[str, Any]) -> WorkoutPlanSchema:
    """
    Validate AI-generated workout plan response.

    Args:
        data: Raw JSON data from AI

    Returns:
        Validated WorkoutPlanSchema instance

    Raises:
        ValidationError: If data doesn't match schema
    """
    return WorkoutPlanSchema(**data)
