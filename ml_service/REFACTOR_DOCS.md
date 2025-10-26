# ML Service Refactor Documentation

## Overview

The ML service has been completely refactored from a monolithic 1,138-line `app.py` into a clean, modular architecture following best practices for Python FastAPI applications.

## Architecture

### Directory Structure

```
ml_service/
├── app_refactored.py          # Main FastAPI application (clean, <400 lines)
├── app.py                      # Legacy app (preserved for reference)
├── config/
│   ├── __init__.py
│   ├── settings.py             # Environment configuration management
│   └── logging_config.py       # Centralized logging with color support
├── models/
│   ├── __init__.py
│   └── quiz.py                 # Pydantic models for request/response schemas
├── prompts/
│   ├── __init__.py
│   ├── meal_plan.py            # Meal plan prompt template
│   └── workout_plan.py         # Workout plan prompt template
├── services/
│   ├── __init__.py
│   ├── ai_service.py           # AI provider interactions with error handling
│   └── database.py             # Database connection and operations
├── utils/
│   ├── __init__.py
│   ├── calculations.py         # Nutrition calculations with type hints
│   └── converters.py           # Measurement conversion utilities
└── requirements.txt
```

## Key Improvements

### 1. Separation of Concerns

**Before:** All functionality mixed in one file
**After:** Each module has a single, clear responsibility

- **config/**: Application configuration and logging
- **models/**: Data validation and serialization
- **prompts/**: AI prompt templates
- **services/**: Business logic and external integrations
- **utils/**: Reusable utility functions

### 2. Comprehensive Type Hints

All functions now include complete type annotations:

```python
def calculate_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    body_fat_pct: Optional[float] = None
) -> float:
    """Calculate Basal Metabolic Rate with optional Katch-McArdle formula"""
    ...
```

### 3. Error Handling

Comprehensive error handling at every layer:

```python
try:
    meal_plan = ai_service.generate_plan(prompt, provider, model, user_id)
except HTTPException:
    raise  # Re-raise HTTP exceptions
except Exception as e:
    log_error(e, "Meal plan generation", user_id)
    raise HTTPException(status_code=500, detail=str(e))
```

### 4. Centralized Logging

Enhanced logging with:
- Color-coded log levels
- Structured log messages
- Request/response tracking
- Performance monitoring

```python
from config.logging_config import logger, log_api_request, log_api_response

log_api_request("/generate-meal-plan", user_id, provider, model)
# ... perform operation ...
log_api_response("/generate-meal-plan", user_id, success=True, duration_ms=1234)
```

### 5. Configuration Management

Environment variables managed through a Settings class:

```python
from config.settings import settings

# Access configuration
api_key = settings.OPENAI_API_KEY
max_tokens = settings.AI_MAX_TOKENS

# Validate providers
if settings.validate_ai_provider("openai"):
    # Provider is configured and ready
```

## Module Details

### config/settings.py

Manages all environment variables and application configuration:

- API keys for multiple AI providers
- Database connection parameters
- CORS configuration
- AI model defaults
- Logging configuration

**Key Features:**
- Property methods for checking provider availability
- Validation methods for AI providers
- Centralized default values

### config/logging_config.py

Provides structured, colored logging:

```python
from config.logging_config import logger, log_error, log_api_request

logger.info("Application started")
log_api_request("/endpoint", user_id="123", provider="openai")
log_error(exception, "Context description", user_id="123")
```

**Features:**
- Color-coded log levels (DEBUG=cyan, INFO=green, ERROR=red, etc.)
- Convenience functions for common log patterns
- Automatic exception tracing
- Structured log messages

### models/quiz.py

Pydantic models with validation:

```python
class QuizAnswers(BaseModel):
    age: Union[str, int]
    gender: str
    height: LengthMeasurement
    currentWeight: WeightMeasurement
    motivationLevel: int = Field(ge=1, le=10)  # 1-10 validation
    # ... more fields
```

**Benefits:**
- Automatic validation
- Type safety
- Clear API documentation
- JSON serialization

### services/ai_service.py

Handles all AI provider interactions:

```python
from services.ai_service import ai_service

# Generate plan with any provider
plan = ai_service.generate_plan(
    prompt=formatted_prompt,
    provider="openai",  # or "anthropic", "gemini", etc.
    model="gpt-4o-mini",
    user_id="user-123"
)
```

**Features:**
- Multiple AI provider support (OpenAI, Anthropic, Gemini, Llama)
- Automatic JSON cleaning and parsing
- Comprehensive error handling
- Provider availability checking
- Detailed error messages

### services/database.py

Database operations with connection pooling:

```python
from services.database import db_service

# Initialize on startup
await db_service.initialize()

# Save meal plan
await db_service.save_meal_plan(user_id, quiz_id, plan_data, calories, prefs, restrictions)

# Close on shutdown
await db_service.close()
```

**Features:**
- AsyncPG connection pooling
- Context manager for connections
- Graceful failure handling (continues without DB if unavailable)
- Structured error logging

### utils/calculations.py

Comprehensive nutrition calculations:

```python
from utils.calculations import calculate_nutrition_profile, calculate_bmr, calculate_tdee

# Calculate complete profile
profile = calculate_nutrition_profile(quiz_answers)
# Returns: BMI, BMR, TDEE, goal calories, macros, estimated weeks, etc.

# Individual calculations
bmr = calculate_bmr(weight_kg, height_cm, age, gender, body_fat_pct)
tdee = calculate_tdee(bmr, exercise_freq, occupation)
```

**Features:**
- Katch-McArdle formula for BMR (when body fat % available)
- Mifflin-St Jeor equation fallback
- Navy method for body fat calculation
- Goal-specific calorie adjustments
- Safety limits to prevent unhealthy targets

### utils/converters.py

Measurement conversion utilities:

```python
from utils.converters import parse_weight, parse_height, cm_to_feet_inches

# Parse various formats
kg, display, unit = parse_weight({"lbs": 154})  # (69.85, "154 lbs", "lbs")
cm, display, unit = parse_height({"ft": 5, "inch": 10})  # (177.8, "5'10\"", "ft/in")

# Direct conversions
feet, inches = cm_to_feet_inches(180)  # (5, 11)
```

## Usage

### Running the Refactored Service

```bash
# Using the refactored app
python ml_service/app_refactored.py

# Or with uvicorn directly
uvicorn app_refactored:app --host 0.0.0.0 --port 8000 --reload
```

### Environment Variables

Required `.env` file:

```env
# AI Provider API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
LLAMA_API_KEY=...

# Database Configuration (optional, service works without DB)
user=postgres
password=your_password
host=localhost
port=5432
dbname=your_database

# Application Configuration (optional)
APP_HOST=0.0.0.0
APP_PORT=8000
LOG_LEVEL=INFO
DEFAULT_AI_PROVIDER=openai
DEFAULT_MODEL_NAME=gpt-4o-mini
```

### API Endpoints

#### Health Check
```bash
GET /health
```

Returns service status and available AI providers.

#### Generate Meal Plan
```bash
POST /generate-meal-plan
Content-Type: application/json

{
  "user_id": "user-123",
  "quiz_result_id": "quiz-456",
  "ai_provider": "openai",
  "model_name": "gpt-4o-mini",
  "answers": { ... }
}
```

#### Generate Workout Plan
```bash
POST /generate-workout-plan
# Same request structure as meal plan
```

#### Generate Complete Plan
```bash
POST /generate-complete-plan
# Generates both meal and workout plans in one call
```

## Migration Guide

### From Legacy app.py

The legacy `app.py` is preserved for reference. To migrate:

1. **Update imports:**
   ```python
   # Old
   from app import MEAL_PLAN_PROMPT

   # New
   from prompts.meal_plan import MEAL_PLAN_PROMPT
   ```

2. **Use service instances:**
   ```python
   # Old
   openai_client.chat.completions.create(...)

   # New
   ai_service.generate_plan(prompt, provider, model, user_id)
   ```

3. **Update configuration access:**
   ```python
   # Old
   OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

   # New
   from config.settings import settings
   api_key = settings.OPENAI_API_KEY
   ```

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test meal plan generation
curl -X POST http://localhost:8000/generate-meal-plan \
  -H "Content-Type: application/json" \
  -d @test_request.json
```

## Performance Monitoring

All API calls are automatically logged with duration:

```
2024-10-26 12:00:00 - ml_service - INFO - API Request: /generate-meal-plan | User: user-123 | Provider: openai | Model: gpt-4o-mini
2024-10-26 12:00:02 - ml_service - INFO - API Response: /generate-meal-plan | User: user-123 | Status: SUCCESS | Duration: 1850.23ms
```

## Benefits Summary

1. **Maintainability**: Clear module boundaries, easy to understand and modify
2. **Testability**: Each module can be tested independently
3. **Scalability**: Easy to add new AI providers or features
4. **Reliability**: Comprehensive error handling and logging
5. **Type Safety**: Full type hints prevent common bugs
6. **Documentation**: Clear docstrings and structured code
7. **Performance**: Connection pooling and efficient resource management

## Future Enhancements

Potential improvements:

1. Add caching layer for frequent calculations
2. Implement rate limiting for AI API calls
3. Add more AI providers (Cohere, etc.)
4. Create service health metrics endpoint
5. Add automated tests
6. Implement request queuing for high load
7. Add API versioning

## Support

For issues or questions about the refactored ML service:

1. Check logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure at least one AI provider API key is configured
4. Review this documentation for usage examples
