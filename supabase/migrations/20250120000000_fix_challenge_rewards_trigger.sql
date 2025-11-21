-- Migration: Fix Challenge Rewards System
-- This adds automatic reward distribution when users complete challenges

-- =============================================================================
-- PART 1: Trigger Function for Normal Challenge Completion
-- =============================================================================

CREATE OR REPLACE FUNCTION public.award_challenge_rewards_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  challenge_points INTEGER;
  challenge_badge_id UUID;
  badge_obj JSONB;
  existing_reward RECORD;
BEGIN
  -- Only proceed if challenge was just completed (not already completed)
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

    -- Check if reward already exists for this challenge (shouldn't happen, but be safe)
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

      -- Log for debugging
      RAISE NOTICE 'Awarded % points and badge to user % for completing challenge %',
        challenge_points, NEW.user_id, NEW.challenge_id;
    ELSE
      -- Reward already exists (shouldn't happen in normal flow)
      RAISE NOTICE 'Reward already exists for user % and challenge %',
        NEW.user_id, NEW.challenge_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on challenge_participants
DROP TRIGGER IF EXISTS trigger_award_challenge_rewards ON public.challenge_participants;

CREATE TRIGGER trigger_award_challenge_rewards
  AFTER UPDATE OF completed ON public.challenge_participants
  FOR EACH ROW
  WHEN (NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false))
  EXECUTE FUNCTION public.award_challenge_rewards_on_completion();

-- =============================================================================
-- PART 2: Fix Challenge Archiving (Don't Delete if Participants Exist)
-- =============================================================================

-- Add is_active column to challenges if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'challenges'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.challenges
    ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create archive function (instead of delete)
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
      'message', format('Challenge archived (has %s participants)', participant_count),
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

-- =============================================================================
-- PART 3: Fix RLS Policy for Archived Challenges
-- =============================================================================

-- Update RLS policy to exclude archived challenges for regular users
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;

CREATE POLICY "Anyone can view active challenges"
  ON public.challenges
  FOR SELECT
  USING (is_active = true);

-- Admins can see all challenges (including archived)
DROP POLICY IF EXISTS "Admins can manage all challenges" ON public.challenges;

CREATE POLICY "Admins can manage all challenges"
  ON public.challenges
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =============================================================================
-- PART 4: Backfill - Award Missing Rewards
-- =============================================================================

-- This function can be run once to fix any users who completed challenges
-- but didn't get rewards due to the bug
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
      AND cpr.id IS NULL  -- No reward record exists
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

-- =============================================================================
-- PART 5: Test Data & Verification
-- =============================================================================

-- Function to test reward system
CREATE OR REPLACE FUNCTION public.test_challenge_reward_system(
  p_user_id UUID,
  p_challenge_id UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  before_points INTEGER;
  after_points INTEGER;
  before_badges JSONB;
  after_badges JSONB;
BEGIN
  -- Get current state
  SELECT points, badges INTO before_points, before_badges
  FROM public.user_rewards
  WHERE user_id = p_user_id;

  -- Simulate challenge completion
  UPDATE public.challenge_participants
  SET
    completed = true,
    completion_date = NOW(),
    progress = jsonb_build_object('current', 100, 'target', 100)
  WHERE challenge_id = p_challenge_id
    AND user_id = p_user_id;

  -- Get new state
  SELECT points, badges INTO after_points, after_badges
  FROM public.user_rewards
  WHERE user_id = p_user_id;

  -- Build result
  result := jsonb_build_object(
    'success', true,
    'before', jsonb_build_object('points', before_points, 'badges', before_badges),
    'after', jsonb_build_object('points', after_points, 'badges', after_badges),
    'points_awarded', after_points - before_points,
    'badges_count_before', jsonb_array_length(before_badges),
    'badges_count_after', jsonb_array_length(after_badges)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Comments for documentation
-- =============================================================================

COMMENT ON FUNCTION public.award_challenge_rewards_on_completion() IS
'Automatically awards points and badges when a user completes a challenge. Triggered by updates to challenge_participants.completed.';

COMMENT ON FUNCTION public.archive_challenge(UUID) IS
'Archives a challenge if it has participants, otherwise deletes it. Use this instead of direct DELETE.';

COMMENT ON FUNCTION public.backfill_missing_challenge_rewards() IS
'One-time function to award missing rewards to users who completed challenges before the trigger was added.';

COMMENT ON FUNCTION public.test_challenge_reward_system(UUID, UUID) IS
'Test function to verify reward system works correctly. Pass user_id and challenge_id to simulate completion.';
