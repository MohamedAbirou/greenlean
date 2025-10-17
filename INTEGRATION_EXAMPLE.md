# Integration Example: Enhanced Meal Generation System

This document provides a complete example of how to integrate the new enhanced meal generation system into your existing React + Supabase fitness platform.

## Quick Start

### 1. Database Setup

First, apply the new database schema:

```bash
# Apply the migration
supabase db push

# Or if using local development
supabase start
supabase db reset
```

### 2. ML Service Setup

Start the ML microservice:

```bash
# Using Docker Compose (recommended)
docker-compose up -d ml-service

# Or run directly
cd ml_service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Integration

Replace your existing meal plan component with the enhanced version:

```typescript
// In your Dashboard component
import EnhancedMealPlanSection from './components/dashboard/EnhancedMealPlanSection';

function Dashboard() {
  return (
    <div className="dashboard">
      {/* Replace your existing meal plan section */}
      <EnhancedMealPlanSection />
      
      {/* Other dashboard components */}
    </div>
  );
}
```

## Complete Integration Example

Here's a complete example showing how to integrate the system:

### 1. Update your main Dashboard component

```typescript
// src/pages/Dashboard.tsx
import React from 'react';
import { useMealPlanV2 } from '@/hooks/useMealPlanV2';
import EnhancedMealPlanSection from '@/components/dashboard/EnhancedMealPlanSection';
import { useAuth } from '@/contexts/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    meals, 
    loading, 
    error, 
    userProfile, 
    macroTargets, 
    mlEnabled,
    generateMealPlan,
    refreshMealPlan 
  } = useMealPlanV2();

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome back, {user.user_metadata?.full_name || 'User'}!
          </h1>
          
          {/* Enhanced Meal Plan Section */}
          <EnhancedMealPlanSection className="mb-8" />
          
          {/* Other dashboard sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress tracking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Progress Tracking</h2>
              {/* Your progress components */}
            </div>
            
            {/* Quick actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={refreshMealPlan}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Refresh Meal Plan
                </button>
                <button
                  onClick={() => window.location.href = '/quiz'}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Retake Health Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

### 2. Add environment variables

```bash
# .env.local
REACT_APP_ML_SERVICE_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Update your package.json dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "asyncpg": "^0.29.0",
    "fastapi": "^0.104.1",
    "pandas": "^2.1.3",
    "scikit-learn": "^1.3.2"
  }
}
```

## Real-World Usage Scenarios

### Scenario 1: Diabetic User with Weight Loss Goal

```typescript
// User Profile
const diabeticUser = {
  userId: "user_123",
  age: 45,
  gender: "Female",
  weight: 80,
  height: 165,
  goalWeight: 70,
  activityLevel: "Moderately active",
  dietType: "Vegetarian",
  goal: "Lose fat",
  mealsPerDay: 3,
  healthConditions: { diabetes: true },
  dietaryRestrictions: ["meat"],
  exerciseTime: "30–60 minutes",
  exerciseType: "Cardio"
};

// Generated Meal Plan
const diabeticMealPlan = [
  {
    name: "Breakfast",
    items: [
      { food: "Oats", grams: 60, protein: 7.8, carbs: 40.2, fats: 4.2, calories: 233 },
      { food: "Greek Yogurt", grams: 180, protein: 18, carbs: 7.2, fats: 0.7, calories: 106 },
      { food: "Berries", grams: 96, protein: 1, carbs: 11.5, fats: 0.3, calories: 55 },
      { food: "Almonds", grams: 18, protein: 3.8, carbs: 4, fats: 8.8, calories: 104 }
    ],
    total: { protein: 30.6, carbs: 62.9, fats: 14, calories: 498 },
    macroAlignmentScore: 0.92,
    healthConditionScore: 0.88, // High score for diabetes-friendly foods
    varietyScore: 0.75,
    totalScore: 0.87,
    generationReason: "Selected for: excellent macro alignment, beneficial for health conditions, adds variety to diet"
  },
  {
    name: "Lunch",
    items: [
      { food: "Lentils", grams: 240, protein: 21.6, carbs: 48, fats: 1, calories: 278 },
      { food: "Quinoa", grams: 144, protein: 5.9, carbs: 30.2, fats: 2.7, calories: 173 },
      { food: "Broccoli", grams: 120, protein: 3.6, carbs: 8.4, fats: 0.4, calories: 41 },
      { food: "Olive Oil", grams: 12, protein: 0, carbs: 0, fats: 12, calories: 106 }
    ],
    total: { protein: 31.1, carbs: 86.6, fats: 16.1, calories: 598 },
    macroAlignmentScore: 0.88,
    healthConditionScore: 0.90, // Excellent for diabetes
    varietyScore: 0.80,
    totalScore: 0.89,
    generationReason: "Selected for: excellent macro alignment, beneficial for health conditions, adds variety to diet"
  },
  {
    name: "Dinner",
    items: [
      { food: "Tofu", grams: 180, protein: 14.4, carbs: 3.6, fats: 9, calories: 137 },
      { food: "Sweet Potato", grams: 180, protein: 3.6, carbs: 36, fats: 0, calories: 155 },
      { food: "Spinach", grams: 60, protein: 1.8, carbs: 2.4, fats: 0.2, calories: 14 },
      { food: "Mushrooms", grams: 72, protein: 2.2, carbs: 2.2, fats: 0.2, calories: 16 }
    ],
    total: { protein: 22, carbs: 44.2, fats: 9.4, calories: 322 },
    macroAlignmentScore: 0.85,
    healthConditionScore: 0.82, // Good for diabetes
    varietyScore: 0.70,
    totalScore: 0.84,
    generationReason: "Selected for: excellent macro alignment, beneficial for health conditions"
  }
];
```

### Scenario 2: Muscle Building User with Heart Disease

```typescript
// User Profile
const muscleBuildingUser = {
  userId: "user_456",
  age: 28,
  gender: "Male",
  weight: 75,
  height: 180,
  goalWeight: 85,
  activityLevel: "Very active",
  dietType: "Omnivore",
  goal: "Build muscle",
  mealsPerDay: 4,
  healthConditions: { heartDisease: true },
  dietaryRestrictions: [],
  exerciseTime: "More than 1 hour",
  exerciseType: "Strength training"
};

// Generated Meal Plan (showing key differences)
const muscleBuildingMealPlan = [
  {
    name: "Breakfast",
    items: [
      { food: "Eggs", grams: 150, protein: 19.5, carbs: 1.5, fats: 16.5, calories: 233 },
      { food: "Whole Wheat Bread", grams: 60, protein: 7.8, carbs: 24.6, fats: 2.4, calories: 148 },
      { food: "Avocado", grams: 60, protein: 1.2, carbs: 5.4, fats: 9, calories: 96 },
      { food: "Olive Oil", grams: 8, protein: 0, carbs: 0, fats: 8, calories: 71 }
    ],
    total: { protein: 28.5, carbs: 31.5, fats: 35.9, calories: 548 },
    macroAlignmentScore: 0.90, // High protein for muscle building
    healthConditionScore: 0.85, // Heart-healthy fats
    varietyScore: 0.75,
    totalScore: 0.88,
    generationReason: "Selected for: excellent macro alignment, beneficial for health conditions, adds variety to diet"
  }
  // ... more meals with higher protein content
];
```

## ML Service Integration

### Submit User Feedback

```typescript
import { mlService } from '@/services/mlService';

// When user rates a meal
const handleMealRating = async (mealId: string, rating: number) => {
  try {
    await mlService.submitFeedback({
      mealId,
      mealName: "Lentil Quinoa Bowl",
      templateName: "Lentil Quinoa Bowl",
      rating,
      liked: rating >= 4,
      satietyScore: 4,
      goalProgressScore: 5,
      consumed: true,
      consumedDate: new Date().toISOString().split('T')[0]
    });
    
    console.log('Feedback submitted successfully');
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};
```

### Get ML Predictions

```typescript
// Get personalized meal recommendations
const getPersonalizedRecommendations = async () => {
  try {
    const prediction = await mlService.getMealPrediction({
      user_id: user.id,
      user_profile: userProfile,
      macro_targets: macroTargets,
      meal_type: "lunch",
      available_templates: ["Lentil Quinoa Bowl", "Chicken Rice Bowl", "Tofu Stir-fry"]
    });
    
    console.log('ML Prediction:', prediction);
    // Use prediction.recommended_templates and prediction.portion_sizes
  } catch (error) {
    console.error('Error getting ML prediction:', error);
  }
};
```

## Monitoring and Analytics

### Track Model Performance

```typescript
import { useModelPerformance } from '@/hooks/useMealPlanV2';

function AdminDashboard() {
  const { performance, loading, error, refresh } = useModelPerformance();
  
  return (
    <div>
      <h2>ML Model Performance</h2>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {performance.map((metric, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{metric.model_name}</h3>
            <p className="text-sm text-gray-600">{metric.metric_name}</p>
            <p className="text-2xl font-bold text-blue-600">
              {metric.metric_value.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(metric.evaluation_date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      
      <button onClick={refresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Refresh Metrics
      </button>
    </div>
  );
}
```

## Testing the Integration

Run the test script to verify everything is working:

```bash
node test_meal_generation.js
```

Expected output:
```
🚀 Starting Enhanced Meal Generation System Tests

🧪 Testing Health Condition Filtering...
✅ Lentils beneficial for diabetes: true
✅ Tofu has soy restriction: true
✅ Test 1 passed

🧪 Testing Macro Scaling...
Base calories: 425
Scale factor: 1.18
✅ Scale factor is valid: true
✅ Test 2 passed

🧪 Testing Goal-Based Macro Adjustments...
✅ Lose fat: 100.0% total (valid)
✅ Build muscle: 100.0% total (valid)
✅ Maintain weight: 100.0% total (valid)
✅ Keto: 100.0% total (valid)
✅ Test 3 passed

🧪 Testing Template Scoring System...
Health score: 0.70
Total score: 0.70
✅ Template scoring working: true
✅ Test 4 passed

🧪 Testing User Profile Conversion...
✅ User Profile:
  - Age: 30
  - Goal: Lose fat
  - Diet: Vegetarian
  - Health: diabetes
  - Meals/day: 3
✅ Test 5 passed

🧪 Testing ML Integration...
✅ ML Prediction:
  - Recommended: Lentil Quinoa Bowl, Chickpea Rice Bowl, Tofu Stir-fry
  - Confidence: 85.0%
  - Reasoning: Selected based on diabetes-friendly ingredients and macro alignment
✅ Test 6 passed

🧪 Testing Feedback System...
✅ Feedback Data:
  - Rating: 4/5
  - Liked: true
  - Satiety: 4/5
  - Goal Progress: 5/5
  - Consumed: true
✅ Test 7 passed

🎯 Test Results: 7/7 tests passed
🎉 All tests passed! The enhanced meal generation system is working correctly.
```

## Troubleshooting

### Common Issues

1. **ML Service Not Available**
   - Check if the service is running: `curl http://localhost:8000/health`
   - Verify environment variables are set correctly
   - The system will fall back to rule-based predictions

2. **Database Connection Issues**
   - Ensure Supabase is running and accessible
   - Check database URL and credentials
   - Verify RLS policies are set up correctly

3. **Meal Generation Fails**
   - Check if user has completed the health quiz
   - Verify food database is populated
   - Check console for detailed error messages

### Performance Optimization

1. **Caching**
   - Implement Redis caching for frequently accessed data
   - Cache ML predictions for similar user profiles
   - Use React Query for client-side caching

2. **Batch Processing**
   - Batch user feedback submissions
   - Process ML training in background jobs
   - Use database connection pooling

3. **Monitoring**
   - Set up alerts for ML service health
   - Monitor database performance
   - Track user engagement metrics

This integration example provides a complete, production-ready implementation of the enhanced meal generation system that addresses all the original issues while adding powerful ML capabilities for continuous improvement.
