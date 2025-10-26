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

TRAINING ENVIRONMENT INTERPRETATION:
Based on user's selected environment: {training_environment}
- If "Gym" is selected: Provide gym-based exercises for those days
- If "Home" is selected: Use bodyweight/minimal equipment for home days
- If "Outdoor" is selected: Include outdoor activities (running, calisthenics, sports)
- If multiple selected: Strategically alternate throughout the week
Available Equipment: {equipment}

PROGRAMMING PRINCIPLES:
1. **Goal-Specific Periodization**:
   - Lose fat: Higher volume, moderate intensity, metabolic conditioning
   - Build muscle: Progressive overload, hypertrophy rep ranges (8-12), adequate rest
   - Body recomposition: Mix strength (4-6 reps) + hypertrophy (8-12) + conditioning
   - Improve strength: Lower reps (3-5), longer rest, compound movements
   - Improve endurance: Higher reps (15+), shorter rest, circuit training
   - General health: Balanced approach with variety

2. **Recovery & Adaptation** (Critical):
   - Sleep Quality: {sleep_quality} → Adjust volume accordingly
   - Stress Level: {stress_level}/10 → Higher stress = lower volume/intensity
   - Age Factor: {age} years → Recovery needs and injury prevention
   - Medications: {medications} → Energy levels and recovery capacity

3. **Progressive Overload Strategy**:
   - Week 1-2: Adaptation phase (learn movements, build work capacity)
   - Week 3-4: Increase intensity (add weight, reduce rest)
   - Week 5-6: Peak volume (maximize stimulus)
   - Week 7: Deload (active recovery, reduced volume)

4. **Exercise Selection Logic**:
   - Respect injuries/limitations: {injuries}
   - Match equipment availability: {equipment}
   - Suit training environment: {training_environment}
   - Align with preferences: {preferred_exercise}
   - Consider IBS if applicable: Avoid excessive core compression exercises

5. **Time & Adherence Optimization**:
   - Exercise frequency: {exercise_frequency} → Realistic weekly commitment
   - Challenges: {challenges} → Address specific barriers
   - Motivation: {motivation_level}/10 → Adjust complexity and variety
   - Occupation: {occupation_activity} → Energy availability

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
      "if_low_energy": "Reduce sets by 25%, maintain intensity on key lifts"
    }},
    {{
      "day": "Tuesday",
      "workout_type": "Active Recovery / Mobility",
      "training_location": "Home or Outdoor",
      "focus": "Recovery, flexibility, stress reduction",
      "duration_minutes": 30,
      "intensity": "Low",
      "exercises": [
        {{
          "name": "Yoga Flow",
          "category": "mobility",
          "sets": 1,
          "reps": "20 minutes",
          "rest_seconds": 0,
          "instructions": "Gentle flow focusing on breath and movement quality",
          "muscle_groups": ["full body"],
          "difficulty": "beginner",
          "equipment_needed": ["yoga mat"],
          "alternatives": {{
            "home": "Follow online yoga video",
            "outdoor": "Light walk in nature",
            "easier": "Stretching routine",
            "if_busy": "10-min mobility routine"
          }}
        }}
      ],
      "purpose": "Facilitate recovery, reduce stress (current level: {stress_level}/10), improve sleep",
      "optional": true,
      "if_feeling_good": "Can do light cardio instead (20-30 min walk/bike)"
    }}
  ],
  "weekly_summary": {{
    "total_workout_days": 5,
    "strength_days": 3,
    "cardio_days": 2,
    "rest_days": 2,
    "total_time_minutes": 300,
    "total_exercises": 15,
    "difficulty_level": hard,
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
"""
"""
