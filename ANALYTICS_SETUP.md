# Analytics Setup Guide (PostHog)

## Overview
GreenLean uses **PostHog** for product analytics and event tracking. Track user behavior, measure feature adoption, and make data-driven decisions.

---

## 1. Get PostHog API Key (FREE)

### Sign Up (3 minutes):

1. Go to [https://posthog.com/signup](https://posthog.com/signup)
2. Sign up with email or GitHub
3. Create your organization and project
4. Copy your **Project API Key** from the settings
5. Note your **PostHog Host** (usually `https://app.posthog.com` or `https://eu.posthog.com`)

### Free Tier Includes:
- ✅ 1 million events/month
- ✅ Unlimited tracked users
- ✅ 1 year data retention
- ✅ All features included
- ✅ No credit card required

---

## 2. Configure Environment Variables

Add to your `.env` file:

```env
# PostHog Analytics
VITE_POSTHOG_API_KEY=phc_your_api_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

**For Production (Vercel):**
1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_POSTHOG_API_KEY` = your PostHog API key
   - `VITE_POSTHOG_HOST` = your PostHog host URL

---

## 3. Install PostHog Package

```bash
npm install posthog-js
```

Or with yarn:
```bash
yarn add posthog-js
```

---

## 4. What's Already Integrated

✅ **Analytics Service** (`src/services/analytics/analyticsService.ts`)
- Type-safe event tracking
- 30+ predefined events
- User identification
- Automatic session tracking
- Error tracking integration

✅ **Events Tracked:**

**Authentication:**
- User signup (with method: email/google/github)
- User login
- User logout

**Quiz:**
- Quiz started
- Quiz phase completed (with progress %)
- Quiz completed (with duration, answers)
- Quiz abandoned (with completion %)

**Plan Generation:**
- Plan generation started (meal/workout/both)
- Plan generation completed (with duration)
- Plan generation failed (with error)

**Nutrition:**
- Meal logged (manual or AI-generated)
- Food searched (with query, results)
- Water logged
- Daily nutrition goal met

**Workouts:**
- Workout started
- Workout completed (with duration, exercises)
- Exercise completed (with sets, reps)

**Challenges:**
- Challenge joined
- Challenge day completed
- Challenge completed

**Progress:**
- Weight logged (with change)
- Progress photo uploaded
- Milestone reached

**Subscription:**
- Subscription started
- Subscription cancelled
- Payment successful/failed

**Engagement:**
- Notification clicked
- Email clicked
- Feature discovered

**Errors:**
- Generic errors
- API errors (with endpoint, status)

---

## 5. How to Use

### A. Initialize Analytics (App Startup)

**File:** `src/main.tsx`

```typescript
import { initializeAnalytics } from '@/services/analytics/analyticsService';

// Initialize PostHog
initializeAnalytics();

// ... rest of your app initialization
```

### B. Track Events in Components

**Example 1: Track User Signup**

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// After successful signup
const handleSignup = async () => {
  const user = await signupWithEmail(email, password);

  // Track signup event
  analytics.trackSignup('email');

  // Identify user
  analytics.identify(user.id, {
    email: user.email,
    name: user.name,
    created_at: user.created_at,
  });
};
```

**Example 2: Track Quiz Completion**

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// When quiz is completed
const handleQuizComplete = (answers: QuizAnswers) => {
  const duration = Date.now() - quizStartTime;

  analytics.trackQuizCompleted(duration, {
    goal: answers.goal,
    activity_level: answers.activityLevel,
  });
};
```

**Example 3: Track Meal Logging**

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// When user logs a meal
const handleMealLog = (meal: Meal, isManual: boolean) => {
  analytics.trackMealLogged(
    meal.mealType,
    meal.calories,
    isManual
  );
};
```

**Example 4: Track Workout Completion**

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// When workout is completed
const handleWorkoutComplete = (workout: Workout) => {
  analytics.trackWorkoutCompleted(
    workout.id,
    workout.name,
    workout.duration,
    workout.exercises.length
  );
};
```

**Example 5: Track Errors**

```typescript
import { analytics } from '@/services/analytics/analyticsService';

try {
  await generatePlan(quizAnswers);
} catch (error) {
  analytics.trackPlanGenerationFailed('both', error.message);

  // Also track generic error
  analytics.trackError('plan_generation', error.message, {
    quiz_answers: quizAnswers,
  });
}
```

---

## 6. Integration Points

### A. Authentication Flow

**File:** `src/features/auth/hooks/useAuth.ts`

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// On signup
analytics.trackSignup(method);
analytics.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.subscription_plan,
});

// On login
analytics.trackLogin(method);
analytics.identify(user.id);

// On logout
analytics.trackLogout(); // Automatically resets user
```

### B. Quiz Flow

**File:** `src/pages/Quiz.tsx`

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// On quiz start
useEffect(() => {
  analytics.trackQuizStarted();
  setQuizStartTime(Date.now());
}, []);

// On phase change
useEffect(() => {
  if (currentPhase > 0) {
    analytics.trackQuizPhaseCompleted(currentPhase, totalPhases);
  }
}, [currentPhase]);

// On quiz complete
const handleSubmit = () => {
  analytics.trackQuizCompleted(Date.now() - quizStartTime, answers);
};

// On quiz abandon (when user leaves page)
useEffect(() => {
  return () => {
    if (!isQuizCompleted) {
      analytics.trackQuizAbandoned(currentPhase, totalPhases);
    }
  };
}, []);
```

### C. Plan Generation

**File:** `src/pages/Dashboard.tsx` or plan generation hook

```typescript
import { analytics } from '@/services/analytics/analyticsService';

const generatePlan = async () => {
  const startTime = Date.now();

  analytics.trackPlanGenerationStarted('both');

  try {
    const plan = await mlService.generatePlan(quizAnswers);
    const duration = Date.now() - startTime;

    analytics.trackPlanGenerationCompleted('both', duration);
  } catch (error) {
    analytics.trackPlanGenerationFailed('both', error.message);
    throw error;
  }
};
```

### D. Meal Logging

**File:** `src/features/nutrition/components/FoodSearch.tsx`

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// On food search
const handleSearch = (query: string) => {
  const results = await searchFoods(query);
  analytics.trackFoodSearched(query, results.length);
};

// On meal log
const handleMealLog = (food: Food, mealType: string) => {
  await logMeal({...});
  analytics.trackMealLogged(mealType, food.calories, true);
};
```

### E. Subscription Flow

**File:** Stripe success webhook or payment confirmation page

```typescript
import { analytics } from '@/services/analytics/analyticsService';

// On subscription start
analytics.trackSubscriptionStarted(plan, amount);
analytics.identify(user.id, {
  plan: plan,
  subscription_status: 'active',
});

// On payment success
analytics.trackPaymentSuccessful(amount, plan);
```

### F. Error Tracking (Global)

**File:** `src/lib/sentry/config.ts`

```typescript
import { analytics } from '@/services/analytics/analyticsService';

beforeSend(event) {
  // Also track in PostHog for cross-reference
  analytics.trackError(
    event.exception?.values?.[0]?.type || 'unknown',
    event.exception?.values?.[0]?.value || 'Unknown error',
    {
      url: event.request?.url,
      user_id: event.user?.id,
    }
  );

  return event;
}
```

---

## 7. PostHog Dashboard Setup

### A. Create Key Insights

1. **User Signups Funnel:**
   - Visited homepage → Started quiz → Completed quiz → Signed up
   - Shows conversion rate at each step

2. **Quiz Completion Rate:**
   - Quiz started → Quiz completed
   - Identify drop-off points

3. **Plan Generation Success Rate:**
   - Plan generation started → Plan generation completed/failed
   - Track error rate

4. **Feature Adoption:**
   - % of users logging meals manually
   - % of users completing workouts
   - % of users joining challenges

5. **Daily Active Users (DAU):**
   - Track unique users per day
   - Identify usage patterns

6. **Retention Cohorts:**
   - Day 1, Day 7, Day 30 retention
   - Track user stickiness

### B. Create Custom Dashboards

**Nutrition Dashboard:**
- Total meals logged
- Manual vs AI-generated meals
- Top searched foods
- Daily nutrition goal achievement rate

**Workout Dashboard:**
- Total workouts completed
- Average workout duration
- Most popular exercises
- Workout completion rate

**Revenue Dashboard:**
- Subscription starts/cancellations
- Payment success/failure rate
- MRR (Monthly Recurring Revenue)
- Customer Lifetime Value (LTV)

---

## 8. Advanced Features

### A. Feature Flags

PostHog supports feature flags for A/B testing:

```typescript
import posthog from 'posthog-js';

// Check if feature is enabled
const isNewDashboardEnabled = posthog.isFeatureEnabled('new-dashboard');

if (isNewDashboardEnabled) {
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}
```

### B. Session Recordings

Enable session recordings to watch user interactions:

```typescript
// In analyticsService.ts initialization
posthog.init(POSTHOG_API_KEY, {
  // ... other config
  session_recording: {
    recordCrossOriginIframes: false,
    maskAllInputs: true, // Mask sensitive inputs
  },
});
```

### C. Heatmaps

PostHog automatically generates heatmaps showing where users click.

---

## 9. Privacy & GDPR Compliance

### A. Respect User Preferences

```typescript
// Check if user opted out of analytics
const hasOptedOut = localStorage.getItem('analytics_opted_out') === 'true';

if (!hasOptedOut) {
  initializeAnalytics();
}
```

### B. Don't Track Sensitive Data

```typescript
// ❌ DON'T track PII
analytics.trackEvent('user_action', {
  email: user.email, // BAD
  password: user.password, // VERY BAD
});

// ✅ DO track anonymized data
analytics.trackEvent('user_action', {
  user_id: user.id,
  user_tier: user.subscription_plan,
});
```

### C. User Opt-Out

Create opt-out mechanism:

```typescript
// In settings page
const handleOptOut = () => {
  localStorage.setItem('analytics_opted_out', 'true');
  posthog.opt_out_capturing();

  // Or completely reset
  posthog.reset();
};
```

---

## 10. Testing

### Local Testing:

```typescript
// Enable debug mode in development
if (import.meta.env.DEV) {
  posthog.debug();
}

// Test an event
import { analytics } from '@/services/analytics/analyticsService';

analytics.trackQuizStarted();
// Check browser console for: "[Analytics] quiz_started"
```

### Verify in PostHog Dashboard:

1. Go to PostHog → Live Events
2. Perform action in your app
3. See event appear in real-time (usually <5 seconds)
4. Check event properties

---

## 11. Performance Impact

PostHog is designed to be lightweight:

- **Bundle size:** ~30KB gzipped
- **Async loading:** Doesn't block page load
- **Batched requests:** Events batched every 10 seconds
- **localStorage caching:** Survives page reloads

**Best practices:**
- Don't track every mouse movement
- Batch events when possible
- Avoid tracking in tight loops

---

## 12. Cost Estimates

### Free Tier:
- 1 million events/month
- **Good for:** MVP with 500-1,000 users
- **Average events per user:** 20-30 per session

### Paid Tier ($0.00045/event after 1M):
- 10 million events = $4.05/month
- **Good for:** 5,000-10,000 active users

### Enterprise:
- Custom pricing for >100M events/month

**Expected usage for GreenLean:**
- Signups: 100/day = 3,000 events
- Quiz completions: 80/day = 2,400 events
- Meal logs: 400/day = 12,000 events
- Workout logs: 200/day = 6,000 events
- **Total:** ~23,400 events/day = 700K/month

**Well within free tier!**

---

## 13. Troubleshooting

### Issue: Events not appearing in PostHog

**Check:**
1. API key is correct in `.env`
2. `VITE_POSTHOG_API_KEY` is set in Vercel
3. PostHog initialized before tracking events
4. Check browser console for errors
5. Verify in PostHog → Live Events

### Issue: Events delayed

**Solution:**
- PostHog batches events every 10 seconds
- Force immediate send: `posthog.capture('event', {...}, { send_instantly: true })`

### Issue: Duplicate events

**Cause:**
- Component re-renders
- Multiple listeners

**Solution:**
- Use `useEffect` with proper dependencies
- Add debouncing for rapid events

---

## 14. Next Steps

1. ✅ Get PostHog API key (3 minutes)
2. ✅ Add to `.env` file
3. ✅ Install `posthog-js` package
4. ✅ Initialize in `main.tsx`
5. ✅ Add tracking to auth flow
6. ✅ Add tracking to quiz flow
7. ✅ Add tracking to plan generation
8. ✅ Add tracking to meal/workout logging
9. ⏸️ Create custom dashboards (post-MVP)
10. ⏸️ Set up feature flags (post-MVP)

---

## 15. Integration Checklist

### High Priority (MVP):
- [x] Analytics service created
- [ ] PostHog initialized in `main.tsx`
- [ ] Track user signup/login/logout
- [ ] Track quiz completion
- [ ] Track plan generation
- [ ] Track meal logging
- [ ] Track workout completion
- [ ] Track subscription events

### Medium Priority (Post-MVP):
- [ ] Track challenge participation
- [ ] Track progress photo uploads
- [ ] Track feature discovery
- [ ] Set up retention cohorts
- [ ] Create custom dashboards
- [ ] Enable session recordings

### Low Priority (Future):
- [ ] A/B testing with feature flags
- [ ] Heatmaps analysis
- [ ] User surveys
- [ ] Product tours

---

## Status: Ready to Integrate! ✅

Analytics service is complete. Just add your PostHog API key and integrate tracking calls into your components.

**Free tier is perfect for MVP** - upgrade when you reach 1M events/month (approximately 5,000-10,000 active users).
