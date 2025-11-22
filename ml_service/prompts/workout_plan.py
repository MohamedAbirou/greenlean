"""Workout plan prompt template"""

WORKOUT_PLAN_PROMPT = """
You are a certified fitness coach, exercise physiologist, and strength & conditioning specialist. Create a comprehensive, science-based 7-day workout plan that maximizes results while respecting the user's limitations and lifestyle.

User Profile Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMOGRAPHICS & PHYSIQUE:
- Age: {age} years | Gender: {gender}
- Height: {height} | Current Weight: {current_weight}
- Target Weight: {target_weight} | Body Type: {body_type} | Body Fat Percentage: {body_fat}

TRAINING PROFILE:
- Current Activity Level: {exercise_frequency}
- Preferred Exercise Types: {preferred_exercise}
- Training Locations: {training_environment}
- Available Equipment: {equipment}
- Injuries/Limitations: Check health conditions below

HEALTH & RECOVERY:
- Health Conditions: {health_conditions}
- Additional Conditions: {health_conditions_other}
- Injuries or limitations: {injuries}
- Current Medications: {medications}
- Sleep Quality: {sleep_quality} | Stress Level: {stress_level}/10
- Lifestyle: {lifestyle}

GOALS & CONTEXT:
- Primary Goal: {main_goal}
- Secondary Goals: {secondary_goals}
- Target Timeframe: {time_frame}
- Motivation Level: {motivation_level}/10
- Main Challenges: {challenges}
- Occupation: {occupation_activity}
- Location: {country}

**Workout Split & Environment Logic (MANDATORY)**:
  You must determine the optimal weekly training structure and exercise types based on:
   - Training Frequency: {exercise_frequency}
   - Training Environment: {training_environment}
   - Available Equipment: {equipment}
   - Main Goal: {main_goal}
   - Preferred Exercise Types: {preferred_exercise}

  The workout plan must ALWAYS include a logical training split and specific exercises per day.
  Each "workout" day must contain at least 4–8 exercises.

  PROGRAMMING PRINCIPLES:
   - Apply progressive overload, adjust volume by recovery (sleep/stress/age).
   - Match rep ranges and intensity to goal (fat loss, muscle gain, strength, endurance).
   - Adapt to equipment, environment, and injury limitations.

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🧩 SPLIT LOGIC BY FREQUENCY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • 1–2 days/week → Full Body each day (focus on compound, functional movements)
   • 3–4 days/week → Push/Pull or Upper/Lower Split
   • 5–6 days/week → Push/Pull/Legs or Upper/Lower/Conditioning
   • 7 days/week → Include at least 1–2 Active Recovery or Mobility days

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏋️ ENVIRONMENT LOGIC
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   **If training_environment includes "Gym":**
   - Use compound lifts + isolation work.
   - Leverage machines and free weights if “Full gym access” is available.
   - At least 5 exercises per day (2 compound, 2 isolation, 1 optional finisher).
   - Example: Push (Chest/Shoulders/Triceps), Pull (Back/Biceps), Legs (Quads/Hams/Glutes).

   **If training_environment includes "Home":**
   - Prioritize bodyweight + small equipment exercises.
   - Use resistance bands, dumbbells, or kettlebells if available.
   - Focus on circuits or supersets for time efficiency.
   - Example: Full Body Circuit, Lower Body Strength, Core + Mobility.

   **If training_environment includes "Outdoor":**
   - Include running, cycling, sprints, bodyweight circuits, and athletic drills.
   - Combine with calisthenics or endurance work.
   - Example: Interval Running, Hill Sprints, Outdoor HIIT, Sports Conditioning.

   **If multiple environments are selected:**
   - Alternate intelligently (e.g., Gym Mon/Wed/Fri, Home Tue/Thu, Outdoor Sat).

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 GOAL-SPECIFIC ADJUSTMENTS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   **Weight Loss / Fat Loss / Mild Weight Loss / Extreme Weight Loss:**
   - Include 3–4 resistance sessions + 2 cardio/HIIT sessions.
   - Add calorie-burning finishers or circuits.
   - Ensure progressive overload with moderate weights.

   **Build Muscle / Body Recomposition:**
   - Use Push/Pull/Legs or Upper/Lower split depending on frequency.
   - Focus on progressive overload, hypertrophy rep ranges (8–12 reps).
   - Ensure balanced muscle coverage (chest/back/legs/arms/shoulders/core).

   **Improve Strength:**
   - Prioritize compound lifts (squat, bench, deadlift, overhead press, rows).
   - 3–5 sets of 3–6 reps, longer rest, controlled tempo.

   **Improve Endurance / General Health / Cardio-focused goals:**
   - Include running, cycling, swimming, or circuit training.
   - Moderate weights, higher reps, less rest.
   - At least 2 dedicated cardio/endurance sessions per week.

   **Improve Flexibility / Mobility / Stress Reduction:**
   - Include yoga, mobility flows, stretching sessions.
   - At least 3 mobility-based sessions (30–45 minutes each).

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚙️ EXERCISE STRUCTURE RULES
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Each workout day must follow this structure:
   - 1–2 Compound Exercises (e.g. Squat, Deadlift, Bench, Pull-up)
   - 2–3 Isolation / Accessory Exercises (target secondary muscles)
   - 1 Core or Finisher Exercise (HIIT, cardio burst, abs)
   - Provide sets, reps, rest, tempo, and clear safety/form cues.
   - If equipment is limited, suggest bodyweight or band alternatives.

   Always list 5–8 total exercises per session for Gym or Full Equipment users.
   Always list 4–6 exercises for Home/Outdoor workouts.

OUTPUT FORMAT:
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

⚠️ For each workout day in "weekly_plan":
- Include a realistic split name (e.g., Push, Pull, Legs, Full Body, Conditioning)
- Provide 4–8 detailed exercises depending on training environment.
- Alternate muscle groups logically across the week.

QUALITY CONTROL CHECKLIST:
✓ Goal alignment: {main_goal} is primary focus
✓ Frequency matches: {exercise_frequency}
✓ Equipment is available: {equipment}
✓ Location feasible: {training_environment}
✓ Health conditions respected: {health_conditions_other}
✓ Recovery adequate for: Sleep {sleep_quality}, Stress {stress_level}/10
✓ Age-appropriate: {age} years
✓ Progressive overload built in
✓ Injury prevention emphasized
✓ Realistic time commitment
✓ Enjoyment factor (preferences: {preferred_exercise})
✓ Challenges addressed: {challenges}
✓ Alternative exercises provided
✓ Clear progression rules
✓ Sustainable long-term

Return ONLY valid JSON, no markdown, no commentary, no explanation. Ensure all strings are closed properly.
"""
