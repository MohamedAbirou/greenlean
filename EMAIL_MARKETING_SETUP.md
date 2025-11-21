# Email Marketing Setup Guide (Resend)

## Overview
GreenLean uses **Resend** for production-grade transactional emails. All email templates are included and ready to use.

---

## 1. Get Resend API Key (FREE)

### Sign Up (2 minutes):
1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email
3. Verify your email address
4. Go to **API Keys** in dashboard
5. Click "Create API Key"
6. Copy your API key (starts with `re_`)

### Free Tier Includes:
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ No credit card required
- ✅ All features included

---

## 2. Configure Environment Variable

Add to your `.env` file:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

**For Production (Vercel):**
1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Add: `VITE_RESEND_API_KEY` = your Resend API key

---

## 3. Verify Your Domain (Optional but Recommended)

For production, verify your domain to send from your own email address:

1. Go to Resend dashboard → **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `greenlean.app`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually 5-10 minutes)
6. Update `FROM_EMAIL` in `src/services/email/emailService.ts`

**Default (Development):**
```typescript
const FROM_EMAIL = "GreenLean <noreply@greenlean.app>";
```

**After Domain Verification:**
```typescript
const FROM_EMAIL = "GreenLean <hello@yourdomain.com>";
```

---

## 4. Email Templates Included

### A. Welcome Email
**Trigger:** User signs up
**File:** `emailService.sendWelcomeEmail()`

**Features:**
- Warm welcome message
- Quick start guide
- Call-to-action to quiz
- Professional design with brand colors

**Usage:**
```typescript
import { emailService } from '@/services/email/emailService';

// After user signup
await emailService.sendWelcomeEmail({
  userName: user.name,
  userEmail: user.email,
});
```

---

### B. Weekly Progress Report
**Trigger:** Every Monday morning (automated)
**File:** `emailService.sendProgressReport()`

**Features:**
- Calories logged this week
- Workouts completed
- Weight change
- Streak days
- Motivational messaging

**Usage:**
```typescript
// Weekly cron job or edge function
await emailService.sendProgressReport(user.email, {
  userName: user.name,
  weekNumber: 4,
  caloriesLogged: 12450,
  workoutsCompleted: 5,
  weightChange: -0.8,
  streakDays: 28,
});
```

---

### C. Re-Engagement Email
**Trigger:** User inactive for 7+ days
**File:** `emailService.sendReEngagementEmail()`

**Features:**
- Gentle reminder
- Benefits recap
- Easy re-entry CTA
- Unsubscribe option

**Usage:**
```typescript
// Daily cron job to check inactive users
await emailService.sendReEngagementEmail(user.email, {
  userName: user.name,
  daysSinceLastLogin: 7,
});
```

---

### D. Plan Generation Complete
**Trigger:** AI plan generation finishes
**File:** `emailService.sendPlanCompleteEmail()`

**Features:**
- Immediate notification
- Direct link to dashboard
- Excitement and motivation

**Usage:**
```typescript
// After successful plan generation
await emailService.sendPlanCompleteEmail(user.email, {
  userName: user.name,
  planType: 'both', // or 'meal' or 'workout'
});
```

---

## 5. Integration Points

### A. Welcome Email (Signup)

**File:** Add to your signup flow (e.g., `src/features/auth/...`)

```typescript
import { emailService } from '@/services/email/emailService';

// After successful user creation
try {
  await emailService.sendWelcomeEmail({
    userName: newUser.name,
    userEmail: newUser.email,
  });
} catch (error) {
  console.error('Failed to send welcome email:', error);
  // Don't block signup if email fails
}
```

---

### B. Plan Complete Email

**File:** `ml_service/app.py` - After plan generation

```python
# After successful plan generation (in background task)
import requests

def send_plan_complete_email(user_email: str, user_name: str, plan_type: str):
    try:
        # Call your Next.js API route or cloud function
        requests.post('https://greenlean.app/api/emails/plan-complete', json={
            'userEmail': user_email,
            'userName': user_name,
            'planType': plan_type,
        })
    except Exception as e:
        logger.error(f"Failed to send plan complete email: {e}")
```

**Or create an API route:** `src/pages/api/emails/plan-complete.ts`

```typescript
import { emailService } from '@/services/email/emailService';

export async function POST(request: Request) {
  const { userEmail, userName, planType } = await request.json();

  await emailService.sendPlanCompleteEmail(userEmail, {
    userName,
    planType,
  });

  return new Response('OK', { status: 200 });
}
```

---

### C. Weekly Progress Reports

**Recommendation:** Use Vercel Cron Jobs or edge functions

**File:** Create `src/pages/api/cron/weekly-reports.ts`

```typescript
import { emailService } from '@/services/email/emailService';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all active users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Send progress reports
  for (const user of users || []) {
    // Calculate user's weekly stats
    const stats = await calculateWeeklyStats(user.id);

    await emailService.sendProgressReport(user.email, {
      userName: user.name,
      weekNumber: Math.ceil((Date.now() - new Date(user.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      ...stats,
    });
  }

  return new Response('OK', { status: 200 });
}
```

**Vercel cron configuration (`vercel.json`):**
```json
{
  "crons": [{
    "path": "/api/cron/weekly-reports",
    "schedule": "0 9 * * 1"
  }]
}
```

---

### D. Re-Engagement Emails

**File:** Create `src/pages/api/cron/re-engagement.ts`

```typescript
import { emailService } from '@/services/email/emailService';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  // Get inactive users (7+ days no login)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: inactiveUsers } = await supabase
    .from('profiles')
    .select('*')
    .lt('last_login', sevenDaysAgo);

  // Send re-engagement emails
  for (const user of inactiveUsers || []) {
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(user.last_login).getTime()) / (24 * 60 * 60 * 1000)
    );

    await emailService.sendReEngagementEmail(user.email, {
      userName: user.name,
      daysSinceLastLogin: daysSinceLogin,
    });
  }

  return new Response('OK', { status: 200 });
}
```

---

## 6. Testing Emails

### Local Testing:

```typescript
// Create a test file: src/services/email/test.ts
import { emailService } from './emailService';

async function testEmails() {
  const testEmail = 'your-email@example.com';

  // Test welcome email
  await emailService.sendWelcomeEmail({
    userName: 'John Doe',
    userEmail: testEmail,
  });

  // Test progress report
  await emailService.sendProgressReport(testEmail, {
    userName: 'John Doe',
    weekNumber: 4,
    caloriesLogged: 12450,
    workoutsCompleted: 5,
    weightChange: -0.8,
    streakDays: 28,
  });

  // Test re-engagement
  await emailService.sendReEngagementEmail(testEmail, {
    userName: 'John Doe',
    daysSinceLastLogin: 7,
  });

  // Test plan complete
  await emailService.sendPlanCompleteEmail(testEmail, {
    userName: 'John Doe',
    planType: 'both',
  });
}

testEmails();
```

Run with: `ts-node src/services/email/test.ts`

---

## 7. Email Best Practices

### DO:
✅ Send welcome email immediately after signup
✅ Keep subject lines under 50 characters
✅ Always include unsubscribe link
✅ Test emails before sending to all users
✅ Monitor open rates and engagement

### DON'T:
❌ Send more than 1 email per week per user (except transactional)
❌ Use spam trigger words (FREE, URGENT, CLICK HERE)
❌ Send emails without user consent
❌ Forget to handle email send failures gracefully

---

## 8. Monitoring & Analytics

### Resend Dashboard:
- **Emails Sent:** Track daily/weekly volume
- **Delivery Rate:** Should be >98%
- **Bounce Rate:** Should be <2%
- **Open Rate:** Aim for >20% (transactional emails typically 40-60%)

### Set Up Webhooks (Optional):
Resend can notify you of email events:
- Delivered
- Opened
- Clicked
- Bounced
- Complained (spam)

---

## 9. Cost Estimates

### Free Tier:
- 100 emails/day = 3,000/month
- **Good for:** MVP with <100 active users

### Paid Tier ($20/month):
- 50,000 emails/month
- **Good for:** 1,000-5,000 active users

### Enterprise:
- Custom pricing for >50K emails/month

---

## 10. Troubleshooting

### Issue: Emails not sending
**Check:**
1. API key is correct in `.env`
2. `VITE_RESEND_API_KEY` is set in Vercel
3. Check Resend dashboard for errors
4. Verify email address format

### Issue: Emails going to spam
**Solution:**
1. Verify your domain (see step 3)
2. Add SPF/DKIM records
3. Avoid spam trigger words
4. Include unsubscribe link

### Issue: Rate limit exceeded
**Solution:**
- Free tier: 100 emails/day
- Upgrade to paid plan
- Batch emails instead of sending all at once

---

## 11. Next Steps

1. ✅ Get Resend API key (2 minutes)
2. ✅ Add `VITE_RESEND_API_KEY` to `.env`
3. ✅ Test welcome email locally
4. ✅ Integrate welcome email into signup flow
5. ⏸️ Set up cron jobs for progress reports (post-MVP)
6. ⏸️ Set up re-engagement emails (post-MVP)
7. ⏸️ Verify domain for production (when ready)

---

## Status: Ready to Use! ✅

All email templates are production-ready. Just add your API key and start sending!

**Free tier is perfect for MVP** - upgrade when you reach 100 users.
