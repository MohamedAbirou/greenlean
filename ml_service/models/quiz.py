"""Pydantic models for quiz-related data structures"""

from typing import List, Optional, Union
from pydantic import BaseModel, Field


class WeightMeasurement(BaseModel):
    """Supports weight input in either kg or lbs."""
    kg: Optional[Union[str, float]] = None
    lbs: Optional[Union[str, float]] = None


class LengthMeasurement(BaseModel):
    """Supports length input in either cm or ft/in."""
    cm: Optional[Union[str, float]] = None
    ft: Optional[Union[str, float]] = None
    inch: Optional[Union[str, float]] = None


class QuizAnswers(BaseModel):
    """Complete quiz answers from user"""

    age: Union[str, int]
    gender: str
    country: Optional[str] = None

    height: LengthMeasurement
    currentWeight: WeightMeasurement
    targetWeight: WeightMeasurement
    neck: Optional[LengthMeasurement] = None
    waist: Optional[LengthMeasurement] = None
    hip: Optional[LengthMeasurement] = None
    bodyFat: Optional[Union[int, float]] = None

    mainGoal: str
    secondaryGoals: Optional[List[str]] = None
    timeFrame: str
    bodyType: Optional[str] = None

    lifestyle: str
    occupation_activity: Optional[str] = None
    groceryBudget: str
    dietaryStyle: str
    mealsPerDay: str
    motivationLevel: int = Field(ge=1, le=10)
    stressLevel: int = Field(ge=1, le=10)
    sleepQuality: str

    healthConditions: Optional[List[str]] = None
    healthConditions_other: Optional[str] = None
    medications: Optional[str] = None
    injuries: Optional[str] = None
    foodAllergies: Optional[str] = None

    exerciseFrequency: str
    preferredExercise: List[str]
    trainingEnvironment: List[str]
    equipment: Optional[List[str]] = None

    dislikedFoods: Optional[str] = None
    cookingSkill: str
    cookingTime: str

    challenges: Optional[List[str]] = None


class Macros(BaseModel):
    """Calculated macronutrient targets"""
    protein_g: int
    carbs_g: int
    fat_g: int
    protein_pct_of_calories: int
    carbs_pct_of_calories: int
    fat_pct_of_calories: int


class Calculations(BaseModel):
    """All calculated metrics from quiz answers"""
    bmi: float
    bmr: float
    tdee: float
    bodyFatPercentage: Optional[float] = None
    macros: Macros
    goalCalories: int
    goalWeight: float


class GeneratePlansRequest(BaseModel):
    """Request model for plan generation endpoints"""
    user_id: str
    quiz_result_id: str
    answers: QuizAnswers
    ai_provider: str = "openai"
    model_name: str = "gpt-4o-mini"
