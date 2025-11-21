/**
 * Analytics Service (PostHog Integration)
 * Track user events for product analytics and insights
 */

import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog
let isInitialized = false;

export const initializeAnalytics = () => {
  if (!POSTHOG_API_KEY) {
    console.warn('PostHog API key not configured. Analytics disabled.');
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: false, // Disable autocapture for explicit tracking
      capture_pageview: true,
      persistence: 'localStorage',
      loaded: () => {
        if (import.meta.env.DEV) {
          console.log('PostHog initialized successfully');
        }
      },
    });

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

// Event types for type safety
export const AnalyticsEvents = {
  // Authentication Events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Quiz Events
  QUIZ_STARTED: 'quiz_started',
  QUIZ_PHASE_COMPLETED: 'quiz_phase_completed',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_ABANDONED: 'quiz_abandoned',

  // Plan Generation Events
  PLAN_GENERATION_STARTED: 'plan_generation_started',
  PLAN_GENERATION_COMPLETED: 'plan_generation_completed',
  PLAN_GENERATION_FAILED: 'plan_generation_failed',

  // Nutrition Events
  MEAL_LOGGED: 'meal_logged',
  MEAL_LOGGED_MANUAL: 'meal_logged_manual',
  FOOD_SEARCHED: 'food_searched',
  WATER_LOGGED: 'water_logged',
  DAILY_NUTRITION_GOAL_MET: 'daily_nutrition_goal_met',

  // Workout Events
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  EXERCISE_COMPLETED: 'exercise_completed',

  // Challenge Events
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_COMPLETED: 'challenge_completed',
  CHALLENGE_DAY_COMPLETED: 'challenge_day_completed',

  // Progress Events
  WEIGHT_LOGGED: 'weight_logged',
  PROGRESS_PHOTO_UPLOADED: 'progress_photo_uploaded',
  MILESTONE_REACHED: 'milestone_reached',

  // Social Events
  PROFILE_UPDATED: 'profile_updated',
  PROFILE_VIEWED: 'profile_viewed',

  // Subscription Events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_SUCCESSFUL: 'payment_successful',
  PAYMENT_FAILED: 'payment_failed',

  // Engagement Events
  NOTIFICATION_CLICKED: 'notification_clicked',
  EMAIL_CLICKED: 'email_clicked',
  FEATURE_DISCOVERED: 'feature_discovered',

  // Error Events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;

type AnalyticsEventType = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// User identification
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!isInitialized) return;

  try {
    posthog.identify(userId, properties);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};

// Track custom event
export const trackEvent = (
  eventName: AnalyticsEventType,
  properties?: Record<string, any>
) => {
  if (!isInitialized) return;

  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });

    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${eventName}`, properties);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Track page view
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  if (!isInitialized) return;

  try {
    posthog.capture('$pageview', {
      page_name: pageName,
      ...properties,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Reset user identity (on logout)
export const resetUser = () => {
  if (!isInitialized) return;

  try {
    posthog.reset();
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
};

// Convenience functions for common events

export const analytics = {
  // Authentication
  trackSignup: (method: 'email' | 'google' | 'github') => {
    trackEvent(AnalyticsEvents.USER_SIGNUP, { method });
  },

  trackLogin: (method: 'email' | 'google' | 'github') => {
    trackEvent(AnalyticsEvents.USER_LOGIN, { method });
  },

  trackLogout: () => {
    trackEvent(AnalyticsEvents.USER_LOGOUT);
    resetUser();
  },

  // Quiz
  trackQuizStarted: () => {
    trackEvent(AnalyticsEvents.QUIZ_STARTED);
  },

  trackQuizPhaseCompleted: (phase: number, totalPhases: number) => {
    trackEvent(AnalyticsEvents.QUIZ_PHASE_COMPLETED, {
      phase,
      totalPhases,
      progress: (phase / totalPhases) * 100,
    });
  },

  trackQuizCompleted: (duration: number, answers: Record<string, any>) => {
    trackEvent(AnalyticsEvents.QUIZ_COMPLETED, {
      duration_seconds: Math.round(duration / 1000),
      goal: answers.goal,
      activity_level: answers.activityLevel,
    });
  },

  trackQuizAbandoned: (phase: number, totalPhases: number) => {
    trackEvent(AnalyticsEvents.QUIZ_ABANDONED, {
      phase,
      totalPhases,
      completion_percentage: (phase / totalPhases) * 100,
    });
  },

  // Plan Generation
  trackPlanGenerationStarted: (planType: 'meal' | 'workout' | 'both') => {
    trackEvent(AnalyticsEvents.PLAN_GENERATION_STARTED, { plan_type: planType });
  },

  trackPlanGenerationCompleted: (planType: 'meal' | 'workout' | 'both', duration: number) => {
    trackEvent(AnalyticsEvents.PLAN_GENERATION_COMPLETED, {
      plan_type: planType,
      duration_seconds: Math.round(duration / 1000),
    });
  },

  trackPlanGenerationFailed: (planType: 'meal' | 'workout' | 'both', error: string) => {
    trackEvent(AnalyticsEvents.PLAN_GENERATION_FAILED, {
      plan_type: planType,
      error_message: error,
    });
  },

  // Nutrition
  trackMealLogged: (mealType: string, calories: number, isManual: boolean) => {
    const event = isManual
      ? AnalyticsEvents.MEAL_LOGGED_MANUAL
      : AnalyticsEvents.MEAL_LOGGED;

    trackEvent(event, {
      meal_type: mealType,
      calories,
      source: isManual ? 'manual' : 'ai_plan',
    });
  },

  trackFoodSearched: (query: string, resultsCount: number) => {
    trackEvent(AnalyticsEvents.FOOD_SEARCHED, {
      query,
      results_count: resultsCount,
    });
  },

  trackWaterLogged: (amount: number, unit: 'ml' | 'oz') => {
    trackEvent(AnalyticsEvents.WATER_LOGGED, {
      amount,
      unit,
    });
  },

  trackNutritionGoalMet: (calories: number, protein: number) => {
    trackEvent(AnalyticsEvents.DAILY_NUTRITION_GOAL_MET, {
      calories,
      protein,
    });
  },

  // Workouts
  trackWorkoutStarted: (workoutId: string, workoutName: string) => {
    trackEvent(AnalyticsEvents.WORKOUT_STARTED, {
      workout_id: workoutId,
      workout_name: workoutName,
    });
  },

  trackWorkoutCompleted: (
    workoutId: string,
    workoutName: string,
    duration: number,
    exercises: number
  ) => {
    trackEvent(AnalyticsEvents.WORKOUT_COMPLETED, {
      workout_id: workoutId,
      workout_name: workoutName,
      duration_minutes: Math.round(duration / 60),
      exercises_count: exercises,
    });
  },

  trackExerciseCompleted: (exerciseName: string, sets: number, reps: number) => {
    trackEvent(AnalyticsEvents.EXERCISE_COMPLETED, {
      exercise_name: exerciseName,
      sets,
      reps,
    });
  },

  // Challenges
  trackChallengeJoined: (challengeId: string, challengeName: string) => {
    trackEvent(AnalyticsEvents.CHALLENGE_JOINED, {
      challenge_id: challengeId,
      challenge_name: challengeName,
    });
  },

  trackChallengeCompleted: (challengeId: string, challengeName: string, days: number) => {
    trackEvent(AnalyticsEvents.CHALLENGE_COMPLETED, {
      challenge_id: challengeId,
      challenge_name: challengeName,
      total_days: days,
    });
  },

  trackChallengeDayCompleted: (challengeId: string, day: number) => {
    trackEvent(AnalyticsEvents.CHALLENGE_DAY_COMPLETED, {
      challenge_id: challengeId,
      day,
    });
  },

  // Progress
  trackWeightLogged: (weight: number, unit: 'kg' | 'lbs', change?: number) => {
    trackEvent(AnalyticsEvents.WEIGHT_LOGGED, {
      weight,
      unit,
      change,
    });
  },

  trackProgressPhotoUploaded: () => {
    trackEvent(AnalyticsEvents.PROGRESS_PHOTO_UPLOADED);
  },

  trackMilestoneReached: (milestone: string, value: number) => {
    trackEvent(AnalyticsEvents.MILESTONE_REACHED, {
      milestone,
      value,
    });
  },

  // Profile
  trackProfileUpdated: (fields: string[]) => {
    trackEvent(AnalyticsEvents.PROFILE_UPDATED, {
      fields_updated: fields,
    });
  },

  trackProfileViewed: (profileId: string) => {
    trackEvent(AnalyticsEvents.PROFILE_VIEWED, {
      profile_id: profileId,
    });
  },

  // Subscription
  trackSubscriptionStarted: (plan: string, amount: number) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, {
      plan,
      amount,
    });
  },

  trackSubscriptionCancelled: (plan: string, reason?: string) => {
    trackEvent(AnalyticsEvents.SUBSCRIPTION_CANCELLED, {
      plan,
      reason,
    });
  },

  trackPaymentSuccessful: (amount: number, plan: string) => {
    trackEvent(AnalyticsEvents.PAYMENT_SUCCESSFUL, {
      amount,
      plan,
    });
  },

  trackPaymentFailed: (amount: number, plan: string, error: string) => {
    trackEvent(AnalyticsEvents.PAYMENT_FAILED, {
      amount,
      plan,
      error_message: error,
    });
  },

  // Engagement
  trackNotificationClicked: (notificationType: string) => {
    trackEvent(AnalyticsEvents.NOTIFICATION_CLICKED, {
      notification_type: notificationType,
    });
  },

  trackEmailClicked: (emailType: string, link: string) => {
    trackEvent(AnalyticsEvents.EMAIL_CLICKED, {
      email_type: emailType,
      link,
    });
  },

  trackFeatureDiscovered: (featureName: string) => {
    trackEvent(AnalyticsEvents.FEATURE_DISCOVERED, {
      feature_name: featureName,
    });
  },

  // Errors
  trackError: (errorType: string, errorMessage: string, context?: Record<string, any>) => {
    trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    });
  },

  trackApiError: (endpoint: string, statusCode: number, errorMessage: string) => {
    trackEvent(AnalyticsEvents.API_ERROR, {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  },

  // User identification
  identify: identifyUser,
  reset: resetUser,
};

export default analytics;
