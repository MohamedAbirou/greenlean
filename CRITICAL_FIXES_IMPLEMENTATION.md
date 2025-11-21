# 🔧 Critical Fixes - Implementation Guide
## Priority Tasks for Week 1-2

---

## 1. ADD RATE LIMITING (4 hours)

### Install slowapi:
```bash
cd ml_service
pip install slowapi
pip freeze > requirements.txt
```

### Update `ml_service/app.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Add after app creation
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add to each AI endpoint:
@app.post("/generate-plans")
@limiter.limit("5/hour")  # 5 plans per hour per IP
async def generate_plans(request: GeneratePlansRequest, background_tasks: BackgroundTasks):
    # existing code...

@app.post("/generate-meal-plan")
@limiter.limit("10/hour")
async def generate_meal_plan(...):
    # existing code...

@app.post("/generate-workout-plan")
@limiter.limit("10/hour")
async def generate_workout_plan(...):
    # existing code...
```

### Add user-based rate limiting (better):
```python
# Create new file: ml_service/utils/rate_limiting.py
from slowapi import Limiter
from fastapi import Request

def get_user_id(request: Request) -> str:
    """Extract user_id from request for rate limiting"""
    # Try to get from request body
    if hasattr(request.state, "user_id"):
        return request.state.user_id
    # Fallback to IP
    return request.client.host

limiter = Limiter(key_func=get_user_id)
```

---

## 2. FIX STRIPE WEBHOOK SECURITY (2 hours)

### Update `ml_service/app.py` - Stripe webhook endpoint:
```python
@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    """Stripe webhook endpoint with proper security"""

    # Get signature
    sig_header = request.headers.get("Stripe-Signature")
    if not sig_header:
        logger.error("Missing Stripe signature header")
        raise HTTPException(status_code=400, detail="Missing signature")

    # Get webhook secret
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        logger.error("STRIPE_WEBHOOK_SECRET not configured")
        raise HTTPException(status_code=500, detail="Webhook not configured")

    # Get raw payload
    try:
        payload = await request.body()
    except Exception as e:
        logger.error(f"Error reading webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Verify signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid webhook signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Process event
    logger.info(f"Processing Stripe webhook: {event['type']}")

    try:
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            user_id = session.get("client_reference_id")
            customer_id = session.get("customer")

            if not user_id:
                logger.error("Missing user_id in checkout session")
                return {"status": "error", "message": "Missing user_id"}

            await db_service.set_user_plan(user_id, "pro", customer_id)
            logger.info(f"User {user_id} upgraded to pro")

        elif event["type"] == "customer.subscription.deleted":
            subscription = event["data"]["object"]
            customer_id = subscription.get("customer")

            # Look up user by stripe customer ID
            user_id = await db_service.lookup_user_by_stripe(customer_id)
            if user_id:
                await db_service.set_user_plan(user_id, "free")
                logger.info(f"User {user_id} downgraded to free")
            else:
                logger.warning(f"Could not find user for customer {customer_id}")

        elif event["type"] == "invoice.payment_failed":
            invoice = event["data"]["object"]
            customer_id = invoice.get("customer")
            logger.warning(f"Payment failed for customer {customer_id}")
            # TODO: Send email notification to user

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        # Return 200 so Stripe doesn't retry
        return {"status": "error", "message": str(e)}
```

### Test webhook locally:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Test with sample event
stripe trigger checkout.session.completed
```

---

## 3. ADD RETRY LOGIC TO AI GENERATION (3 hours)

### Install tenacity:
```bash
cd ml_service
pip install tenacity
pip freeze > requirements.txt
```

### Update `ml_service/services/ai_service.py`:
```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
import openai
import anthropic

class AIService:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((
            openai.APIError,
            openai.APIConnectionError,
            anthropic.APIError,
            anthropic.APIConnectionError
        )),
        reraise=True
    )
    async def generate_plan(
        self,
        prompt: str,
        provider: str,
        model: str,
        user_id: str
    ) -> dict:
        """Generate AI plan with automatic retries"""
        logger.info(f"Generating plan for user {user_id} with {provider}/{model}")

        try:
            if provider == "openai":
                return await self._generate_openai(prompt, model)
            elif provider == "anthropic":
                return await self._generate_anthropic(prompt, model)
            # ... other providers
        except Exception as e:
            logger.error(f"AI generation failed for user {user_id}: {e}")
            # Try fallback provider
            return await self._generate_with_fallback(prompt, user_id)

    async def _generate_with_fallback(self, prompt: str, user_id: str) -> dict:
        """Fallback to different AI provider if primary fails"""
        fallback_order = [
            ("openai", "gpt-4o-mini"),
            ("anthropic", "claude-3-5-sonnet-20241022"),
            ("gemini", "gemini-1.5-flash"),
        ]

        for provider, model in fallback_order:
            try:
                logger.info(f"Trying fallback provider {provider} for user {user_id}")
                if provider == "openai" and settings.has_openai:
                    return await self._generate_openai(prompt, model)
                elif provider == "anthropic" and settings.has_anthropic:
                    return await self._generate_anthropic(prompt, model)
                elif provider == "gemini" and settings.has_gemini:
                    return await self._generate_gemini(prompt, model)
            except Exception as e:
                logger.warning(f"Fallback {provider} failed: {e}")
                continue

        raise Exception("All AI providers failed")
```

---

## 4. ADD DATABASE INDEXES (1 hour)

### Run in Supabase SQL Editor:
```sql
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_meal_plans_user_active
ON ai_meal_plans(user_id, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user_active
ON ai_workout_plans(user_id, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_completed
ON challenge_participants(challenge_id, completed);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_completed
ON challenge_participants(user_id, completed);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date
ON workout_logs(user_id, workout_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_nutrition_logs_user_date
ON daily_nutrition_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_water_intake_user_date
ON daily_water_intake(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created
ON quiz_results(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read
ON notifications(recipient_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_plan
ON profiles(plan_id)
WHERE plan_id != 'free';

-- Verify indexes created
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## 5. SET UP ERROR TRACKING (2 hours)

### Install Sentry:
```bash
# Frontend
npm install @sentry/react

# ML Service
cd ml_service
pip install sentry-sdk[fastapi]
pip freeze > requirements.txt
```

### Frontend - Update `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors
  enabled: import.meta.env.PROD, // Only in production
});

// Wrap App component
const SentryApp = Sentry.withProfiler(App);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentryApp />
  </StrictMode>
);
```

### ML Service - Update `ml_service/app.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.asyncpg import AsyncPGIntegration

# Add to lifespan startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Sentry
    if os.getenv("SENTRY_DSN"):
        sentry_sdk.init(
            dsn=os.getenv("SENTRY_DSN"),
            environment=os.getenv("ENVIRONMENT", "production"),
            integrations=[
                FastApiIntegration(),
                AsyncPGIntegration(),
            ],
            traces_sample_rate=0.1,
            profiles_sample_rate=0.1,
        )
        logger.info("Sentry initialized")

    # ... existing startup code
    yield
    # ... existing shutdown code
```

### Add error context:
```python
from sentry_sdk import capture_exception, set_user, set_context

# In AI generation endpoints
async def generate_plans(...):
    # Set user context for Sentry
    set_user({"id": request.user_id})
    set_context("ai_generation", {
        "provider": request.ai_provider,
        "model": request.model_name,
        "quiz_result_id": request.quiz_result_id
    })

    try:
        # ... existing code
    except Exception as e:
        capture_exception(e)
        raise
```

### Get Sentry DSN:
1. Sign up at https://sentry.io (free tier: 5K errors/month)
2. Create new project (React for frontend, Python for backend)
3. Copy DSN
4. Add to `.env`:
```bash
# Frontend .env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# ML service .env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
ENVIRONMENT=production
```

---

## 6. ENVIRONMENT VALIDATION (1 hour)

### Create `ml_service/config/validation.py`:
```python
"""Environment variable validation"""
import os
from typing import List, Tuple

def validate_environment() -> Tuple[bool, List[str]]:
    """
    Validate required environment variables are set.
    Returns (is_valid, list_of_errors)
    """
    errors = []

    # Database
    if not os.getenv("user"):
        errors.append("Missing database user")
    if not os.getenv("password"):
        errors.append("Missing database password")
    if not os.getenv("host"):
        errors.append("Missing database host")
    if not os.getenv("dbname"):
        errors.append("Missing database name")

    # Stripe
    if not os.getenv("STRIPE_SECRET_KEY"):
        errors.append("Missing STRIPE_SECRET_KEY")
    if not os.getenv("STRIPE_WEBHOOK_SECRET"):
        errors.append("Missing STRIPE_WEBHOOK_SECRET")
    if not os.getenv("STRIPE_PRICE_ID"):
        errors.append("Missing STRIPE_PRICE_ID")

    # AI Providers (at least one required)
    has_ai_provider = any([
        os.getenv("OPENAI_API_KEY"),
        os.getenv("ANTHROPIC_API_KEY"),
        os.getenv("GEMINI_API_KEY"),
        os.getenv("LLAMA_API_KEY"),
    ])
    if not has_ai_provider:
        errors.append("No AI provider API key configured")

    # CORS
    if not os.getenv("ALLOWED_ORIGINS"):
        errors.append("Missing ALLOWED_ORIGINS")

    return len(errors) == 0, errors
```

### Update `ml_service/app.py`:
```python
from config.validation import validate_environment

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan with validation"""
    logger.info(f"Starting {settings.APP_TITLE} v{settings.APP_VERSION}")

    # Validate environment
    is_valid, errors = validate_environment()
    if not is_valid:
        logger.error("Environment validation failed:")
        for error in errors:
            logger.error(f"  - {error}")
        raise RuntimeError("Invalid environment configuration")

    logger.info("✅ Environment validation passed")

    # ... rest of startup code
```

---

## 7. LOAD TESTING (4 hours)

### Install k6:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Create `load-tests/api-test.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],    // Error rate under 5%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check returns healthy': (r) => r.json('status') === 'healthy',
  });

  sleep(1);
}
```

### Create `load-tests/ai-generation-test.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<60000'], // AI generation can take up to 60s
    http_req_failed: ['rate<0.1'],      // 10% error rate acceptable for AI
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

// Sample quiz data
const quizData = {
  user_id: `test-user-${__VU}-${Math.random()}`,
  quiz_result_id: `test-quiz-${__VU}-${Math.random()}`,
  ai_provider: "openai",
  model_name: "gpt-4o-mini",
  answers: {
    age: 30,
    gender: "male",
    currentWeight: 80,
    targetWeight: 75,
    height: 180,
    // ... add more required fields
  }
};

export default function () {
  const res = http.post(
    `${BASE_URL}/generate-plans`,
    JSON.stringify(quizData),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '65s',
    }
  );

  check(res, {
    'AI generation status is 200': (r) => r.status === 200,
    'response has calculations': (r) => r.json('nutrition') !== undefined,
  });

  sleep(5); // Wait 5s between requests
}
```

### Run tests:
```bash
# Test health endpoint
k6 run load-tests/api-test.js

# Test AI generation (use staging, not production!)
k6 run -e API_URL=https://your-staging-api.railway.app load-tests/ai-generation-test.js

# Test with specific users
k6 run --vus 50 --duration 2m load-tests/api-test.js
```

### Database load test:
```sql
-- Run in Supabase SQL Editor
-- Check connection pool usage
SELECT count(*), state
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;

-- Check slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 8. DEPLOYMENT CHECKLIST

### Before deploying to production:

#### Environment Variables:
- [ ] All secrets rotated (new Supabase keys, new Stripe keys)
- [ ] ALLOWED_ORIGINS set to production domain only
- [ ] Sentry DSN configured
- [ ] AI provider API keys have billing limits set

#### Supabase:
- [ ] Database backups enabled (daily)
- [ ] Connection pooling configured
- [ ] RLS policies tested
- [ ] Email templates customized

#### Vercel:
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled

#### ML Service (Railway):
- [ ] Environment variables set
- [ ] Health check endpoint configured
- [ ] Auto-deploy from main branch
- [ ] Resource limits set (prevent runaway costs)

#### Stripe:
- [ ] Webhook endpoint updated to production URL
- [ ] Test mode disabled
- [ ] Products and prices created
- [ ] Customer portal configured

#### Monitoring:
- [ ] Sentry alerts configured
- [ ] Slack/email notifications for critical errors
- [ ] Uptime monitoring (UptimeRobot, free)
- [ ] Log retention configured

---

## 9. POST-DEPLOYMENT MONITORING

### Day 1-7 checklist:
- [ ] Monitor Sentry for errors
- [ ] Check Vercel analytics for traffic
- [ ] Monitor database connection pool
- [ ] Check AI generation success rate
- [ ] Monitor Stripe webhooks (Dashboard > Webhooks)
- [ ] Check user feedback/support requests
- [ ] Monitor response times (Vercel Speed Insights)

### Weekly checklist:
- [ ] Review error logs
- [ ] Check database performance
- [ ] Review AI costs (OpenAI usage dashboard)
- [ ] Analyze user behavior (Vercel Analytics)
- [ ] Check conversion rates (free → paid)

---

## 🚨 ROLLBACK PLAN

If something goes wrong in production:

1. **Rollback deployment:**
   ```bash
   # Vercel: Dashboard > Deployments > Previous > Promote
   # Railway: Dashboard > Deployments > Rollback
   ```

2. **Check errors:**
   - Sentry dashboard
   - Vercel logs
   - Railway logs
   - Supabase logs

3. **Database rollback (if needed):**
   - Supabase: Dashboard > Database > Backups > Restore

4. **Notify users:**
   - Status page update
   - Email notification
   - Social media post

---

**Total Estimated Time: 13-15 hours (2-3 days)**

Good luck with the fixes! 🚀
