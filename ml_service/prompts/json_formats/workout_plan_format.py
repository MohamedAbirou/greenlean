WORKOUT_PLAN_JSON_FORMAT = """
Return ONLY valid JSON with this exact structure (no markdown, no extra text):

{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout_type": "Upper Body Strength",
      "training_location": "Gym",
      "focus": "Chest, Back, Shoulders",
      "duration_minutes": 60,
      "intensity": "Moderate-High",
      "exercises": [
        {{
          "name": "Barbell Bench Press",
          "category": "compound",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "tempo": "2-0-2-0",
          "instructions": "Clear, safe execution cues. Form > weight. Control eccentric.",
          "muscle_groups": ["chest", "triceps", "shoulders"],
          "difficulty": "intermediate",
          "equipment_needed": ["barbell", "bench"],
          "alternatives": {{
            "home": "Push-ups with elevation",
            "outdoor": "Decline push-ups on bench",
            "easier": "Dumbbell press",
            "harder": "Incline barbell press"
          }},
          "progression": "Add 2.5kg when you hit 4x10 with good form",
          "safety_notes": "Keep shoulder blades retracted, avoid flaring elbows"
        }}
      ],
      "warmup": {{
        "duration_minutes": 10,
        "activities": [
          "5 min light cardio (treadmill/bike)",
          "Arm circles: 10 each direction",
          "Band pull-aparts: 2x15",
          "Push-up plus: 2x10",
          "Specific warm-up sets for first exercise"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 10,
        "activities": [
          "Child's pose: 60 seconds",
          "Chest doorway stretch: 60s each side",
          "Shoulder dislocations with band: 2x10",
          "Deep breathing exercises: 3 minutes"
        ]
      }},
      "estimated_calories_burned": 350,
      "rpe_target": "7-8 out of 10",
      "success_criteria": "Complete all sets with good form, feel muscle engagement",
      "if_low_energy": "Reduce sets by 25%, maintain intensity on key lifts",
      "optional": false,
      "if_feeling_good": null
    }},
  ],
  "weekly_summary": {{
    "total_workout_days": 5,
    "strength_days": 3,
    "cardio_days": 2,
    "rest_days": 2,
    "total_time_minutes": 300,
    "total_exercises": 15,
    "difficulty_level": "hard",
    "estimated_weekly_calories_burned": 2100,
    "training_split": "Upper/Lower/Full Body + Conditioning",
    "progression_strategy": "Linear progression with deload every 4th week"
  }},
  "periodization_plan": {{
    "week_1_2": "Adaptation: Focus on form, establish baseline",
    "week_3_4": "Build: Increase load 5-10%, maintain volume",
    "week_5_6": "Peak: Max volume, push intensity",
    "week_7": "Deload: Reduce volume by 40%, maintain intensity",
    "week_8_plus": "Repeat cycle with higher baseline"
  }},
  "exercise_library_by_location": {{
    "gym_exercises": ["List key gym exercises for their goals"],
    "home_exercises": ["Bodyweight/minimal equipment alternatives"],
    "outdoor_exercises": ["Running routes, park workouts, trails"]
  }},
  "progression_tracking": {{
    "what_to_track": ["Weight lifted", "Reps completed", "RPE", "Energy levels"],
    "when_to_progress": "When you can complete top end of rep range for all sets",
    "how_much_to_add": "2.5-5kg for upper body, 5-10kg for lower body",
    "plateau_breakers": ["Deload week", "Change rep ranges", "Modify exercise selection"]
  }},
  "personalized_tips": [
    "Recovery tip based on sleep quality: {sleep_quality}",
    "Stress management: Given stress level {stress_level}/10, incorporate more recovery",
    "IBS consideration: Avoid high-impact core work immediately after meals if IBS-D present",
    "Goal-specific tip for {main_goal}",
    "Motivation strategy for level {motivation_level}/10",
    "Time management tip addressing: {challenges}",
    "Age-appropriate intensity for {age} years old"
  ],
  "injury_prevention": {{
    "mobility_work": "Daily 10-min routine focusing on weak points",
    "red_flags": "Stop if sharp pain, dizziness, or unusual symptoms",
    "modification_guidelines": "How to adjust based on how you feel",
    "pre_existing_considerations": "Specific to {health_conditions_other}"
  }},
  "nutrition_timing": {{
    "pre_workout": "Eat 1-2 hours before, focus on carbs + moderate protein",
    "post_workout": "Within 2 hours, protein + carbs for recovery",
    "rest_days": "Maintain protein, slightly lower carbs",
    "hydration": "Drink 500ml 2 hours before, sip during workout"
  }},
  "lifestyle_integration": {{
    "busy_day_workouts": "Quick 20-30 min options",
    "travel_workouts": "Hotel room/minimal equipment routines",
    "social_considerations": "How to maintain consistency with social life",
    "work_schedule_tips": "Best times to train based on {occupation_activity}"
  }}
}}
"""
