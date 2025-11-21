# Slack Alerts Setup Guide

## Overview
GreenLean uses **Slack webhooks** to send real-time alerts to administrators about critical events, errors, and important user activities.

---

## 1. Create Slack Webhook (FREE - 2 minutes)

### Option A: Using Slack Workspace (Recommended)

1. **Create Slack Workspace** (if you don't have one):
   - Go to [https://slack.com/create](https://slack.com/create)
   - Follow signup process
   - Create a workspace (e.g., "GreenLean Team")

2. **Create Incoming Webhook:**
   - Go to [https://api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name: "GreenLean Alerts"
   - Select your workspace
   - Click "Create App"

3. **Enable Incoming Webhooks:**
   - In app settings, click "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to **ON**
   - Click "Add New Webhook to Workspace"
   - Select channel (e.g., #alerts or #admin)
   - Click "Allow"

4. **Copy Webhook URL:**
   - Your webhook URL will look like:
     ```
     https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
     ```
   - Copy this URL - you'll need it!

### Free Tier Includes:
- ✅ Unlimited webhooks
- ✅ Unlimited messages
- ✅ 90-day message history
- ✅ 10 app integrations
- ✅ No credit card required

---

## 2. Configure Environment Variable

Add to your `.env` file:

```env
# Slack Webhook for Admin Alerts
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**For Production (Vercel):**
1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add: `VITE_SLACK_WEBHOOK_URL` = your Slack webhook URL

---

## 3. What's Already Integrated

✅ **Alert Service** (`src/services/alerts/alertService.ts`)
- Severity levels (info, warning, error, critical)
- Color-coded alerts
- Rich attachments with details
- 15+ predefined alert functions

✅ **Alert Types:**

**Critical Alerts (Red):**
- Payment failures
- ML service down
- Database errors
- High error rate
- Low server resources (>95%)

**Error Alerts (Red):**
- Plan generation failures
- API errors

**Warning Alerts (Orange):**
- Subscription cancellations
- Rate limit exceeded
- Suspicious activity
- Low cache hit rate
- Low server resources (>80%)

**Info Alerts (Green):**
- New user signups
- First workout completed
- Milestone achievements

---

## 4. How Alerts Look in Slack

### Example: Payment Failed Alert
```
🚨 CRITICAL

Payment Failed
Payment of $29.99 failed for Premium plan

User ID: abc-123-def
Amount: $29.99
Plan: Premium
Error Message: Card declined
Timestamp: 2025-01-15T10:30:00Z

GreenLean Alerts | 10:30 AM
```

### Example: Plan Generation Failed Alert
```
❌ ERROR

Plan Generation Failed
Failed to generate both plan for user

User ID: abc-123-def
Plan Type: both
Error Message: OpenAI API rate limit exceeded
Timestamp: 2025-01-15T10:30:00Z

GreenLean Alerts | 10:30 AM
```

### Example: New User Signup Alert
```
ℹ️ INFO

New User Signup
New user signed up via email

User ID: abc-123-def
Email: user@example.com
Signup Method: email
Timestamp: 2025-01-15T10:30:00Z

GreenLean Alerts | 10:30 AM
```

---

## 5. How to Use

### A. Import Alert Service

```typescript
import { alertService } from '@/services/alerts/alertService';
```

### B. Send Custom Alerts

```typescript
// Info alert
await alertService.info('Feature Released', 'New dashboard launched', {
  version: '2.0.0',
  users_affected: 1000,
});

// Warning alert
await alertService.warning('High API Usage', 'Approaching rate limit', {
  current_usage: 8500,
  limit: 10000,
});

// Error alert
await alertService.error('Integration Failed', 'Stripe webhook error', {
  webhook_id: 'wh_123',
  error: 'Signature verification failed',
});

// Critical alert
await alertService.critical('System Down', 'Database unavailable', {
  database: 'production',
  last_successful_query: '5 minutes ago',
});
```

### C. Use Predefined Alert Functions

```typescript
import {
  alertPlanGenerationFailed,
  alertPaymentFailed,
  alertMLServiceDown,
  alertNewUserSignup,
} from '@/services/alerts/alertService';

// Plan generation failure
await alertPlanGenerationFailed(userId, 'both', 'OpenAI timeout');

// Payment failure
await alertPaymentFailed(userId, 29.99, 'Premium', 'Card declined');

// ML service down
await alertMLServiceDown(lastSuccessfulCall);

// New user signup
await alertNewUserSignup(userId, 'user@example.com', 'email');
```

---

## 6. Integration Points

### A. Plan Generation Errors

**File:** `ml_service/app.py` or frontend plan generation hook

```python
# Python ML Service
import requests
import os

SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK_URL')

def alert_plan_failure(user_id: str, plan_type: str, error: str):
    if not SLACK_WEBHOOK:
        return

    payload = {
        "text": "🚨 *CRITICAL*",
        "attachments": [{
            "color": "#ff0000",
            "title": "Plan Generation Failed",
            "text": f"Failed to generate {plan_type} plan for user",
            "fields": [
                {"title": "User ID", "value": user_id, "short": True},
                {"title": "Plan Type", "value": plan_type, "short": True},
                {"title": "Error", "value": error, "short": False}
            ]
        }]
    }

    try:
        requests.post(SLACK_WEBHOOK, json=payload, timeout=5)
    except:
        pass  # Don't fail the request if alert fails

# Use in exception handler
try:
    plan = generate_meal_plan(quiz_answers)
except Exception as e:
    alert_plan_failure(user_id, 'meal', str(e))
    raise
```

**TypeScript Frontend:**
```typescript
import { alertPlanGenerationFailed } from '@/services/alerts/alertService';

try {
  const plan = await generatePlan(quizAnswers);
} catch (error) {
  // Alert admins
  await alertPlanGenerationFailed(userId, 'both', error.message);

  // Show user-friendly error
  toast.error('Plan generation failed. Our team has been notified.');
}
```

### B. Payment Failures

**File:** Stripe webhook handler

```typescript
import { alertPaymentFailed } from '@/services/alerts/alertService';

// In Stripe webhook handler
if (event.type === 'invoice.payment_failed') {
  const invoice = event.data.object;

  await alertPaymentFailed(
    invoice.customer,
    invoice.amount_due / 100,
    invoice.lines.data[0].plan.nickname,
    invoice.last_payment_error?.message || 'Unknown error'
  );
}
```

### C. ML Service Health Check

**File:** Create health check endpoint or cron job

```typescript
import { alertMLServiceDown } from '@/services/alerts/alertService';

// Check ML service health every 5 minutes
setInterval(async () => {
  try {
    const response = await fetch('http://ml-service:5000/health', {
      timeout: 5000,
    });

    if (!response.ok) {
      throw new Error('ML service unhealthy');
    }

    // Update last successful call
    lastSuccessfulMLCall = new Date();
  } catch (error) {
    // Alert if service has been down for >5 minutes
    const downtime = Date.now() - lastSuccessfulMLCall.getTime();
    if (downtime > 5 * 60 * 1000) {
      await alertMLServiceDown(lastSuccessfulMLCall);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

### D. High Error Rate Monitoring

**File:** Error tracking middleware or Sentry integration

```typescript
import { alertHighErrorRate } from '@/services/alerts/alertService';

// Track errors in memory
let errorCount = 0;
let errorWindow = Date.now();

// Reset every hour
setInterval(() => {
  if (errorCount > 100) {
    alertHighErrorRate(errorCount, '1 hour');
  }
  errorCount = 0;
  errorWindow = Date.now();
}, 60 * 60 * 1000);

// Increment on error
window.addEventListener('error', (event) => {
  errorCount++;
});
```

### E. Subscription Events

**File:** Stripe webhook handler

```typescript
import { alertSubscriptionCancelled, alertNewUserSignup } from '@/services/alerts/alertService';

// Subscription cancelled
if (event.type === 'customer.subscription.deleted') {
  const subscription = event.data.object;

  await alertSubscriptionCancelled(
    subscription.customer,
    subscription.plan.nickname,
    subscription.cancellation_details?.reason
  );
}

// New signup (from auth flow)
await alertNewUserSignup(user.id, user.email, 'email');
```

### F. Rate Limiting

**File:** API rate limiter middleware

```typescript
import { alertRateLimitExceeded } from '@/services/alerts/alertService';

// When rate limit is hit
if (requestCount > rateLimit) {
  await alertRateLimitExceeded(userId, endpoint, requestCount);

  return res.status(429).json({
    error: 'Rate limit exceeded',
  });
}
```

---

## 7. Best Practices

### DO:
✅ Alert on critical errors (payments, database, ML service)
✅ Use appropriate severity levels
✅ Include relevant context (user ID, error message)
✅ Set up dedicated #alerts channel
✅ Configure Slack notifications (mobile app)

### DON'T:
❌ Alert on every error (creates noise)
❌ Send PII (passwords, credit cards) in alerts
❌ Block user requests waiting for alerts
❌ Use alerts for debug logging
❌ Alert on expected errors (404s, validation)

---

## 8. Alert Thresholds

### Critical (Immediate Action):
- Payment failures
- Database down
- ML service down (>5 min)
- Error rate >100/hour
- Server resources >95%

### Warning (Investigate Soon):
- Subscription cancellations
- Rate limits exceeded
- Cache hit rate <50%
- Error rate >50/hour
- Server resources >80%

### Info (FYI):
- New user signups
- Major milestones
- Feature launches
- First-time achievements

---

## 9. Slack Channel Setup

### Recommended Channels:

1. **#alerts-critical** (High priority)
   - Payment failures
   - Service outages
   - Database errors
   - Configure mobile notifications

2. **#alerts-errors** (Medium priority)
   - Plan generation failures
   - API errors
   - Check daily

3. **#alerts-info** (Low priority)
   - New signups
   - Milestones
   - Check weekly

4. **#monitoring** (Automated)
   - Server health checks
   - Cache statistics
   - Daily summaries

---

## 10. Testing

### Test Locally:

```typescript
import { alertService } from '@/services/alerts/alertService';

// Send test alert
await alertService.info('Test Alert', 'Testing Slack integration', {
  environment: 'development',
  timestamp: new Date().toISOString(),
});
```

### Verify in Slack:
1. Run the test code
2. Check your Slack channel
3. Alert should appear within 2-3 seconds
4. Verify formatting and colors

---

## 11. Troubleshooting

### Issue: Alerts not appearing in Slack

**Check:**
1. Webhook URL is correct in `.env`
2. `VITE_SLACK_WEBHOOK_URL` is set in Vercel
3. Slack app has permission to post
4. Webhook hasn't been revoked
5. Check browser console for errors

### Issue: Alerts showing as "Unknown webhook"

**Solution:**
- Webhook was deleted or revoked
- Create new webhook in Slack
- Update `.env` with new URL

### Issue: Too many alerts (spam)

**Solution:**
- Increase thresholds
- Add debouncing/batching
- Use different severity levels
- Separate into multiple channels

---

## 12. Advanced: Alert Batching

Avoid spam by batching similar alerts:

```typescript
// Batch similar errors
const errorBatch: Record<string, number> = {};

function batchError(errorType: string) {
  errorBatch[errorType] = (errorBatch[errorType] || 0) + 1;
}

// Send batch summary every 10 minutes
setInterval(() => {
  if (Object.keys(errorBatch).length > 0) {
    const summary = Object.entries(errorBatch)
      .map(([type, count]) => `${type}: ${count}`)
      .join('\n');

    alertService.warning(
      'Error Summary (10 min)',
      summary,
      errorBatch
    );

    // Reset batch
    Object.keys(errorBatch).forEach(key => delete errorBatch[key]);
  }
}, 10 * 60 * 1000);
```

---

## 13. Monitoring Dashboard

Create a daily summary alert:

```typescript
// Daily summary at 9 AM
import { alertService } from '@/services/alerts/alertService';

async function sendDailySummary() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Query statistics
  const stats = await getDailyStats(yesterday);

  await alertService.info(
    'Daily Summary',
    `GreenLean metrics for ${yesterday.toDateString()}`,
    {
      new_signups: stats.signups,
      active_users: stats.activeUsers,
      plans_generated: stats.plansGenerated,
      meals_logged: stats.mealsLogged,
      workouts_completed: stats.workoutsCompleted,
      revenue: `$${stats.revenue}`,
      error_count: stats.errors,
    }
  );
}

// Schedule for 9 AM daily (use cron job)
```

---

## 14. Cost

**Slack Free Tier:**
- ✅ Unlimited webhooks
- ✅ Unlimited messages
- ✅ 90-day history
- ✅ Perfect for MVP

**Slack Pro ($7.25/user/month):**
- Unlimited message history
- Unlimited apps
- Group calls
- Only needed when team grows

**Expected Usage:**
- Critical alerts: 1-5 per day
- Warning alerts: 5-20 per day
- Info alerts: 50-100 per day
- **Total:** 50-125 alerts/day

**Well within free tier!**

---

## 15. Next Steps

1. ✅ Create Slack workspace (2 minutes)
2. ✅ Create incoming webhook (2 minutes)
3. ✅ Add webhook URL to `.env`
4. ✅ Test alert locally
5. ✅ Integrate into plan generation error handler
6. ✅ Integrate into payment failure handler
7. ✅ Set up mobile Slack notifications
8. ⏸️ Create daily summary (post-MVP)
9. ⏸️ Set up alert batching (post-MVP)

---

## 16. Integration Checklist

### High Priority (MVP):
- [ ] Slack webhook configured
- [ ] Alert service tested
- [ ] Plan generation failures alerting
- [ ] Payment failures alerting
- [ ] ML service down alerting
- [ ] High error rate alerting

### Medium Priority (Post-MVP):
- [ ] New signup notifications
- [ ] Subscription cancellation alerts
- [ ] Rate limit alerts
- [ ] Daily summary reports

### Low Priority (Future):
- [ ] Alert batching
- [ ] Multiple Slack channels
- [ ] Custom alert routing
- [ ] Alert acknowledgment system

---

## Status: Ready to Use! ✅

Alert service is complete. Just add your Slack webhook URL and integrate alert calls into your error handlers.

**Free tier is perfect for MVP** - unlimited alerts with 90-day history.
