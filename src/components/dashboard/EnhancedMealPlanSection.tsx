/**
 * Enhanced Meal Plan Section
 * 
 * This component displays the new meal generation system with:
 * - Intelligent meal recommendations
 * - Health condition filtering
 * - ML-powered predictions
 * - User feedback integration
 * - Comprehensive meal information
 */

import { usePlatform } from '@/contexts/PlatformContext';
import { useMealPlanV2 } from '@/hooks/useMealPlanV2';
import { Meal } from '@/types/mealGeneration';
import { useColorTheme } from '@/utils/colorUtils';
import MealFeedback from '@MealFeedback';
import React, { useState } from 'react';

interface EnhancedMealPlanSectionProps {
  className?: string;
}

const EnhancedMealPlanSection: React.FC<EnhancedMealPlanSectionProps> = ({ className = '' }) => {
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);
  
  const {
    meals,
    loading,
    error,
    userProfile,
    macroTargets,
    mlEnabled,
    lastGenerated,
    generateMealPlan,
    refreshMealPlan,
    clearError
  } = useMealPlanV2();

  const [selectedMealForFeedback, setSelectedMealForFeedback] = useState<Meal | null>(null);

  const handleFeedbackSubmitted = () => {
    setSelectedMealForFeedback(null);
    // Optionally refresh meal plan to incorporate feedback
    // refreshMealPlan();
  };

  const formatMacros = (macros: any) => {
    return `${Math.round(macros.protein)}g protein, ${Math.round(macros.carbs)}g carbs, ${Math.round(macros.fats)}g fats`;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className={`bg-background rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-background rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Meal Plan</h3>
          <p className="text-secondary-foreground mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={generateMealPlan}
              className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-md ${colorTheme.primaryHover} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              Try Again
            </button>
            <button
              onClick={clearError}
              className="px-4 py-2 border border-border text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!meals || meals.length === 0) {
    return (
      <div className={`bg-background rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Meal Plan Available</h3>
          <p className="text-secondary-foreground mb-4">Complete the health quiz to generate your personalized meal plan.</p>
          <button
            onClick={generateMealPlan}
            className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-md ${colorTheme.primaryHover} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            Generate Meal Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Meal Plan</h2>
          <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-foreground">
            <span>Generated: {lastGenerated?.toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              mlEnabled ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            }`}>
              {mlEnabled ? 'ML Enhanced' : 'Standard Mode'}
            </span>
          </div>
        </div>
        <button
          onClick={refreshMealPlan}
          className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-md ${colorTheme.primaryHover} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          Refresh Plan
        </button>
      </div>

      {/* Macro Summary */}
      {macroTargets && (
        <div className="bg-card rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Daily Macro Targets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(macroTargets.calories)}</div>
              <div className="text-sm text-secondary-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(macroTargets.protein)}g</div>
              <div className="text-sm text-secondary-foreground">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{Math.round(macroTargets.carbs)}g</div>
              <div className="text-sm text-secondary-foreground">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(macroTargets.fats)}g</div>
              <div className="text-sm text-secondary-foreground">Fats</div>
            </div>
          </div>
        </div>
      )}

      {/* Meals */}
      <div className="space-y-4">
        {meals.map((meal, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-background">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{meal.name}</h3>
                {meal.templateName && (
                  <p className="text-sm text-secondary-foreground">Template: {meal.templateName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMealForFeedback(meal)}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Rate Meal
              </button>
            </div>

            {/* Meal Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Nutrition</h4>
                <div className="text-sm text-secondary-foreground">
                  <div>{Math.round(meal.total.calories)} calories</div>
                  <div>{formatMacros(meal.total)}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                <div className="text-sm text-secondary-foreground">
                  {meal.difficulty && <div>Difficulty: {meal.difficulty}</div>}
                  {meal.prepTime && <div>Prep time: {meal.prepTime} min</div>}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Scores</h4>
                <div className="text-sm space-y-1">
                  {meal.macroAlignmentScore && (
                    <div className={`${getScoreColor(meal.macroAlignmentScore)}`}>
                      Macro: {getScoreLabel(meal.macroAlignmentScore)}
                    </div>
                  )}
                  {meal.healthConditionScore && (
                    <div className={`${getScoreColor(meal.healthConditionScore)}`}>
                      Health: {getScoreLabel(meal.healthConditionScore)}
                    </div>
                  )}
                  {meal.varietyScore && (
                    <div className={`${getScoreColor(meal.varietyScore)}`}>
                      Variety: {getScoreLabel(meal.varietyScore)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meal Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {meal.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.food}</span>
                    <span className="text-gray-500">{item.grams}g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generation Reason */}
            {meal.generationReason && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                <strong>Why this meal:</strong> {meal.generationReason}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Profile Info */}
      {userProfile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Goal</div>
              <div className="text-gray-600">{userProfile.goal}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Diet Type</div>
              <div className="text-gray-600">{userProfile.dietType}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Meals/Day</div>
              <div className="text-gray-600">{userProfile.mealsPerDay}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Health Conditions</div>
              <div className="text-gray-600">
                {Object.values(userProfile.healthConditions).some(Boolean) 
                  ? Object.entries(userProfile.healthConditions)
                      .filter(([_, value]) => value)
                      .map(([key, _]) => key)
                      .join(', ')
                  : 'None'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedMealForFeedback && (
        <MealFeedback
          mealId={`meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
          mealName={selectedMealForFeedback.name}
          templateName={selectedMealForFeedback.templateName}
          onFeedbackSubmitted={handleFeedbackSubmitted}
          onClose={() => setSelectedMealForFeedback(null)}
        />
      )}
    </div>
  );
};

export default EnhancedMealPlanSection;
