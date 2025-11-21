# ml_service/prompts/enhanced_workout_plan.py
"""
Enhanced workout plan prompt with better structure and examples
Ensures AI returns all required fields reliably
"""

from models.quiz import QuizAnswers
from typing import Dict, Any

# Example output to show AI exact format
EXAMPLE_WORKOUT_PLAN = """{
  "weekly_plan": [
    {
      "day": "monday",
      "split_name": "Push Day (Chest, Shoulders, Triceps)",
      "is_rest_day": false,
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "type": "compound",
          "muscle_group": "Chest",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "tempo": "2-0-2-0",
          "notes": "Warm up with lighter sets first. Keep elbows at 45-degree angle.",
          "equipment": ["Barbell", "Bench"],
          "alternatives": ["Dumbbell Bench Press", "Push-ups"]
        },
        {
          "name": "Incline Dumbbell Press",
          "type": "compound",
          "muscle_group": "Upper Chest",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 75,
          "tempo": "2-0-2-0",
          "notes": "Set bench at 30-45 degree angle. Focus on squeezing chest at top.",
          "equipment": ["Dumbbells", "Adjustable Bench"],
          "alternatives": ["Incline Barbell Press", "Incline Machine Press"]
        },
        {
          "name": "Cable Flyes",
          "type": "isolation",
          "muscle_group": "Chest",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "tempo": "2-1-2-0",
          "notes": "Maintain slight bend in elbows. Feel stretch at bottom position.",
          "equipment": ["Cable Machine"],
          "alternatives": ["Dumbbell Flyes", "Pec Deck"]
        },
        {
          "name": "Overhead Press",
          "type": "compound",
          "muscle_group": "Shoulders",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "tempo": "2-0-2-0",
          "notes": "Press straight overhead. Keep core tight throughout movement.",
          "equipment": ["Barbell"],
          "alternatives": ["Dumbbell Shoulder Press", "Machine Shoulder Press"]
        },
        {
          "name": "Lateral Raises",
          "type": "isolation",
          "muscle_group": "Side Delts",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "tempo": "2-0-2-1",
          "notes": "Raise to shoulder height. Control the negative. Avoid swinging.",
          "equipment": ["Dumbbells"],
          "alternatives": ["Cable Lateral Raises", "Machine Lateral Raises"]
        },
        {
          "name": "Tricep Rope Pushdowns",
          "type": "isolation",
          "muscle_group": "Triceps",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "tempo": "2-0-2-1",
          "notes": "Keep elbows pinned to sides. Full extension at bottom.",
          "equipment": ["Cable Machine", "Rope Attachment"],
          "alternatives": ["Overhead Tricep Extension", "Close-Grip Bench Press"]
        }
      ],
      "total_duration_minutes": 60,
      "warm_up": "5 min light cardio + dynamic stretches for shoulders and chest",
      "cool_down": "5-10 min static stretching focusing on chest, shoulders, triceps"
    }
  ],
  "program_summary": {
    "split_type": "Push/Pull/Legs",
    "total_workouts_per_week": 5,
    "avg_duration_minutes": 60,
    "difficulty_level": "Intermediate",
    "equipment_needed": ["Barbell", "Dumbbells", "Bench", "Cable Machine"],
    "progression_notes": "Increase weight by 2.5-5 lbs when you can complete all sets with good form"
  },
  "recovery_tips": [
    "Aim for 7-9 hours of quality sleep per night",
    "Stay hydrated - drink at least 3L of water daily",
    "Consider foam rolling or massage for recovery",
    "Take 1-2 full rest days per week"
  ],
  "safety_notes": "Always warm up properly before heavy lifts. Use a spotter for bench press. Stop immediately if you feel sharp pain."
}"""


def generate_enhanced_workout_plan_prompt(
    quiz_data: QuizAnswers,
    user_preferences: Dict[str, Any] = None
) -> str:
    """
    Generate an enhanced prompt that ensures reliable AI responses

    Args:
        quiz_data: User's quiz answers
        user_preferences: Optional preferences for regeneration

    Returns:
        Formatted prompt string
    """

    # Build preference notes
    pref_notes = []
    if user_preferences:
        if user_preferences.get('vary_exercises'):
            pref_notes.append("IMPORTANT: Create DIFFERENT exercises than previous plan")
        if user_preferences.get('more_cardio'):
            pref_notes.append("Include more cardio and conditioning work")
        if user_preferences.get('less_time'):
            pref_notes.append("Shorten workouts to 30-45 minutes")

    preference_section = "\n".join(pref_notes) if pref_notes else ""

    return f"""You are a certified personal trainer and strength coach creating a 7-day personalized workout plan.

====================
USER PROFILE
====================
Goal: {quiz_data.mainGoal}
Timeframe: {quiz_data.timeFrame}
Age: {quiz_data.age} | Gender: {quiz_data.gender}

FITNESS LEVEL:
- Exercise Frequency: {quiz_data.exerciseFrequency}
- Preferred Exercise Types: {', '.join(quiz_data.preferredExercise) if isinstance(quiz_data.preferredExercise, list) else quiz_data.preferredExercise}
- Training Environment: {', '.join(quiz_data.trainingEnvironment) if isinstance(quiz_data.trainingEnvironment, list) else quiz_data.trainingEnvironment}

WELLNESS FACTORS:
- Sleep Quality: {quiz_data.sleepQuality}
- Stress Level: {quiz_data.stressLevel}/10
- Motivation: {quiz_data.motivationLevel}/10

{preference_section}

====================
CRITICAL REQUIREMENTS
====================
1. Return ONLY valid JSON - no markdown, no explanations
2. Include ALL required fields (see schema below)
3. All 7 days MUST be included (monday through sunday)
4. Workout days need 4-8 exercises each
5. Rest days should have is_rest_day: true
6. Match training environment ({', '.join(quiz_data.trainingEnvironment) if isinstance(quiz_data.trainingEnvironment, list) else quiz_data.trainingEnvironment})
7. Align with exercise frequency ({quiz_data.exerciseFrequency})
8. Support primary goal ({quiz_data.mainGoal})

====================
QUALITY STANDARDS
====================
✓ Balanced muscle group coverage across week
✓ Progressive overload built into programming
✓ Appropriate volume for experience level
✓ Realistic exercise selection for environment
✓ Proper warm-up and cool-down included
✓ Safe progression guidelines
✓ Clear form cues and safety notes
✓ Equipment alternatives provided

====================
JSON SCHEMA (REQUIRED)
====================
YOU MUST RETURN THIS EXACT STRUCTURE:

{EXAMPLE_WORKOUT_PLAN}

====================
FIELD REQUIREMENTS
====================
EVERY exercise MUST include:
- name: string (exercise name)
- type: "compound" | "isolation" | "cardio" | "mobility"
- muscle_group: string (target muscle)
- sets: integer (1-6 typical)
- reps: string (e.g., "8-10", "12-15", "AMRAP")
- rest_seconds: integer (30-180 typical)
- tempo: string (e.g., "2-0-2-0" for eccentric-pause-concentric-pause)
- notes: string (form cues and tips)
- equipment: array of strings
- alternatives: array of strings (at least 1-2)

EVERY workout day MUST include:
- day: "monday" | "tuesday" | ... (lowercase)
- split_name: string (e.g., "Push Day", "Full Body", "Rest")
- is_rest_day: boolean
- exercises: array (empty for rest days, 4-8 for workout days)
- total_duration_minutes: integer
- warm_up: string (warm-up routine)
- cool_down: string (cool-down routine)

====================
SPLIT LOGIC BY FREQUENCY
====================
- 1-2 days/week → Full Body each day
- 3-4 days/week → Push/Pull or Upper/Lower Split
- 5-6 days/week → Push/Pull/Legs or Upper/Lower/Accessories
- 7 days/week → Include 1-2 Active Recovery days

====================
ENVIRONMENT LOGIC
====================
Gym: Use compound lifts + machines + isolation work
Home: Bodyweight + dumbbells/bands if available
Outdoor: Running, calisthenics, sprints, athletic drills

====================
GOAL-SPECIFIC ADJUSTMENTS
====================
Weight Loss: 3-4 resistance + 2 cardio sessions, calorie-burning finishers
Build Muscle: Push/Pull/Legs split, 8-12 rep range, progressive overload
Improve Strength: 3-6 reps, compound lifts, longer rest
Improve Endurance: Higher reps, less rest, cardio/circuits
Flexibility: Yoga, mobility flows, stretching sessions

====================
VALIDATION RULES
====================
- Workout days MUST have 4-8 exercises
- Rest days MUST have is_rest_day: true and empty exercises array
- All day names must be lowercase
- All exercise types must be valid: "compound", "isolation", "cardio", or "mobility"
- Equipment must match training environment
- Alternatives array must have at least 1 item per exercise
- Total weekly workout count should match exercise frequency

====================
NOW CREATE THE PLAN
====================
Generate a complete 7-day workout plan following ALL requirements above.
Return ONLY the JSON - no formatting, no comments, no explanations.

START JSON OUTPUT:
"""


def generate_retry_prompt_with_errors(
    original_prompt: str,
    validation_errors: list,
    attempt_number: int
) -> str:
    """
    Enhance prompt with validation error feedback for retry attempts

    Args:
        original_prompt: Original generation prompt
        validation_errors: List of validation errors from previous attempt
        attempt_number: Current retry attempt (1-indexed)

    Returns:
        Enhanced prompt with error guidance
    """

    # Extract missing/invalid fields
    error_fields = []
    for error in validation_errors:
        field_path = ".".join(str(loc) for loc in error.get('loc', []))
        error_msg = error.get('msg', 'unknown error')
        error_fields.append(f"  - {field_path}: {error_msg}")

    error_summary = "\n".join(error_fields)

    return f"""{original_prompt}

⚠️ PREVIOUS ATTEMPT #{attempt_number} FAILED ⚠️

VALIDATION ERRORS:
{error_summary}

FIX THESE ISSUES:
1. Double-check that ALL fields listed above are included
2. Ensure field types match requirements (string, integer, boolean, array)
3. Verify day names are lowercase ("monday", not "Monday")
4. Confirm exercise types are exactly: "compound", "isolation", "cardio", or "mobility"
5. Make sure arrays are not empty where required
6. Rest days must have is_rest_day: true
7. Workout days must have is_rest_day: false

RETRY #{attempt_number + 1} - BE EXTRA CAREFUL:
"""
