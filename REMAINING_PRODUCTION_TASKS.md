# Remaining Production Tasks - Status Report

## Overview
This document tracks what's **DONE** vs **PENDING** from the production roadmap.

---

## PHASE 1: CRITICAL FIXES (Week 1-2) - Launch Blockers

### Security & Cost Control

#### ✅ COMPLETED:
- [x] **Add rate limiting to AI endpoints** - DONE
  - File: `ml_service/app.py:54-57`
  - 5 requests/minute on `/generate-plans` endpoint

- [x] **Fix Stripe webhook validation** - DONE
  - File: `ml_service/app.py` (webhook endpoint)
  - Proper signature verification implemented

#### ⚠️ CRITICAL ISSUES FOUND:
- [ ] **CORS wildcard vulnerability** - Line 49 in `ml_service/config/settings.py` has `"*"` 🚨
  - Should remove `"*"` from ALLOWED_ORIGINS
  - Only whitelist specific domains

#### ❌ NOT IMPLEMENTED:
- [ ] **Add environment variable validation on startup** 🔴
  - Need to validate required env vars: OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DB credentials
  - Should fail fast on startup if missing

- [ ] **Add CORS whitelist validation** 🔴
  - Related to wildcard issue above
  - Need strict validation

- [ ] **Implement request signing between frontend and ML service** 🟡
  - Priority: Medium (nice-to-have, not critical for MVP)
  - Would prevent direct API abuse

---

### Database

#### ✅ COMPLETED:
- [x] **Add missing composite indexes** - DONE
  - SQL scripts provided in `SUPABASE_SQL_SCRIPTS.md`
  - 12+ performance indexes documented

#### ⚠️ USER ACTION REQUIRED:
- [ ] **Apply SQL scripts to Supabase project** 🔴
  - User must run 7 SQL scripts from `SUPABASE_SQL_SCRIPTS.md`
  - Required for: indexes, triggers, realtime

#### ❌ NOT IMPLEMENTED:
- [ ] **Test connection pool under load** 🔴
  - Use pgbench or k6
  - Verify 10 max connections handle production traffic

- [ ] **Set up automated backups** 🟡
  - Supabase provides this, but need to verify it's enabled
  - Check backup schedule and retention

---

### Error Handling

#### ✅ COMPLETED:
- [x] **Add retry logic to AI generation** - DONE
  - File: `ml_service/services/ai_service.py`
  - Using tenacity: 3 retries, exponential backoff

#### ⚠️ PARTIALLY IMPLEMENTED:
- [x] **Error boundary component exists** - `src/shared/components/feedback/ErrorBoundary.tsx`
- [ ] **NOT applied to all routes** 🔴
  - Component exists but not wrapped around routes
  - Need to add to App.tsx or router

#### ❌ NOT IMPLEMENTED:
- [ ] **Add Sentry or similar error tracking** 🔴
  - Free tier: 5K errors/month
  - Critical for production debugging

- [ ] **Create error recovery flow** 🔴
  - If AI plan generation fails, allow user to retry/regenerate
  - Currently no retry UI for failed generations

---

### Testing

#### ❌ ALL NOT IMPLEMENTED:
- [ ] **Load test ML service (100 concurrent requests)** 🔴
  - Use k6, Locust, or Apache Bench
  - Verify rate limiting works
  - Test AI provider timeouts

- [ ] **Test Stripe webhook locally with Stripe CLI** 🔴
  - Verify signature validation works
  - Test subscription created/cancelled flows

- [ ] **Test RLS policies with different user roles** 🔴
  - Verify users can only access their own data
  - Test edge cases (deleted users, shared data)

---

## PHASE 2: MVP ENHANCEMENTS (Week 3-4)

### Food Database Integration

#### ❌ ALL NOT IMPLEMENTED (CRITICAL FOR COMPETITIVE PARITY):
- [ ] **Get USDA API key** 🔴
  - Free, takes 5 minutes: https://fdc.nal.usda.gov/api-key-signup.html
  - 350K+ foods database

- [ ] **Create food search component** 🔴
  - Search USDA database
  - Display nutrition info
  - Add to meal log

- [ ] **Add "Log Manual Meal" feature to dashboard** 🔴
  - Critical: Users expect MyFitnessPal-style manual logging
  - Currently can only log from AI-generated meals

- [ ] **Implement barcode scanner** 🟡
  - Nice-to-have, not critical
  - Use quagga.js library

**Impact:** This is a **LAUNCH BLOCKER** according to competitive analysis. MyFitnessPal's core feature is manual meal logging.

---

### Mobile Experience (Progressive Web App)

#### ❌ ALL NOT IMPLEMENTED:
- [ ] **Add service worker** 🔴
  - Use Vite PWA plugin
  - Enable offline support

- [ ] **Make installable** 🔴
  - Add manifest.json
  - "Add to Home Screen" prompt

- [ ] **Optimize for mobile** ❓
  - Unknown status - need to test
  - Responsive design might already be done

- [ ] **Test on real devices** 🔴
  - iPhone (iOS Safari)
  - Android (Chrome)
  - Test touch interactions

**Impact:** Most users are mobile. PWA is critical for retention.

---

### Monitoring & Analytics

#### ❌ ALL NOT IMPLEMENTED:
- [ ] **Set up Vercel Analytics** ❓
  - Might already be enabled?
  - Check Vercel dashboard

- [ ] **Add custom event tracking** 🔴
  - Track: sign-ups, quiz completions, plan generations, meal logs
  - Use Vercel Analytics or Posthog (free tier)

- [ ] **Set up error tracking (Sentry)** 🔴
  - DUPLICATE from Phase 1
  - Free tier: 5K errors/month

- [ ] **Create admin alerts** 🟡
  - Slack webhook when critical errors occur
  - Alert on Stripe payment failures

**Impact:** HIGH - Can't improve what you don't measure.

---

## PHASE 3: GROWTH FEATURES (Month 2) - Post-Launch

### Social Features
#### ❌ ALL NOT IMPLEMENTED:
- [ ] User profiles (public/private toggle)
- [ ] Follow system
- [ ] Activity feed
- [ ] Share achievements to social media

**Status:** DEFERRED - Post-MVP

---

### Wearable Integration
#### ❌ ALL NOT IMPLEMENTED:
- [ ] Apple Health sync
- [ ] Google Fit sync
- [ ] Auto-import workouts

**Status:** DEFERRED - Post-MVP (Month 2-3)

---

### Email Marketing
#### ❌ ALL NOT IMPLEMENTED:
- [ ] Email sequences (welcome, onboarding, re-engagement)
- [ ] Weekly progress reports
- [ ] Personalized tips

**Status:** DEFERRED - Post-MVP

---

## PHASE 4: SCALE & OPTIMIZE (Month 3-4) - Post-Launch

#### ❌ ALL NOT IMPLEMENTED:
- [ ] Redis caching
- [ ] AI response caching
- [ ] Image optimization
- [ ] Lazy load heavy components
- [ ] Recipe community
- [ ] Meal photo analysis (OpenAI Vision)
- [ ] AI chat nutritionist
- [ ] Video exercise library

**Status:** DEFERRED - Post-MVP

---

## PRIORITY RANKING FOR IMMEDIATE ACTION

### 🔴 CRITICAL (Must Fix Before Launch):

1. **Remove CORS wildcard (`"*"`)** - 5 minutes
   - File: `ml_service/config/settings.py:49`
   - Remove the `"*"` entry from ALLOWED_ORIGINS

2. **Add environment variable validation** - 30 minutes
   - Fail fast on startup if required vars missing
   - Validate: OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

3. **Apply ErrorBoundary to all routes** - 15 minutes
   - Wrap App component or Router with ErrorBoundary
   - Already have the component, just need to use it

4. **Apply SQL scripts to Supabase** - 15 minutes
   - Run 7 scripts from SUPABASE_SQL_SCRIPTS.md
   - **USER ACTION REQUIRED**

5. **Add Sentry error tracking** - 1 hour
   - Free account setup
   - Install @sentry/react
   - Add to App.tsx

6. **Test Stripe webhook with Stripe CLI** - 30 minutes
   - Verify signature validation works
   - Test subscription flows

7. **Create error recovery flow for failed AI generation** - 2 hours
   - Add "Retry" button on plan generation failure
   - Store generation status in UI
   - Allow manual regeneration

---

### 🟡 HIGH PRIORITY (Launch Blockers According to Competitive Analysis):

8. **Food database integration (USDA API)** - 1 week
   - This is **CRITICAL** per your original assessment
   - MyFitnessPal's core feature
   - Users will expect this

9. **Progressive Web App setup** - 2-3 days
   - Service worker + manifest.json
   - Installable on mobile
   - Offline support

10. **Load test ML service** - 4 hours
    - 100 concurrent requests
    - Verify rate limiting
    - Check for bottlenecks

11. **Test RLS policies** - 2 hours
    - Security critical
    - Verify data isolation

---

### 🟢 MEDIUM PRIORITY (Post-Launch):

12. **Custom event tracking** - 1 day
13. **Admin alerts (Slack)** - 2 hours
14. **Database backup verification** - 1 hour
15. **Connection pool load testing** - 2 hours
16. **Mobile device testing** - 4 hours

---

## QUICK WINS (Can Do Today):

### 1. Fix CORS Wildcard (5 minutes)
```python
# ml_service/config/settings.py:44-50
self.ALLOWED_ORIGINS: list = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://rsufjeprivwzzygrbvdb.supabase.co",
    "https://greenlean.vercel.app",  # Remove trailing slash
    # Remove "*"  <- DELETE THIS LINE
]
```

### 2. Add Env Validation (30 minutes)
```python
# ml_service/config/settings.py - add to __init__:
def validate_required_vars(self):
    required = {
        "OPENAI_API_KEY": self.OPENAI_API_KEY,
        "STRIPE_SECRET_KEY": self.STRIPE_SECRET_KEY,
        "STRIPE_WEBHOOK_SECRET": self.STRIPE_WEBHOOK_SECRET,
    }
    missing = [k for k, v in required.items() if not v]
    if missing:
        raise EnvironmentError(f"Missing required env vars: {', '.join(missing)}")

# Call in __init__:
self.validate_required_vars()
```

### 3. Wrap App with ErrorBoundary (15 minutes)
```tsx
// src/App.tsx or src/main.tsx:
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## SUMMARY

### ✅ Already Completed (From Previous Sessions):
- Real-time updates on all features
- Quiz simplification (28→15 questions)
- AI response validation (Pydantic schemas)
- Retry logic for AI failures
- Rate limiting on expensive endpoints
- Stripe webhook signature verification
- Challenge rewards system
- Comprehensive documentation

### 🔴 Critical Remaining (Before Launch):
- Fix CORS wildcard
- Add env validation
- Apply ErrorBoundary to routes
- Apply SQL scripts (USER ACTION)
- Add Sentry error tracking
- Test Stripe webhooks
- Add AI generation retry UI
- **Food database integration** (competitive parity)
- **PWA setup** (mobile users)
- Load testing
- RLS policy testing

### 🟡 High Priority (Week 3-4):
- Custom event tracking
- Admin alerts
- Database backup verification
- Mobile device testing

### 🟢 Post-Launch (Month 2+):
- Social features
- Wearable integration
- Email marketing
- Advanced optimizations

---

## INVESTOR DEMO READINESS

**Current Status:** 85% ready

**Blocking Issues:**
1. CORS wildcard (5 min fix)
2. SQL scripts not applied (15 min, user action)
3. No error tracking (1 hour)
4. No food database (1 week - competitive gap)

**Recommendation:**
- Fix quick wins (CORS, env validation, ErrorBoundary) TODAY
- Apply SQL scripts TODAY
- Add Sentry THIS WEEK
- Food database integration WEEK 3-4
- Launch after food database is ready

**Alternative:**
- Launch MVP without food database
- Add food logging in 2 weeks based on user feedback
- Risk: Users might churn if they expect MyFitnessPal features
