# 🗄️ Supabase SQL Scripts - Run These Manually

**Instructions:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy each script below
3. Run them in order
4. Verify success (no errors)

---

## SCRIPT 1: Challenge Rewards Auto-Distribution Trigger

```sql
-- =============================================================================
-- Auto-award points and badges when users complete challenges
-- =============================================================================

CREATE OR REPLACE FUNCTION public.award_challenge_rewards_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  challenge_points INTEGER;
  challenge_badge_id UUID;
  badge_obj JSONB;
  existing_reward RECORD;
BEGIN
  -- Only proceed if challenge was just completed
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN

    -- Get challenge details
    SELECT points, badge_id
    INTO challenge_points, challenge_badge_id
    FROM public.challenges
    WHERE id = NEW.challenge_id;

    -- Build badge object if challenge has a badge
    IF challenge_badge_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'id', b.id,
        'icon', b.icon,
        'name', b.name,
        'color', b.color,
        'earned_at', NOW()
      )
      INTO badge_obj
      FROM public.badges b
      WHERE b.id = challenge_badge_id;
    END IF;

    -- Ensure user_rewards row exists
    INSERT INTO public.user_rewards (user_id, points, badges, created_at, updated_at)
    VALUES (NEW.user_id, 0, '[]'::jsonb, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- Check if reward already exists
    SELECT * INTO existing_reward
    FROM public.challenge_participant_rewards
    WHERE challenge_id = NEW.challenge_id
      AND user_id = NEW.user_id;

    IF existing_reward IS NULL THEN
      -- Insert reward record
      INSERT INTO public.challenge_participant_rewards (
        challenge_id,
        user_id,
        awarded_points,
        awarded_badge,
        awarded_at,
        updated_at
      )
      VALUES (
        NEW.challenge_id,
        NEW.user_id,
        challenge_points,
        challenge_badge_id::text,
        NOW(),
        NOW()
      );

      -- Award points to user
      UPDATE public.user_rewards
      SET
        points = points + challenge_points,
        badges = CASE
          WHEN badge_obj IS NOT NULL THEN badges || jsonb_build_array(badge_obj)
          ELSE badges
        END,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;

      RAISE NOTICE 'Awarded % points to user % for challenge %',
        challenge_points, NEW.user_id, NEW.challenge_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_award_challenge_rewards ON public.challenge_participants;

CREATE TRIGGER trigger_award_challenge_rewards
  AFTER UPDATE OF completed ON public.challenge_participants
  FOR EACH ROW
  WHEN (NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false))
  EXECUTE FUNCTION public.award_challenge_rewards_on_completion();
```

---

## SCRIPT 2: Archive Challenge Function (Smart Delete)

```sql
-- =============================================================================
-- Archive challenges with participants, delete those without
-- =============================================================================

CREATE OR REPLACE FUNCTION public.archive_challenge(p_challenge_id UUID)
RETURNS JSONB AS $$
DECLARE
  participant_count INTEGER;
  result JSONB;
BEGIN
  -- Check if challenge has participants
  SELECT COUNT(*) INTO participant_count
  FROM public.challenge_participants
  WHERE challenge_id = p_challenge_id;

  IF participant_count > 0 THEN
    -- Archive instead of delete
    UPDATE public.challenges
    SET is_active = false, updated_at = NOW()
    WHERE id = p_challenge_id;

    result := jsonb_build_object(
      'success', true,
      'action', 'archived',
      'message', format('Challenge archived (%s participants)', participant_count),
      'participant_count', participant_count
    );
  ELSE
    -- Safe to delete
    DELETE FROM public.challenges
    WHERE id = p_challenge_id;

    result := jsonb_build_object(
      'success', true,
      'action', 'deleted',
      'message', 'Challenge deleted (no participants)'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## SCRIPT 3: Backfill Missing Rewards (ONE-TIME FIX)

```sql
-- =============================================================================
-- Award missing rewards to users who completed challenges before trigger existed
-- Run this ONCE after adding the trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.backfill_missing_challenge_rewards()
RETURNS TABLE(user_id UUID, challenge_id UUID, points_awarded INTEGER, badge_awarded TEXT) AS $$
DECLARE
  r RECORD;
  challenge_points INTEGER;
  challenge_badge_id UUID;
  badge_obj JSONB;
BEGIN
  -- Find completed challenges without rewards
  FOR r IN
    SELECT cp.user_id, cp.challenge_id, c.points, c.badge_id
    FROM public.challenge_participants cp
    INNER JOIN public.challenges c ON c.id = cp.challenge_id
    LEFT JOIN public.challenge_participant_rewards cpr
      ON cpr.challenge_id = cp.challenge_id
      AND cpr.user_id = cp.user_id
    WHERE cp.completed = true
      AND cpr.id IS NULL
  LOOP
    challenge_points := r.points;
    challenge_badge_id := r.badge_id;

    -- Build badge object
    IF challenge_badge_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'id', b.id,
        'icon', b.icon,
        'name', b.name,
        'color', b.color,
        'earned_at', NOW()
      )
      INTO badge_obj
      FROM public.badges b
      WHERE b.id = challenge_badge_id;
    END IF;

    -- Ensure user_rewards exists
    INSERT INTO public.user_rewards (user_id, points, badges, created_at, updated_at)
    VALUES (r.user_id, 0, '[]'::jsonb, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- Create reward record
    INSERT INTO public.challenge_participant_rewards (
      challenge_id,
      user_id,
      awarded_points,
      awarded_badge,
      awarded_at,
      updated_at
    )
    VALUES (
      r.challenge_id,
      r.user_id,
      challenge_points,
      challenge_badge_id::text,
      NOW(),
      NOW()
    );

    -- Award points and badge
    UPDATE public.user_rewards
    SET
      points = points + challenge_points,
      badges = CASE
        WHEN badge_obj IS NOT NULL THEN badges || jsonb_build_array(badge_obj)
        ELSE badges
      END,
      updated_at = NOW()
    WHERE user_rewards.user_id = r.user_id;

    -- Return row for logging
    user_id := r.user_id;
    challenge_id := r.challenge_id;
    points_awarded := challenge_points;
    badge_awarded := challenge_badge_id::text;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run this to award missing rewards:
-- SELECT * FROM public.backfill_missing_challenge_rewards();
```

---

## SCRIPT 4: Performance Indexes

```sql
-- =============================================================================
-- Add composite indexes for common queries
-- =============================================================================

-- Meal plans by user and active status
CREATE INDEX IF NOT EXISTS idx_ai_meal_plans_user_active
ON ai_meal_plans(user_id, is_active)
WHERE is_active = true;

-- Workout plans by user and active status
CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user_active
ON ai_workout_plans(user_id, is_active)
WHERE is_active = true;

-- Challenge participants by challenge and completion
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_completed
ON challenge_participants(challenge_id, completed);

-- Challenge participants by user and completion
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_completed
ON challenge_participants(user_id, completed);

-- Workout logs by user and date (descending for recent first)
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date
ON workout_logs(user_id, workout_date DESC);

-- Nutrition logs by user and date
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_logs_user_date
ON daily_nutrition_logs(user_id, log_date DESC);

-- Water intake by user and date
CREATE INDEX IF NOT EXISTS idx_daily_water_intake_user_date
ON daily_water_intake(user_id, log_date DESC);

-- Quiz results by user and creation date
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created
ON quiz_results(user_id, created_at DESC);

-- Notifications by recipient and read status
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read
ON notifications(recipient_id, read, created_at DESC);

-- Paid users (for queries filtering by plan)
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

## SCRIPT 5: Custom Meals Table (For Flexible Logging)

```sql
-- =============================================================================
-- Create custom_meals table for user-created and favorite meals
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.custom_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  calories INTEGER NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fats NUMERIC NOT NULL DEFAULT 0,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions JSONB DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN DEFAULT false,
  source TEXT NOT NULL DEFAULT 'custom', -- 'ai_generated', 'usda', 'custom', 'recipe'
  external_id TEXT, -- USDA food ID or recipe ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_meals_user_type
ON custom_meals(user_id, meal_type);

CREATE INDEX IF NOT EXISTS idx_custom_meals_favorites
ON custom_meals(user_id, is_favorite)
WHERE is_favorite = true;

-- RLS Policies
ALTER TABLE public.custom_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own custom meals"
  ON public.custom_meals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custom_meals_updated_at
  BEFORE UPDATE ON public.custom_meals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## SCRIPT 6: Enable Realtime for Tables

```sql
-- =============================================================================
-- Enable Supabase Realtime for instant UI updates
-- Run this, then go to Dashboard → Database → Replication to enable
-- =============================================================================

-- These tables need realtime enabled in Supabase Dashboard:
-- 1. challenge_participants
-- 2. user_rewards
-- 3. ai_meal_plans
-- 4. ai_workout_plans
-- 5. workout_logs
-- 6. daily_nutrition_logs
-- 7. daily_water_intake
-- 8. notifications

-- After running this, go to:
-- Supabase Dashboard → Database → Replication → Enable for above tables
```

---

## SCRIPT 7: Composite Unique Constraints (Data Integrity)

```sql
-- =============================================================================
-- Add unique constraints to prevent duplicates
-- =============================================================================

-- One water log per user per day
ALTER TABLE public.daily_water_intake
DROP CONSTRAINT IF EXISTS unique_water_log_per_day;

ALTER TABLE public.daily_water_intake
ADD CONSTRAINT unique_water_log_per_day
UNIQUE (user_id, log_date);

-- One reward record per user per challenge
ALTER TABLE public.challenge_participant_rewards
DROP CONSTRAINT IF EXISTS unique_reward_per_user_challenge;

ALTER TABLE public.challenge_participant_rewards
ADD CONSTRAINT unique_reward_per_user_challenge
UNIQUE (challenge_id, user_id);

-- One active meal plan per user
-- (Already handled by trigger, but add index for performance)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_meal_plan_per_user
ON ai_meal_plans(user_id)
WHERE is_active = true;

-- One active workout plan per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_workout_plan_per_user
ON ai_workout_plans(user_id)
WHERE is_active = true;
```

---

## ✅ VERIFICATION QUERIES

After running all scripts, verify everything works:

```sql
-- 1. Check trigger exists
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'trigger_award_challenge_rewards';
-- Expected: 1 row, tgenabled = 'O' (enabled)

-- 2. Check function exists
SELECT proname
FROM pg_proc
WHERE proname IN (
  'award_challenge_rewards_on_completion',
  'archive_challenge',
  'backfill_missing_challenge_rewards'
);
-- Expected: 3 rows

-- 3. Check indexes created
SELECT COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
-- Expected: 12+ indexes

-- 4. Check custom_meals table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'custom_meals';
-- Expected: 1 row

-- 5. Test challenge rewards (OPTIONAL - only if you have test data)
-- SELECT public.backfill_missing_challenge_rewards();
```

---

## 🚨 IMPORTANT NOTES

1. **Backfill rewards**: Run `SELECT * FROM public.backfill_missing_challenge_rewards();` ONCE after adding the trigger to fix historical data

2. **Realtime**: After running Script 6, manually enable Realtime in Supabase Dashboard for the listed tables

3. **Indexes**: The indexes will improve query performance immediately, especially with 1000+ users

4. **Custom meals**: This table is for the smart meal logging feature we'll implement next

5. **All scripts are idempotent**: Safe to run multiple times (uses IF NOT EXISTS, DROP IF EXISTS, etc.)

---

**Next:** After running these SQL scripts, I'll implement the frontend and ML service changes! 🚀
