MEAL_PLAN_JSON_FORMAT="""
Return ONLY valid JSON — no markdown or extra explanations.
Use this **exact structure and field names**:

{{
  "meals": [
    {{
      "meal_type": "breakfast/lunch/dinner/snack",
      "meal_name": "Creative, appetizing name (e.g., 'Mediterranean Power Bowl')",
      "prep_time_minutes": 10-30,
      "difficulty": "easy/medium/advanced",
      "meal_timing": "Specific realistic range like '7:00 AM - 8:00 AM'",
      "total_calories": number,
      "total_protein": number,
      "total_carbs": number,
      "total_fats": number,
      "total_fiber": number,
      "tags": ["short descriptive tags, like 'high-protein', 'quick', 'gut-friendly'"],
      "foods": [
        {{
          "name": "Food item name",
          "portion": "e.g., 1 cup / 150g / 2 slices",
          "grams": number,
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
        }}
      ],
      "recipe": "Full recipe instructions on how to exactly cook each mean written as natural text, not a list.",
      "tips": ["2-3 short practical tips about preparation, substitutions, or storage."]
    }}
  ],
  "daily_totals": {{
    "calories": {daily_calories},
    "protein": {protein},
    "carbs": {carbs},
    "fats": {fats},
    "fiber": 25,
    "variance": "± 5%"
  }},
  "hydration_plan": {{
    "daily_water_intake": "Quantify clearly, e.g. '3–4 liters (12–16 cups)'",
    "timing": [
      "Morning: 2 glasses upon waking",
      "Pre-workout: 1–2 glasses 30 min before",
      "During workout: Sip every 15–20 min",
      "Post-workout: 2–3 glasses",
      "With meals: 1 glass each",
      "Before bed: 1 glass"
    ],
    "electrolyte_needs": "Add electrolytes if exercising >60 min or in hot climate"
  }},
  "shopping_list": {{
    "proteins": ["List of all protein items with estimated weekly quantity"],
    "vegetables": ["List of vegetables required for all meals"],
    "carbs": ["List of carbohydrate sources"],
    "fats": ["Healthy fat sources used"],
    "pantry_staples": ["Condiments, herbs, spices, sauces"],
    "estimated_cost": "Estimated weekly cost aligned with {grocery_budget}"
  }},
  "personalized_tips": [
    "💡 Tip addressing {challenges}",
    "🎯 Motivation boost based on motivation level {motivation_level}/10",
    "😌 Stress management nutrition tip (stress level {stress_level}/10)",
    "😴 Sleep optimization nutrition tip for {sleep_quality}",
    "🏋️ Goal-specific advice for {main_goal}",
    "🧘 Reminder: Use this plan as guidance, not a rulebook — adjust portions based on hunger and energy levels."
  ],
  "meal_prep_strategy": {{
    "batch_cooking": ["Batch ideas, e.g., cook 4 chicken breasts on Sunday", "Prep grains ahead"],
    "storage_tips": ["Storage times and methods for cooked meals"],
    "time_saving_hacks": ["Practical hacks based on {cooking_time} constraint"]
  }}
}}
"""