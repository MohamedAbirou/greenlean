# GreenLean AI ML Service

AI-powered meal and workout plan generation service using OpenAI GPT and Anthropic Claude.

## Features

- **AI Meal Plan Generation**: Personalized daily meal plans with detailed recipes, portions, and macros
- **AI Workout Plan Generation**: Customized weekly workout schedules with exercises, sets, reps, and form instructions
- **Database Integration**: Automatic storage of generated plans in Supabase
- **Multiple AI Providers**: Support for OpenAI and Anthropic models
- **Health-Conscious**: Considers dietary restrictions, health conditions, and fitness goals

## Setup

### 1. Install Dependencies

```bash
cd ml_service
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the `ml_service` directory:

```env
# Database
DATABASE_URL=your_supabase_database_url

# AI Providers (at least one required)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
LLAMA_API_KEY=your_llama_api_key
```

### 3. Run the Service

```bash
python main.py
```

The service will run on `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

Returns service status and available AI providers.

### Generate Meal Plan
```
POST /generate-meal-plan
```

Body:
```json
{
  "user_id": "uuid",
  "quiz_result_id": "uuid",
  "answers": {
    "age": 30,
    "gender": "Male",
    "weight": 75,
    "height": 180,
    "goal_weight": 70,
    "activity_level": "Moderately active",
    "diet_type": "None",
    "goal": "Lose fat",
    "meals_per_day": "3 (standard)",
    "cuisine": "Italian cuisine",
    "health_conditions": "None",
    "exercise_time": "30-60 minutes",
    "exercise_preference": "Cardio"
  },
  "calculations": {
    "bmi": 23.1,
    "bmr": 1750,
    "tdee": 2400,
    "goalCalories": 1900,
    "goalWeight": 70
  },
  "ai_provider": "openai",
  "model_name": "gpt-4o-mini"
}
```

### Generate Workout Plan
```
POST /generate-workout-plan
```

Same body structure as meal plan endpoint.

### Generate Complete Plan
```
POST /generate-complete-plan
```

Generates both meal and workout plans in one request. Same body structure.

## Response Format

### Meal Plan Response
```json
{
  "success": true,
  "meal_plan": {
    "meals": [
      {
        "meal_type": "breakfast",
        "meal_name": "Protein-Packed Breakfast Bowl",
        "prep_time_minutes": 15,
        "foods": [
          {
            "name": "Oatmeal",
            "portion": "1 cup cooked",
            "grams": 240,
            "calories": 150,
            "protein": 5,
            "carbs": 27,
            "fats": 3
          }
        ],
        "recipe": "Cook oatmeal according to package directions...",
        "total_calories": 400,
        "total_protein": 25,
        "total_carbs": 45,
        "total_fats": 12
      }
    ],
    "daily_totals": {
      "calories": 1900,
      "protein": 140,
      "carbs": 180,
      "fats": 60
    },
    "hydration_recommendation": "8-10 glasses of water",
    "tips": ["Meal prep tip", "Nutrition advice"]
  },
  "macros": {
    "protein": 140,
    "carbs": 180,
    "fats": 60
  },
  "message": "Meal plan generated successfully"
}
```

### Workout Plan Response
```json
{
  "success": true,
  "workout_plan": {
    "weekly_plan": [
      {
        "day": "Monday",
        "workout_type": "Upper Body Strength",
        "duration_minutes": 45,
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": "12-15",
            "rest_seconds": 60,
            "instructions": "Keep core tight...",
            "muscle_groups": ["chest", "triceps"],
            "difficulty": "beginner"
          }
        ],
        "warmup": "5 min light cardio",
        "cooldown": "5 min stretching",
        "estimated_calories_burned": 250
      }
    ],
    "weekly_summary": {
      "total_workout_days": 5,
      "rest_days": 2,
      "total_time_minutes": 225,
      "estimated_weekly_calories_burned": 1200
    },
    "tips": ["Progressive overload", "Recovery tips"],
    "notes": "Adjust based on your fitness level"
  },
  "message": "Workout plan generated successfully"
}
```

## Integration with Frontend

The frontend automatically calls the ML service when users complete the quiz. Plans are:
1. Generated via AI
2. Stored in Supabase database
3. Cached in localStorage for instant access
4. Displayed in the enhanced dashboard sections

## Supported AI Models

- **OpenAI**: gpt-4o, gpt-4o-mini, gpt-4-turbo
- **Anthropic**: claude-3-5-sonnet, claude-3-opus, claude-3-sonnet
- **Gemini**: (configured but not currently used)
- **Llama**: (configured but not currently used)

## Error Handling

The service includes comprehensive error handling:
- JSON parsing errors
- AI provider failures
- Database connection issues
- Invalid input validation

All errors are logged and returned with appropriate HTTP status codes.

## Production Deployment

### Docker
```bash
docker build -t greenlean-ml-service .
docker run -p 8000:8000 --env-file .env greenlean-ml-service
```

### Environment Variables for Production
Ensure these are set in your production environment:
- `DATABASE_URL`: Production Supabase URL
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: At least one AI provider
- Consider rate limiting and caching for cost optimization

## Development

### Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test meal plan generation
curl -X POST http://localhost:8000/generate-meal-plan \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## Cost Optimization

1. **Use gpt-4o-mini**: Much cheaper than GPT-4 for similar quality
2. **Cache Plans**: Store generated plans to avoid regeneration
3. **Batch Requests**: Generate both meal and workout plans together
4. **Rate Limiting**: Implement per-user limits
5. **Fallback Models**: Use cheaper models as fallbacks

## License

MIT
