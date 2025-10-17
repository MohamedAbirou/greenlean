/**
 * Enhanced Meal Plan Hook with ML Integration
 * 
 * This hook provides the new meal generation system with:
 * - Intelligent template scoring and selection
 * - Health condition filtering
 * - ML-powered predictions
 * - User feedback integration
 * - Comprehensive logging
 */

import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { mlService } from '@/services/mlService';
import type {
  MacroTargets,
  Meal,
  MealFeedback,
  UserProfile
} from '@/types/mealGeneration';
import { logError } from '@/utils/errorLogger';
import {
  calculateMacroTargets,
  convertQuizAnswersToUserProfile,
  MealGeneratorV2
} from '@/utils/mealGenerationV2';
import { useCallback, useEffect, useState } from 'react';

export interface MealPlanState {
  meals: Meal[] | null;
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  macroTargets: MacroTargets | null;
  mlEnabled: boolean;
  lastGenerated: Date | null;
}

export interface MealPlanActions {
  generateMealPlan: () => Promise<void>;
  submitFeedback: (feedback: MealFeedback) => Promise<void>;
  refreshMealPlan: () => Promise<void>;
  clearError: () => void;
}

export const useMealPlanV2 = (): MealPlanState & MealPlanActions => {
  const { user } = useAuth();
  const [state, setState] = useState<MealPlanState>({
    meals: null,
    loading: false,
    error: null,
    userProfile: null,
    macroTargets: null,
    mlEnabled: false,
    lastGenerated: null
  });

  // Check ML service availability
  useEffect(() => {
    const checkMLService = async () => {
      try {
        const isHealthy = await mlService.checkHealth();
        setState(prev => ({ ...prev, mlEnabled: isHealthy }));
      } catch (error) {
        console.warn('ML service not available:', error);
        setState(prev => ({ ...prev, mlEnabled: false }));
      }
    };

    checkMLService();
  }, []);

  // Load user profile from quiz results
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        // First, check if there's a pre-generated meal plan in localStorage
        const storedMealPlan = localStorage.getItem('generatedMealPlan');
        if (storedMealPlan) {
          try {
            const mealPlanData = JSON.parse(storedMealPlan);
            const generatedAt = new Date(mealPlanData.generatedAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);
            
            // Use stored meal plan if it's less than 24 hours old
            if (hoursDiff < 24 && mealPlanData.meals && mealPlanData.userProfile && mealPlanData.macroTargets) {
              setState(prev => ({
                ...prev,
                meals: mealPlanData.meals,
                userProfile: mealPlanData.userProfile,
                macroTargets: mealPlanData.macroTargets,
                lastGenerated: generatedAt
              }));
              return;
            } else {
              // Remove old meal plan
              localStorage.removeItem('generatedMealPlan');
            }
          } catch (parseError) {
            console.error('Error parsing stored meal plan:', parseError);
            localStorage.removeItem('generatedMealPlan');
          }
        }

        // Load from database if no valid stored meal plan
        const { data, error } = await supabase
          .from('quiz_results')
          .select('answers, calculations')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          const userProfile = convertQuizAnswersToUserProfile(data.answers, user.id);
          const macroTargets = calculateMacroTargets(userProfile, data.calculations.dailyCalorieTarget);

          setState(prev => ({
            ...prev,
            userProfile,
            macroTargets
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load user profile'
        }));
      }
    };

    loadUserProfile();
  }, [user]);

  const generateMealPlan = useCallback(async () => {
    if (!state.userProfile || !state.macroTargets) {
      setState(prev => ({
        ...prev,
        error: 'User profile or macro targets not available'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const generator = new MealGeneratorV2({
        enableMLPredictions: state.mlEnabled,
        maxTemplatesToConsider: 15,
        minTemplateScore: 0.2,
        macroTolerance: 0.15,
        healthConditionWeight: 0.3,
        varietyWeight: 0.2,
        userPreferenceWeight: 0.25,
        macroAlignmentWeight: 0.25
      });

      const meals = await generator.generateMealPlan(state.userProfile, state.macroTargets);

      setState(prev => ({
        ...prev,
        meals,
        loading: false,
        lastGenerated: new Date()
      }));

      // Store the generated meal plan in localStorage
      localStorage.setItem('generatedMealPlan', JSON.stringify({
        meals,
        userProfile: state.userProfile,
        macroTargets: state.macroTargets,
        generatedAt: new Date().toISOString()
      }));

      // Log successful generation
      await logError(
        'info',
        'frontend',
        'Meal plan generated successfully',
        `Generated ${meals.length} meals for user ${user?.id || 'unknown'}`,
        { 
          userId: user?.id || 'unknown', 
          mealCount: meals.length.toString(),
          mlEnabled: state.mlEnabled.toString()
        }
      );

    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to generate meal plan: ${errorMessage}`
      }));

      await logError(
        'error',
        'frontend',
        'Failed to generate meal plan',
        errorMessage,
        { userId: user?.id || 'unknown' }
      );
    }
  }, [state.userProfile, state.macroTargets, state.mlEnabled, user?.id]);

  const submitFeedback = useCallback(async (feedback: MealFeedback) => {
    try {
      await mlService.submitFeedback(feedback);
      
      // Update user preferences based on feedback
      await updateUserPreferences(feedback);
      
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }, []);

  const refreshMealPlan = useCallback(async () => {
    await generateMealPlan();
  }, [generateMealPlan]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Note: Meal generation is now triggered manually or during quiz completion
  // Auto-generation is disabled to prevent unwanted generation when switching tabs

  return {
    ...state,
    generateMealPlan,
    submitFeedback,
    refreshMealPlan,
    clearError
  };
};

/**
 * Update user preferences based on feedback
 */
async function updateUserPreferences(feedback: MealFeedback): Promise<void> {
  try {
    const { user } = useAuth();
    if (!user) return;

    // Determine preference value based on feedback
    let preferenceValue = 0; // Neutral
    let confidence = 0.5;

    if (feedback.rating) {
      preferenceValue = (feedback.rating - 3) / 2; // Convert 1-5 to -1 to +1
      confidence = 0.8;
    } else if (feedback.liked !== undefined) {
      preferenceValue = feedback.liked ? 0.8 : -0.8;
      confidence = 0.7;
    } else if (feedback.satietyScore) {
      preferenceValue = (feedback.satietyScore - 3) / 2;
      confidence = 0.6;
    }

    if (Math.abs(preferenceValue) < 0.1) return; // Skip neutral feedback

    // Update or insert user preference
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        preference_type: 'food_likes',
        preference_key: feedback.mealId || 'unknown',
        preference_value: preferenceValue,
        confidence: confidence,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,preference_type,preference_key'
      });

    if (error) {
      console.error('Error updating user preferences:', error);
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}

/**
 * Hook for getting ML predictions for specific meal types
 */
export const useMLPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPrediction = useCallback(async (request: any) => {
    setLoading(true);
    setError(null);

    try {
      const prediction = await mlService.getMealPrediction(request);
      setLoading(false);
      return prediction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    getPrediction,
    loading,
    error
  };
};

/**
 * Hook for managing meal feedback
 */
export const useMealFeedback = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (feedback: MealFeedback) => {
    setSubmitting(true);
    setError(null);

    try {
      await mlService.submitFeedback(feedback);
      setSubmitting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setSubmitting(false);
      throw err;
    }
  }, []);

  return {
    submitFeedback,
    submitting,
    error
  };
};

/**
 * Hook for getting model performance metrics
 */
export const useModelPerformance = () => {
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const metrics = await mlService.getModelPerformance();
      setPerformance(metrics);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  return {
    performance,
    loading,
    error,
    refresh: loadPerformance
  };
};
