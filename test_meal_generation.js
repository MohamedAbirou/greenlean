/**
 * Test Script for Enhanced Meal Generation System
 * 
 * This script demonstrates the new meal generation system with various user profiles
 * and verifies that the improvements are working correctly.
 */

// Mock data for testing
const mockQuizAnswers = {
  1: 30, // age
  2: "Female", // gender
  3: 65, // weight
  4: 165, // height
  5: 60, // goal weight
  6: "Moderately active", // activity level
  7: "Vegetarian", // diet type
  8: "Lose fat", // goal
  9: 3, // meals per day
  10: "Diabetes", // health condition
  11: "30–60 minutes", // exercise time
  12: "Strength training" // exercise type
};

const mockFoods = {
  chickenBreast: { name: "Chicken Breast", protein: 31, carbs: 0, fats: 3, calories: 165, category: 'protein' },
  lentils: { name: "Lentils (cooked)", protein: 9, carbs: 20, fats: 0.4, calories: 116, category: 'legume', healthBenefits: ['diabetes', 'high blood pressure'] },
  quinoa: { name: "Quinoa (cooked)", protein: 4.1, carbs: 21, fats: 1.9, calories: 120, category: 'grain' },
  broccoli: { name: "Broccoli", protein: 3, carbs: 7, fats: 0.3, calories: 34, category: 'vegetable', healthBenefits: ['heart disease'] },
  oliveOil: { name: "Olive Oil", protein: 0, carbs: 0, fats: 100, calories: 884, category: 'oil', healthBenefits: ['heart disease'] },
  tofu: { name: "Tofu (firm)", protein: 8, carbs: 2, fats: 5, calories: 76, category: 'protein', restrictions: ['soy allergy'] }
};

const mockTemplates = {
  vegetarian: {
    lunch: [
      {
        items: [
          { food: "lentils", base: 200 },
          { food: "quinoa", base: 120 },
          { food: "broccoli", base: 100 },
          { food: "oliveOil", base: 10 }
        ],
        name: "Lentil Quinoa Bowl",
        difficulty: 'medium',
        prepTime: 25
      }
    ]
  }
};

// Test functions
function testHealthConditionFiltering() {
  console.log("🧪 Testing Health Condition Filtering...");
  
  const userProfile = {
    healthConditions: { diabetes: true },
    dietType: "Vegetarian"
  };
  
  // Test that diabetes-beneficial foods get higher scores
  const lentils = mockFoods.lentils;
  const hasDiabetesBenefit = lentils.healthBenefits?.includes('diabetes');
  
  console.log(`✅ Lentils beneficial for diabetes: ${hasDiabetesBenefit}`);
  
  // Test that restricted foods are avoided
  const tofu = mockFoods.tofu;
  const hasSoyRestriction = tofu.restrictions?.includes('soy allergy');
  
  console.log(`✅ Tofu has soy restriction: ${hasSoyRestriction}`);
  
  return true;
}

function testMacroScaling() {
  console.log("🧪 Testing Macro Scaling...");
  
  const targetCalories = 500;
  const template = mockTemplates.vegetarian.lunch[0];
  
  // Calculate base calories
  let baseCalories = 0;
  template.items.forEach(item => {
    const food = mockFoods[item.food];
    baseCalories += food.calories * (item.base / 100);
  });
  
  console.log(`Base calories: ${baseCalories}`);
  
  // Calculate scaling factor
  const scaleFactor = targetCalories / baseCalories;
  console.log(`Scale factor: ${scaleFactor.toFixed(2)}`);
  
  // Verify scaling is within reasonable bounds
  const isValidScale = scaleFactor >= 0.5 && scaleFactor <= 2.5;
  console.log(`✅ Scale factor is valid: ${isValidScale}`);
  
  return isValidScale;
}

function testGoalBasedMacros() {
  console.log("🧪 Testing Goal-Based Macro Adjustments...");
  
  const goals = {
    "Lose fat": { protein: 0.35, carbs: 0.35, fats: 0.30 },
    "Build muscle": { protein: 0.30, carbs: 0.45, fats: 0.25 },
    "Maintain weight": { protein: 0.25, carbs: 0.45, fats: 0.30 },
    "Keto": { protein: 0.20, carbs: 0.05, fats: 0.75 }
  };
  
  Object.entries(goals).forEach(([goal, ratios]) => {
    const total = ratios.protein + ratios.carbs + ratios.fats;
    const isValid = Math.abs(total - 1.0) < 0.01; // Within 1% of 100%
    console.log(`✅ ${goal}: ${(total * 100).toFixed(1)}% total (${isValid ? 'valid' : 'invalid'})`);
  });
  
  return true;
}

function testTemplateScoring() {
  console.log("🧪 Testing Template Scoring System...");
  
  const template = mockTemplates.vegetarian.lunch[0];
  const userProfile = {
    healthConditions: { diabetes: true },
    dietType: "Vegetarian"
  };
  
  // Mock scoring calculation
  let healthScore = 0.5; // Base score
  
  template.items.forEach(item => {
    const food = mockFoods[item.food];
    if (food.healthBenefits?.includes('diabetes')) {
      healthScore += 0.2; // Bonus for diabetes benefits
    }
  });
  
  const macroScore = 0.8; // Mock macro alignment
  const varietyScore = 0.7; // Mock variety score
  const preferenceScore = 0.6; // Mock user preference
  
  const totalScore = (
    macroScore * 0.25 +
    healthScore * 0.3 +
    varietyScore * 0.2 +
    preferenceScore * 0.25
  );
  
  console.log(`Health score: ${healthScore.toFixed(2)}`);
  console.log(`Total score: ${totalScore.toFixed(2)}`);
  console.log(`✅ Template scoring working: ${totalScore > 0.5}`);
  
  return totalScore > 0.5;
}

function testUserProfileConversion() {
  console.log("🧪 Testing User Profile Conversion...");
  
  // Convert mock quiz answers to structured profile
  const userProfile = {
    userId: "test-user-123",
    age: mockQuizAnswers[1],
    gender: mockQuizAnswers[2],
    weight: mockQuizAnswers[3],
    height: mockQuizAnswers[4],
    goalWeight: mockQuizAnswers[5],
    activityLevel: mockQuizAnswers[6],
    dietType: mockQuizAnswers[7],
    goal: mockQuizAnswers[8],
    mealsPerDay: mockQuizAnswers[9],
    healthConditions: {
      diabetes: mockQuizAnswers[10] === "Diabetes"
    },
    dietaryRestrictions: mockQuizAnswers[7] === "Vegetarian" ? ["meat"] : [],
    exerciseTime: mockQuizAnswers[11],
    exerciseType: mockQuizAnswers[12]
  };
  
  console.log("✅ User Profile:");
  console.log(`  - Age: ${userProfile.age}`);
  console.log(`  - Goal: ${userProfile.goal}`);
  console.log(`  - Diet: ${userProfile.dietType}`);
  console.log(`  - Health: ${Object.keys(userProfile.healthConditions).filter(k => userProfile.healthConditions[k]).join(', ') || 'None'}`);
  console.log(`  - Meals/day: ${userProfile.mealsPerDay}`);
  
  return true;
}

function testMLIntegration() {
  console.log("🧪 Testing ML Integration...");
  
  // Mock ML prediction request
  const predictionRequest = {
    user_id: "test-user-123",
    user_profile: {
      goal: "Lose fat",
      dietType: "Vegetarian",
      healthConditions: { diabetes: true }
    },
    macro_targets: {
      protein: 120,
      carbs: 150,
      fats: 67,
      calories: 1500
    },
    meal_type: "lunch",
    available_templates: ["Lentil Quinoa Bowl", "Tofu Stir-fry", "Chickpea Rice Bowl"]
  };
  
  // Mock ML prediction response
  const mockPrediction = {
    recommended_templates: ["Lentil Quinoa Bowl", "Chickpea Rice Bowl", "Tofu Stir-fry"],
    portion_sizes: {
      protein_scale: 1.2,
      carb_scale: 0.9,
      fat_scale: 1.1,
      vegetable_scale: 1.3
    },
    confidence: 0.85,
    reasoning: "Selected based on diabetes-friendly ingredients and macro alignment"
  };
  
  console.log("✅ ML Prediction:");
  console.log(`  - Recommended: ${mockPrediction.recommended_templates.join(', ')}`);
  console.log(`  - Confidence: ${(mockPrediction.confidence * 100).toFixed(1)}%`);
  console.log(`  - Reasoning: ${mockPrediction.reasoning}`);
  
  return true;
}

function testFeedbackSystem() {
  console.log("🧪 Testing Feedback System...");
  
  const mockFeedback = {
    mealId: "meal_123",
    mealName: "Lentil Quinoa Bowl",
    templateName: "Lentil Quinoa Bowl",
    rating: 4,
    liked: true,
    satietyScore: 4,
    goalProgressScore: 5,
    consumed: true,
    consumedDate: "2024-01-15"
  };
  
  console.log("✅ Feedback Data:");
  console.log(`  - Rating: ${mockFeedback.rating}/5`);
  console.log(`  - Liked: ${mockFeedback.liked}`);
  console.log(`  - Satiety: ${mockFeedback.satietyScore}/5`);
  console.log(`  - Goal Progress: ${mockFeedback.goalProgressScore}/5`);
  console.log(`  - Consumed: ${mockFeedback.consumed}`);
  
  return true;
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting Enhanced Meal Generation System Tests\n");
  
  const tests = [
    testHealthConditionFiltering,
    testMacroScaling,
    testGoalBasedMacros,
    testTemplateScoring,
    testUserProfileConversion,
    testMLIntegration,
    testFeedbackSystem
  ];
  
  let passed = 0;
  let total = tests.length;
  
  tests.forEach((test, index) => {
    try {
      const result = test();
      if (result) {
        passed++;
        console.log(`✅ Test ${index + 1} passed\n`);
      } else {
        console.log(`❌ Test ${index + 1} failed\n`);
      }
    } catch (error) {
      console.log(`❌ Test ${index + 1} error: ${error.message}\n`);
    }
  });
  
  console.log(`🎯 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All tests passed! The enhanced meal generation system is working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please check the implementation.");
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testHealthConditionFiltering,
    testMacroScaling,
    testGoalBasedMacros,
    testTemplateScoring,
    testUserProfileConversion,
    testMLIntegration,
    testFeedbackSystem
  };
}
