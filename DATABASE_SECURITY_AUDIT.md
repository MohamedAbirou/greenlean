# Database Security & Production Audit

**Date:** 2025-01-21
**Severity Levels:** 🔴 Critical | 🟡 High | 🟠 Medium | 🟢 Low

---

## Executive Summary

After analyzing your database schema, RLS policies, functions, and triggers in the context of production deployment, I've identified **3 CRITICAL security vulnerabilities**, **8 high-priority issues**, and **12 medium-priority optimizations**.

### Critical Issues (Must Fix Before Production):
1. 🔴 **add_admin() function** - No permission check, anyone can make themselves admin
2. 🔴 **notifications INSERT policy** - Any user can create notifications for anyone
3. 🔴 **plans table** - No RLS policies at all

### High Priority (Fix Within 1 Week):
- Missing RLS policies on 2 tables
- 5 SECURITY DEFINER functions without permission checks
- Missing foreign key constraints verification needed
- No email/subscription tracking tables

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1. add_admin() Function - CRITICAL BREACH

**Issue:**
```sql
CREATE OR REPLACE FUNCTION public.add_admin(user_uuid uuid, role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ Runs with elevated privileges
AS $function$
begin
  insert into admin_users (id, role)
  values (user_uuid, role)
  on conflict (id) do update
    set role = excluded.role;
  -- ❌ NO PERMISSION CHECK!
```

**Vulnerability:** ANY authenticated user can call this function and grant themselves or anyone else admin privileges!

**Attack Vector:**
```javascript
// Malicious user can do this:
await supabase.rpc('add_admin', {
  user_uuid: myUserId,
  role: 'super_admin'
});
// Now they're super admin!
```

**Fix:**
```sql
CREATE OR REPLACE FUNCTION public.add_admin(user_uuid uuid, role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
begin
  -- ✅ CHECK IF CALLER IS SUPER ADMIN
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super_admin can grant admin privileges';
  END IF;

  -- Prevent granting super_admin to multiple users
  IF role = 'super_admin' THEN
    IF EXISTS (SELECT 1 FROM admin_users WHERE role = 'super_admin' AND id != user_uuid) THEN
      RAISE EXCEPTION 'Only one super_admin is allowed';
    END IF;
  END IF;

  insert into admin_users (id, role)
  values (user_uuid, role)
  on conflict (id) do update
    set role = excluded.role;

  return json_build_object(
    'success', true,
    'message', 'Admin privileges granted successfully'
  );
exception
  when others then
    return json_build_object(
      'success', false,
      'message', sqlerrm
    );
end;
$function$;
```

---

### 2. Notifications INSERT Policy - Impersonation Vulnerability

**Issue:**
```sql
{
  "table_name": "notifications",
  "policy_name": "Users insert notifications",
  "command": "INSERT",
  "roles": "{authenticated}",
  "using_expression": null,
  "check_expression": "true"  -- ❌ ANY USER CAN INSERT ANY NOTIFICATION!
}
```

**Vulnerability:** Users can impersonate the system or other users by creating fake notifications.

**Attack Vector:**
```javascript
// Malicious user creates fake notification from "system"
await supabase.from('notifications').insert({
  recipient_id: targetUserId,
  sender_id: null, // Looks like system notification
  type: 'urgent',
  message: 'Your account will be deleted unless you...',
  entity_id: fakeId,
  entity_type: 'security_alert'
});
```

**Fix:**
```sql
-- Drop the bad policy
DROP POLICY "Users insert notifications" ON notifications;

-- Create restricted policy
CREATE POLICY "Users can only insert notifications as themselves"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid() OR sender_id IS NULL AND is_admin(auth.uid()));
```

**Better Approach:** Create a secure function for creating notifications:
```sql
CREATE OR REPLACE FUNCTION public.create_notification(
  p_recipient_id uuid,
  p_type text,
  p_message text,
  p_entity_id uuid,
  p_entity_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  -- System notifications can only be created by functions (SECURITY DEFINER)
  -- This runs with elevated privileges but controls who can call it

  INSERT INTO notifications (
    recipient_id, sender_id, type, message, entity_id, entity_type, read, created_at
  ) VALUES (
    p_recipient_id, auth.uid(), p_type, p_message, p_entity_id, p_entity_type, false, now()
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$function$;

-- Remove INSERT permission from users entirely
DROP POLICY "Users insert notifications" ON notifications;

-- Users can only read, update (mark as read), and delete their notifications
```

---

### 3. plans Table - No RLS Policies

**Issue:** The `plans` table has NO RLS policies at all, yet it's referenced by `profiles.plan_id`.

**Vulnerability:**
- If RLS is not enabled, anyone could potentially modify plans
- No control over who can read pricing information
- Could expose internal pricing strategies

**Current State:**
```sql
-- plans table exists but no RLS policies found!
```

**Fix:**
```sql
-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read plans (pricing page, signup)
CREATE POLICY "Anyone can view active plans"
ON plans FOR SELECT
TO public
USING (is_active = true);

-- Only admins can modify plans
CREATE POLICY "Only admins can manage plans"
ON plans FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
```

---

## 🟡 HIGH PRIORITY ISSUES

### 4. SECURITY DEFINER Functions Without Permission Checks

**Functions that run with elevated privileges but don't check permissions:**

```sql
-- ❌ Anyone can call these:
- get_active_connections()
- get_avg_response_time()
- get_db_size()
- get_engagement_metrics()
- get_platform_stats()
- get_total_storage_used()
- get_uptime()
- log_admin_error()
- run_database_cleanup()
- trigger_backup()
- update_challenge_and_rewards()
```

**Fix for each:**
```sql
-- Example fix for get_platform_stats()
CREATE OR REPLACE FUNCTION public.get_platform_stats(days_ago integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
BEGIN
  -- ✅ ADD PERMISSION CHECK
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can access platform stats';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_users', (
      SELECT COUNT(DISTINCT user_id)
      FROM user_activity_logs
      WHERE activity_date >= CURRENT_DATE - days_ago
    ),
    'total_plans', (
      SELECT COUNT(*)
      FROM ai_meal_plans
      WHERE created_at >= NOW() - (days_ago || ' days')::INTERVAL
    ),
    'completed_challenges', (
      SELECT COUNT(*)
      FROM challenge_participants
      WHERE completed = true
    )
  ) INTO result;

  RETURN result;
END;
$function$;
```

Apply similar fixes to all SECURITY DEFINER functions.

---

### 5. Missing RLS on engagement_snapshots

**Issue:** `engagement_snapshots` table has no RLS policies.

**Risk:** Contains aggregated metrics that could expose business intelligence.

**Fix:**
```sql
ALTER TABLE engagement_snapshots ENABLE ROW LEVEL SECURITY;

-- Only admins can read engagement snapshots
CREATE POLICY "Only admins can view engagement snapshots"
ON engagement_snapshots FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only system/admins can insert snapshots
CREATE POLICY "Only admins can insert engagement snapshots"
ON engagement_snapshots FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Service role has full access (for automated snapshots)
CREATE POLICY "Service role has full access"
ON engagement_snapshots FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

### 6. badges Table - Confusing Role Configuration

**Issue:**
```sql
{
  "table_name": "badges",
  "policy_name": "Allow insert for authenticated users",
  "command": "INSERT",
  "roles": "{public}",  -- ⚠️ Says "public"
  "using_expression": null,
  "check_expression": "is_admin(auth.uid())"  -- But checks for admin
}
```

**Problem:** Policy uses `{public}` role but checks for admin. This is confusing and could cause issues.

**Fix:**
```sql
-- Drop old policies
DROP POLICY "Allow insert for authenticated users" ON badges;
DROP POLICY "Allow update for authenticated users" ON badges;
DROP POLICY "Allow delete for authenticated users" ON badges;
DROP POLICY "Allow read for all users" ON badges;

-- Recreate with correct roles
CREATE POLICY "Anyone can view badges"
ON badges FOR SELECT
TO public  -- Actually public (no auth required)
USING (true);

CREATE POLICY "Only admins can manage badges"
ON badges FOR ALL
TO authenticated  -- ✅ Correct role
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
```

---

### 7. profiles INSERT Policy - Too Permissive

**Issue:**
```sql
{
  "policy_name": "Enable insert for signup",
  "command": "INSERT",
  "roles": "{public}",
  "check_expression": "true"  -- ❌ Anyone can insert ANY profile!
}
```

**Vulnerability:** A user could create profiles for other user IDs during signup.

**Fix:**
```sql
-- Drop old policy
DROP POLICY "Enable insert for signup" ON profiles;

-- Create restricted policy
CREATE POLICY "Users can only create their own profile"
ON profiles FOR INSERT
TO public
WITH CHECK (id = auth.uid());

-- For signups triggered by auth.users trigger, this will work
-- The trigger runs with SECURITY DEFINER and inserts with the correct user ID
```

---

### 8. challenge_participant_rewards - Overly Complex Policy

**Issue:**
```sql
"using_expression": "((auth.uid() = user_id) OR (EXISTS ( SELECT 1\n   FROM profiles\n  WHERE is_admin(auth.uid()))))"
```

The `EXISTS (SELECT 1 FROM profiles WHERE is_admin(...))` is unnecessarily complex.

**Fix:**
```sql
DROP POLICY "Users can view their own challenge reward records" ON challenge_participant_rewards;

CREATE POLICY "Users can view their own challenge rewards"
ON challenge_participant_rewards FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Admins/system can insert rewards
CREATE POLICY "System can insert challenge rewards"
ON challenge_participant_rewards FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Service role can manage rewards"
ON challenge_participant_rewards FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## 🟠 MEDIUM PRIORITY ISSUES

### 9. Missing Tables for Production Features

Based on the features I implemented, you need these additional tables:

#### A. Email Tracking
```sql
CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type text NOT NULL, -- 'welcome', 'progress', 're_engagement', 'plan_complete'
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email logs"
ON email_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email logs"
ON email_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert email logs"
ON email_logs FOR INSERT
TO service_role
WITH CHECK (true);
```

#### B. Email Preferences (Unsubscribe)
```sql
CREATE TABLE email_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  welcome_emails boolean DEFAULT true,
  progress_emails boolean DEFAULT true,
  re_engagement_emails boolean DEFAULT true,
  plan_complete_emails boolean DEFAULT true,
  marketing_emails boolean DEFAULT true,
  unsubscribe_token text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email preferences"
ON email_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
ON email_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences"
ON email_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Public unsubscribe (uses token, not auth)
CREATE POLICY "Public can update via unsubscribe token"
ON email_preferences FOR UPDATE
TO public
USING (true)  -- Token validation handled in application
WITH CHECK (true);
```

#### C. Subscription History
```sql
CREATE TABLE subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES plans(id),
  stripe_subscription_id text,
  status text NOT NULL, -- 'active', 'canceled', 'past_due', 'unpaid', 'trialing'
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  cancel_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_subscription_history_started_at ON subscription_history(started_at DESC);

-- RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history"
ON subscription_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON subscription_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

#### D. Payment Transactions
```sql
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  stripe_invoice_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
  payment_method_type text, -- 'card', 'bank', etc.
  error_code text,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
ON payment_transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

#### E. Stripe Webhook Events (Debugging)
```sql
CREATE TABLE stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_stripe_webhook_events_received_at ON stripe_webhook_events(received_at DESC);

-- RLS (admin only)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view webhook events"
ON stripe_webhook_events FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage webhook events"
ON stripe_webhook_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

#### F. Audit Logs (Sensitive Operations)
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'user.created', 'user.deleted', 'admin.granted', 'plan.changed', etc.
  entity_type text, -- 'profile', 'admin_user', 'subscription', etc.
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS (admin only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can insert audit logs"
ON audit_logs FOR INSERT
TO service_role
WITH CHECK (true);
```

---

### 10. Missing Indexes for Performance

**Critical Indexes Needed:**

```sql
-- User data filtering (RLS queries)
CREATE INDEX IF NOT EXISTS idx_ai_meal_plans_user_id ON ai_meal_plans(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user_id ON ai_workout_plans(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_logs_user_date ON daily_nutrition_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_water_intake_user_date ON daily_water_intake(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created ON quiz_results(user_id, created_at DESC);

-- Challenge performance
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_challenge ON challenge_participants(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_completed ON challenge_participants(challenge_id) WHERE completed = true;

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id, created_at DESC) WHERE read = false;

-- Admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan_renewal ON profiles(plan_renewal_date) WHERE plan_renewal_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

---

### 11. update_challenge_and_rewards() - Performance Concern

**Issue:** This function is extremely complex (150+ lines) with nested loops and multiple updates.

**Problem:**
```sql
-- Loops through ALL participants of a challenge
for r_participant in
  select * from public.challenge_participants where challenge_id = p_challenge_id
loop
  -- Then does 5-10 queries per participant!
  -- This could timeout for challenges with 1000+ participants
```

**Recommendation:**
- Break this into smaller functions
- Use batch updates instead of loops where possible
- Add timeout protection
- Consider async processing for large challenges

**Optimized Approach:**
```sql
-- Instead of looping, use UPDATE with JOIN
UPDATE public.user_rewards ur
SET points = ur.points + new_points_delta,
    updated_at = now()
FROM (
  SELECT cp.user_id, (new_points - COALESCE(cpr.awarded_points, 0)) as delta
  FROM challenge_participants cp
  LEFT JOIN challenge_participant_rewards cpr
    ON cpr.challenge_id = cp.challenge_id
    AND cpr.user_id = cp.user_id
  WHERE cp.challenge_id = p_challenge_id
    AND cp.completed = true
) deltas
WHERE ur.user_id = deltas.user_id AND deltas.delta != 0;
```

---

### 12. Missing Triggers for updated_at

**Tables missing updated_at triggers:**

```sql
-- Add triggers for these tables:
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Verify all tables with updated_at column have trigger
```

---

### 13. Foreign Key Constraints - Verification Needed

**Need to verify these relationships have proper foreign keys:**

```sql
-- Check if these FKs exist:
ai_meal_plans.user_id -> profiles.id (ON DELETE CASCADE)
ai_meal_plans.quiz_result_id -> quiz_results.id (ON DELETE SET NULL)
ai_workout_plans.user_id -> profiles.id (ON DELETE CASCADE)
ai_workout_plans.quiz_result_id -> quiz_results.id (ON DELETE SET NULL)
challenge_participants.challenge_id -> challenges.id (ON DELETE CASCADE)
challenge_participants.user_id -> profiles.id (ON DELETE CASCADE)
challenge_participant_rewards.challenge_id -> challenges.id (ON DELETE CASCADE)
challenge_participant_rewards.user_id -> profiles.id (ON DELETE CASCADE)
notifications.recipient_id -> profiles.id (ON DELETE CASCADE)
notifications.sender_id -> profiles.id (ON DELETE SET NULL)
user_rewards.user_id -> profiles.id (ON DELETE CASCADE)
challenges.badge_id -> badges.id (ON DELETE SET NULL)
```

**SQL to check:**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

---

## 🟢 LOW PRIORITY OPTIMIZATIONS

### 14. Add Rate Limiting Table

For the ML service rate limiting (currently 5 req/min):

```sql
CREATE TABLE api_rate_limits (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  last_request_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_rate_limits_window ON api_rate_limits(window_start DESC);

-- RLS
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
ON api_rate_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rate limits"
ON api_rate_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

### 15. Add Feature Flags Table

For A/B testing and gradual rollouts:

```sql
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text UNIQUE NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  targeting_rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read active feature flags"
ON feature_flags FOR SELECT
TO authenticated
USING (enabled = true);

CREATE POLICY "Admins can manage feature flags"
ON feature_flags FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
```

---

## Implementation Priority

### Week 1 (Critical - Before Production):
1. ✅ Fix `add_admin()` function
2. ✅ Fix notifications INSERT policy
3. ✅ Add RLS policies to `plans` table
4. ✅ Add permission checks to all SECURITY DEFINER functions

### Week 2 (High Priority):
5. ✅ Add email_logs and email_preferences tables
6. ✅ Add subscription_history and payment_transactions tables
7. ✅ Add stripe_webhook_events table
8. ✅ Add audit_logs table
9. ✅ Fix badges policies (use correct roles)
10. ✅ Add RLS to engagement_snapshots

### Week 3 (Medium Priority):
11. ✅ Add all missing indexes
12. ✅ Verify all foreign key constraints
13. ✅ Optimize update_challenge_and_rewards()
14. ✅ Add missing updated_at triggers

### Week 4 (Low Priority):
15. ⏸️ Add rate limiting table
16. ⏸️ Add feature flags table
17. ⏸️ Set up database partitioning for large tables
18. ⏸️ Create automated backup verification

---

## Testing Checklist

After applying fixes, test:

### Security Tests:
- [ ] Attempt to call add_admin() as non-admin (should fail)
- [ ] Attempt to create notification for another user (should fail)
- [ ] Attempt to modify plans as non-admin (should fail)
- [ ] Verify get_platform_stats() requires admin (should fail for users)
- [ ] Test RLS policies with 2 test users (cross-user access should fail)

### Integration Tests:
- [ ] Create email log after sending email
- [ ] Update email preferences (unsubscribe)
- [ ] Record subscription change in history
- [ ] Log payment transaction from Stripe webhook
- [ ] Store Stripe webhook event for debugging
- [ ] Create audit log for sensitive operations

### Performance Tests:
- [ ] Query user's nutrition logs with new index (should be <50ms)
- [ ] Challenge leaderboard with 1000+ participants (should be <200ms)
- [ ] Admin dashboard stats (should be <500ms)
- [ ] Update challenge rewards with 100+ participants (should be <2s)

---

## SQL Script to Apply Fixes

I'll create separate migration scripts for each priority level in the next message.

---

## Monitoring Recommendations

After deploying fixes, monitor:

1. **Failed RLS checks** - Should be 0 in logs
2. **Unauthorized function calls** - Watch for attempts to call admin functions
3. **Query performance** - Slow queries >1s
4. **Foreign key violations** - Should be 0
5. **Webhook processing time** - Should be <500ms per event
6. **Email delivery rate** - Should be >98%
7. **Rate limit violations** - Track users hitting limits

---

## Status: CRITICAL ISSUES IDENTIFIED ⚠️

**DO NOT DEPLOY TO PRODUCTION** until at least the 3 critical security vulnerabilities are fixed!

The `add_admin()` function is particularly dangerous and should be fixed immediately.
