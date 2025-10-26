"""Nutrition and fitness calculation utilities with comprehensive type hints"""

import math
from typing import Dict, Any, Optional
from models.quiz import QuizAnswers
from .converters import parse_measurement, parse_weight


def calculate_navy_bfp(
    gender: str,
    height_m: float,
    neck_cm: float,
    waist_cm: float,
    hip_cm: Optional[float] = None
) -> Optional[float]:
    """
    Calculate approximate body fat percentage using U.S. Navy Method.

    Args:
        gender: User's gender ('male' or 'female')
        height_m: Height in meters
        neck_cm: Neck circumference in centimeters
        waist_cm: Waist circumference in centimeters
        hip_cm: Hip circumference in centimeters (required for females)

    Returns:
        Body fat percentage or None if calculation fails

    Formula:
        Male: BFP = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height_cm)) - 450
        Female: BFP = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height_cm)) - 450
    """
    try:
        height_cm = height_m * 100

        if gender.lower() == "male":
            bfp = (
                495 / (
                    1.0324
                    - 0.19077 * math.log10(waist_cm - neck_cm)
                    + 0.15456 * math.log10(height_cm)
                ) - 450
            )
        elif gender.lower() == "female":
            if hip_cm is None:
                raise ValueError("Hip measurement required for female BFP calculation")
            bfp = (
                495 / (
                    1.29579
                    - 0.35004 * math.log10(waist_cm + hip_cm - neck_cm)
                    + 0.22100 * math.log10(height_cm)
                ) - 450
            )
        else:
            return None

        return round(bfp, 1)
    except (ValueError, ZeroDivisionError, Exception):
        return None


def calculate_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    body_fat_pct: Optional[float] = None
) -> float:
    """
    Calculate Basal Metabolic Rate (BMR).

    Uses Katch-McArdle formula if body fat % is available, otherwise uses Mifflin-St Jeor.

    Args:
        weight_kg: Weight in kilograms
        height_cm: Height in centimeters
        age: Age in years
        gender: User's gender
        body_fat_pct: Optional body fat percentage

    Returns:
        BMR in calories per day
    """
    # Use Katch-McArdle if body fat % available (more accurate)
    if body_fat_pct and 2 < float(body_fat_pct) < 60:
        lean_mass_kg = weight_kg * (1 - float(body_fat_pct) / 100)
        bmr = 370 + 21.6 * lean_mass_kg
    else:
        # Mifflin-St Jeor equation
        if gender.lower() == "male":
            s = 5
        elif gender.lower() == "female":
            s = -161
        else:
            s = -78  # Average for non-binary

        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + s

    return bmr


def calculate_tdee(bmr: float, exercise_freq: str, occupation: str) -> float:
    """
    Calculate Total Daily Energy Expenditure (TDEE).

    Args:
        bmr: Basal Metabolic Rate
        exercise_freq: Exercise frequency string
        occupation: Occupation activity level

    Returns:
        TDEE in calories per day
    """
    # Base activity multipliers
    freq_map = {
        "Never": 1.2,
        "1-2 times/week": 1.375,
        "3-4 times/week": 1.55,
        "5-6 times/week": 1.725,
        "Daily": 1.9,
    }

    activity_multiplier = freq_map.get(exercise_freq, 1.2)

    # Adjust for occupation
    occupation_lower = occupation.lower()
    if any(x in occupation_lower for x in ["physical", "on feet", "active job", "manual"]):
        activity_multiplier = min(1.9, activity_multiplier + 0.15)
    elif any(x in occupation_lower for x in ["desk", "sedentary"]):
        activity_multiplier = max(1.2, activity_multiplier - 0.1)

    return bmr * activity_multiplier


def calculate_goal_calories(tdee: float, goal: str, bmr: float, gender: str) -> int:
    """
    Calculate target calories based on user's goal.

    Args:
        tdee: Total Daily Energy Expenditure
        goal: Primary fitness goal
        bmr: Basal Metabolic Rate
        gender: User's gender

    Returns:
        Target daily calories
    """
    goal_lower = goal.lower()

    # Goal-specific multipliers
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

    # Find closest match
    multiplier = next((v for k, v in goal_map.items() if k in goal_lower), 1.0)
    goal_calories = tdee * multiplier

    # Apply safety limits
    safe_min = max(bmr * 1.1, 1200 if gender.lower() != "male" else 1500)
    safe_max = tdee + 700

    return round(max(safe_min, min(goal_calories, safe_max)))


def calculate_macros(
    goal_calories: int,
    weight_kg: float,
    goal: str,
    dietary_style: str
) -> Dict[str, int]:
    """
    Calculate macronutrient targets.

    Args:
        goal_calories: Target daily calories
        weight_kg: Current weight in kg
        goal: Primary fitness goal
        dietary_style: Dietary preference

    Returns:
        Dictionary with protein, carbs, fat (grams and percentages)
    """
    goal_lower = goal.lower()
    dietary_style_lower = dietary_style.lower()

    # Determine fat percentage based on dietary style
    fat_pct = 0.28
    if "keto" in dietary_style_lower:
        fat_pct = 0.35
    elif "vegan" in dietary_style_lower:
        fat_pct = 0.25

    # Calculate fat
    fat_calories = round(goal_calories * fat_pct)
    fat_g = round(fat_calories / 9)

    # Calculate protein (higher for recomposition/muscle building)
    protein_per_kg = 2.0 if "recomposition" in goal_lower else 1.8
    protein_g = round(weight_kg * protein_per_kg)
    protein_calories = protein_g * 4

    # Calculate carbs (remainder)
    carbs_g = round(max(0, (goal_calories - (protein_calories + fat_calories)) / 4))

    # Ensure perfect calorie alignment
    total_calories_check = protein_calories + fat_calories + (carbs_g * 4)
    if total_calories_check != goal_calories:
        diff = goal_calories - total_calories_check
        carbs_g += round(diff / 4)

    return {
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g,
        "protein_pct_of_calories": round(protein_calories / goal_calories * 100),
        "carbs_pct_of_calories": round(carbs_g * 4 / goal_calories * 100),
        "fat_pct_of_calories": round(fat_calories / goal_calories * 100),
    }


def calculate_nutrition_profile(answers: QuizAnswers) -> Dict[str, Any]:
    """
    Compute complete nutrition profile including BMI, BMR, TDEE, goal calories, and macros.

    Args:
        answers: QuizAnswers model with user data

    Returns:
        Dictionary containing all calculated metrics

    Raises:
        ValueError: If required measurements are missing
    """
    # Basic info
    age = int(answers.age)
    gender = answers.gender
    goal = answers.mainGoal
    dietary_style = answers.dietaryStyle or ""
    exercise_freq = answers.exerciseFrequency or "Never"
    occupation = answers.occupation_activity or ""
    body_fat_pct = getattr(answers, "bodyFat", None)

    # Parse height
    height_cm, height_str, height_unit = parse_measurement(answers.height)
    if height_cm is None:
        raise ValueError("Height not provided")
    height_m = height_cm / 100

    # Parse weight
    weight_kg, weight_str, weight_unit = parse_weight(answers.currentWeight)
    if weight_kg is None:
        raise ValueError("Weight not provided")

    # Parse target weight
    target_weight_kg, target_weight_str, target_weight_unit = (
        parse_weight(answers.targetWeight) if answers.targetWeight else (None, "", None)
    )

    # Calculate body fat percentage if measurements available
    neck_cm, _, _ = parse_measurement(answers.neck) if answers.neck else (None, "", None)
    waist_cm, _, _ = parse_measurement(answers.waist) if answers.waist else (None, "", None)
    hip_cm, _, _ = parse_measurement(answers.hip) if answers.hip else (None, "", None)

    calculated_bfp = None
    if neck_cm and waist_cm and (gender.lower() == "male" or (gender.lower() == "female" and hip_cm)):
        calculated_bfp = calculate_navy_bfp(gender, height_m, neck_cm, waist_cm, hip_cm)

    # Use user-provided BFP if available, otherwise use calculated
    body_fat_pct = float(body_fat_pct) if body_fat_pct else calculated_bfp

    # Calculate BMI
    bmi = weight_kg / (height_m ** 2)

    # Calculate BMR
    bmr = calculate_bmr(weight_kg, height_cm, age, gender, body_fat_pct)

    # Calculate TDEE
    tdee = calculate_tdee(bmr, exercise_freq, occupation)

    # Calculate goal calories
    goal_calories = calculate_goal_calories(tdee, goal, bmr, gender)

    # Calculate macros
    macros = calculate_macros(goal_calories, weight_kg, goal, dietary_style)

    # Calculate estimated weeks to reach target
    estimated_weeks = None
    if target_weight_kg:
        weight_diff = target_weight_kg - weight_kg
        weekly_calorie_change = goal_calories - tdee
        kg_per_week = weekly_calorie_change * 7 / 7700 if weekly_calorie_change != 0 else None
        estimated_weeks = round(abs(weight_diff / kg_per_week)) if kg_per_week else None

    return {
        "bmi": round(bmi, 1),
        "bmr": round(bmr, 2),
        "tdee": round(tdee, 2),
        "goalCalories": int(round(goal_calories)),
        "bodyFatPercentage": body_fat_pct,
        "macros": macros,
        "activityMultiplier": round(tdee / bmr, 2),
        "targetWeight": round(target_weight_kg) if target_weight_kg else None,
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
