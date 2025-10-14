# Enhanced Meal Generation System

## Overview

This document describes the comprehensive meal generation system that addresses all the issues in the original implementation. The new system provides intelligent meal recommendations with health condition filtering, macro scaling, ML-powered predictions, and user feedback integration.

## Key Improvements

### 1. **Health Condition Filtering**
- ✅ **Fixed**: Foods now properly map to user conditions (diabetes, heart disease, thyroid issues)
- ✅ **Enhanced**: Comprehensive food health mappings with benefit scores
- ✅ **Safe**: Ensures meals are safe for users with serious conditions

### 2. **Accurate Macro Scaling**
- ✅ **Fixed**: Meals now consistently meet target calories and macro ratios
- ✅ **Intelligent**: Optimized scaling factor selection for best macro alignment
- ✅ **Goal-aware**: Different macro distributions for different goals (lose fat, build muscle, etc.)

### 3. **Goal-Based Adjustments**
- ✅ **Fixed**: Goals now properly adjust macro ratios, not just calorie distribution
- ✅ **Comprehensive**: Different protein/carb/fat ratios for each goal type
- ✅ **Health-aware**: Adjusts ratios based on health conditions

### 4. **Intelligent Template Selection**
- ✅ **Fixed**: No more random selection when templates are exhausted
- ✅ **Scoring System**: Multi-criteria scoring (macro alignment, health conditions, variety, user preferences)
- ✅ **Smart Substitution**: Intelligent fallbacks with reasoning

### 5. **Human-Readable Quiz Processing**
- ✅ **Fixed**: Quiz answers now use structured UserProfile instead of brittle index access
- ✅ **Type-safe**: Full TypeScript support with proper interfaces
- ✅ **Extensible**: Easy to add new quiz questions and processing logic

### 6. **Learning Mechanism**
- ✅ **New**: ML-powered meal recommendations based on user feedback
- ✅ **Continuous Learning**: System improves from user ratings, satiety scores, and goal progress
- ✅ **Personalization**: Adapts to individual user preferences over time

## Architecture

### Frontend Components

#### 1. **MealGeneratorV2** (`src/utils/mealGenerationV2.ts`)
The core meal generation engine with:
- Intelligent template scoring and selection
- Health condition filtering
- Macro optimization
- User preference integration
- Comprehensive logging

#### 2. **ML Service Integration** (`src/services/mlService.ts`)
Handles communication with the Python ML microservice:
- User feedback submission
- ML prediction requests
- Model performance monitoring
- Fallback mechanisms

#### 3. **Enhanced Hooks** (`src/hooks/useMealPlanV2.ts`)
React hooks for:
- Meal plan generation and management
- User feedback handling
- ML prediction integration
- State management

#### 4. **UI Components**
- **EnhancedMealPlanSection**: Displays meals with scoring information
- **MealFeedback**: User feedback collection interface
- **ML Performance Dashboard**: Model monitoring (admin)

### Backend Components

#### 1. **Python ML Microservice** (`ml_service/`)
FastAPI-based service providing:
- User feedback processing
- ML model training and prediction
- Model performance tracking
- RESTful API endpoints

#### 2. **Supabase Schema** (`supabase/migrations/`)
Enhanced database schema with:
- User feedback storage
- ML training data
- Food health mappings
- User preferences
- Generation logs

## Usage Examples

### Basic Meal Generation

```typescript
import { MealGeneratorV2, convertQuizAnswersToUserProfile, calculateMacroTargets } from './utils/mealGenerationV2';

// Convert quiz answers to structured profile
const userProfile = convertQuizAnswersToUserProfile(quizAnswers, userId);

// Calculate macro targets
const macroTargets = calculateMacroTargets(userProfile, dailyCalories);

// Generate meal plan
const generator = new MealGeneratorV2({
  enableMLPredictions: true,
  maxTemplatesToConsider: 15,
  minTemplateScore: 0.2,
  macroTolerance: 0.15,
  healthConditionWeight: 0.3,
  varietyWeight: 0.2,
  userPreferenceWeight: 0.25,
  macroAlignmentWeight: 0.25
});

const meals = await generator.generateMealPlan(userProfile, macroTargets);
```

### React Hook Usage

```typescript
import { useMealPlanV2 } from './hooks/useMealPlanV2';

function MealPlanComponent() {
  const {
    meals,
    loading,
    error,
    userProfile,
    macroTargets,
    mlEnabled,
    generateMealPlan,
    submitFeedback
  } = useMealPlanV2();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {meals?.map((meal, index) => (
        <div key={index}>
          <h3>{meal.name}</h3>
          <p>Calories: {meal.total.calories}</p>
          <p>Macro Score: {meal.macroAlignmentScore}</p>
          <p>Health Score: {meal.healthConditionScore}</p>
          <button onClick={() => submitFeedback({
            mealId: `meal_${index}`,
            mealName: meal.name,
            rating: 5,
            liked: true
          })}>
            Rate Meal
          </button>
        </div>
      ))}
    </div>
  );
}
```

### ML Service Integration

```typescript
import { mlService } from './services/mlService';

// Submit user feedback
await mlService.submitFeedback({
  mealId: 'meal_123',
  mealName: 'Chicken & Rice Bowl',
  templateName: 'Chicken Rice Bowl',
  rating: 4,
  liked: true,
  satietyScore: 4,
  goalProgressScore: 5,
  consumed: true,
  consumedDate: '2024-01-15'
});

// Get ML prediction
const prediction = await mlService.getMealPrediction({
  user_id: userId,
  user_profile: userProfile,
  macro_targets: macroTargets,
  meal_type: 'lunch',
  available_templates: ['Chicken Rice Bowl', 'Salmon Quinoa Bowl', 'Tofu Stir-fry']
});
```

## Dynamic Scaling Example

Here's how the system dynamically scales meals for different diet types:

### Keto Diet Example

```typescript
// User Profile
const ketoUser = {
  goal: 'Lose fat',
  dietType: 'Keto',
  healthConditions: { diabetes: true },
  mealsPerDay: 3
};

// Macro Targets (automatically adjusted for keto)
const ketoMacros = {
  protein: 120,    // 20% of calories
  carbs: 30,       // 5% of calories  
  fats: 150,       // 75% of calories
  calories: 1800
};

// Generated Meal: "Avocado Scrambled Eggs"
const ketoMeal = {
  name: "Breakfast",
  items: [
    { food: "Egg", grams: 180, protein: 23.4, carbs: 1.8, fats: 19.8, calories: 279 },
    { food: "Avocado", grams: 96, protein: 1.9, carbs: 8.6, fats: 14.4, calories: 154 },
    { food: "Olive Oil", grams: 12, protein: 0, carbs: 0, fats: 12, calories: 106 }
  ],
  total: { protein: 25.3, carbs: 10.4, fats: 46.2, calories: 539 },
  macroAlignmentScore: 0.92,  // Excellent alignment with keto macros
  healthConditionScore: 0.85, // Good for diabetes
  varietyScore: 0.70,
  totalScore: 0.84,
  generationReason: "Selected for: excellent macro alignment, beneficial for health conditions"
};
```

### Vegetarian Muscle Building Example

```typescript
// User Profile
const vegetarianUser = {
  goal: 'Build muscle',
  dietType: 'Vegetarian',
  healthConditions: { heartDisease: true },
  mealsPerDay: 4
};

// Macro Targets (adjusted for muscle building)
const muscleMacros = {
  protein: 150,    // 30% of calories
  carbs: 225,      // 45% of calories
  fats: 83,        // 25% of calories
  calories: 2000
};

// Generated Meal: "Lentil Quinoa Power Bowl"
const muscleMeal = {
  name: "Lunch",
  items: [
    { food: "Lentils", grams: 240, protein: 21.6, carbs: 48, fats: 1.0, calories: 278 },
    { food: "Quinoa", grams: 144, protein: 5.9, carbs: 30.2, fats: 2.7, calories: 173 },
    { food: "Broccoli", grams: 120, protein: 3.6, carbs: 8.4, fats: 0.4, calories: 41 },
    { food: "Olive Oil", grams: 12, protein: 0, carbs: 0, fats: 12, calories: 106 }
  ],
  total: { protein: 31.1, carbs: 86.6, fats: 16.1, calories: 598 },
  macroAlignmentScore: 0.88,  // Excellent protein content
  healthConditionScore: 0.90, // Excellent for heart health
  varietyScore: 0.75,
  totalScore: 0.87,
  generationReason: "Selected for: excellent macro alignment, beneficial for health conditions, adds variety to diet"
};
```

## ML Learning Mechanism

The system learns from user feedback in several ways:

### 1. **Rating Prediction Model**
- Predicts user ratings (1-5) based on meal characteristics
- Uses features: macro alignment, health scores, user preferences, meal complexity
- Continuously improves with more feedback data

### 2. **Satiety Prediction Model**
- Predicts how satisfied users will feel after eating
- Considers protein content, fiber, meal size, and user history
- Helps optimize portion sizes and meal composition

### 3. **Goal Progress Model**
- Predicts how well meals support user goals
- Considers goal type, macro ratios, and user progress history
- Adjusts recommendations based on actual progress

### 4. **Template Selection Model**
- Learns which templates work best for different user profiles
- Considers user preferences, health conditions, and feedback
- Continuously refines template selection algorithm

## Database Schema

### Key Tables

1. **meal_feedback**: User ratings and feedback
2. **meal_generation_logs**: Generation decisions and scores
3. **food_health_mappings**: Food-health condition relationships
4. **user_preferences**: Learned user preferences
5. **ml_model_performance**: Model accuracy tracking

### Example Queries

```sql
-- Get user's meal preferences
SELECT preference_key, preference_value, confidence 
FROM user_preferences 
WHERE user_id = $1 AND preference_type = 'food_likes'
ORDER BY confidence DESC;

-- Get health condition mappings for a food
SELECT health_condition, benefit_type, benefit_score 
FROM food_health_mappings 
WHERE food_key = 'salmon';

-- Get model performance
SELECT model_version, metric_name, metric_value, evaluation_date
FROM ml_model_performance 
ORDER BY evaluation_date DESC;
```

## Deployment

### 1. **Frontend Deployment**
- Deploy React app with new components
- Set environment variables for ML service URL
- Update existing dashboard to use new meal generation

### 2. **ML Service Deployment**
```bash
# Build and run ML service
cd ml_service
docker build -t meal-ml-service .
docker run -p 8000:8000 meal-ml-service

# Or run directly
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. **Database Migration**
```bash
# Apply new schema
supabase db push
```

## Monitoring and Maintenance

### 1. **Model Performance Monitoring**
- Track model accuracy over time
- Monitor prediction confidence
- Alert on performance degradation

### 2. **User Feedback Analysis**
- Analyze feedback patterns
- Identify popular/unpopular meals
- Track goal progress correlation

### 3. **System Health Checks**
- ML service availability
- Database connectivity
- Model loading status

## Future Enhancements

1. **Advanced ML Models**
   - Deep learning for complex pattern recognition
   - Reinforcement learning for optimal meal sequences
   - Multi-objective optimization for conflicting goals

2. **Real-time Personalization**
   - Dynamic meal adjustments based on daily activity
   - Weather-based meal recommendations
   - Seasonal ingredient optimization

3. **Integration Features**
   - Grocery list generation
   - Meal prep scheduling
   - Restaurant recommendations
   - Social sharing and community features

4. **Health Monitoring**
   - Integration with fitness trackers
   - Blood glucose monitoring for diabetics
   - Weight tracking and adjustment

This enhanced meal generation system provides a robust, intelligent, and continuously improving solution for personalized nutrition recommendations.
