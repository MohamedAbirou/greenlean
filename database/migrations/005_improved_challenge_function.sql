-- ============================================================================
-- MIGRATION 005: IMPROVED CHALLENGE REWARDS FUNCTION
-- Priority: CRITICAL - Apply before using challenge auto-distribution
-- Estimated time: 2-3 minutes
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add required table for idempotency
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_update_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  update_data jsonb NOT NULL,
  checksum text NOT NULL UNIQUE,
  participants_affected integer DEFAULT 0,
  executed_at timestamptz NOT NULL DEFAULT now(),
  execution_time_ms integer
);

CREATE INDEX IF NOT EXISTS idx_challenge_update_log_checksum
  ON challenge_update_log(checksum);
CREATE INDEX IF NOT EXISTS idx_challenge_update_log_executed_at
  ON challenge_update_log(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_update_log_challenge
  ON challenge_update_log(challenge_id, executed_at DESC);

COMMENT ON TABLE challenge_update_log IS
  'Tracks challenge updates for idempotency and debugging';

-- ============================================================================
-- STEP 2: Add unique constraint (required for ON CONFLICT)
-- ============================================================================

-- Check if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_challenge_participant_reward'
  ) THEN
    ALTER TABLE challenge_participant_rewards
    ADD CONSTRAINT unique_challenge_participant_reward
    UNIQUE (challenge_id, user_id);
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Create improved function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_challenge_and_rewards_v2(
  p_challenge_id uuid,
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  start_time timestamptz;
  old_challenge record;
  old_target integer;
  old_points integer;
  old_badge_id uuid;
  new_target integer;
  new_points integer;
  new_badge_id uuid;
  points_changed boolean := false;
  target_changed boolean := false;
  badge_changed boolean := false;
  participants_affected integer := 0;
  execution_checksum text;
  execution_time_ms integer;
BEGIN
  start_time := clock_timestamp();

  -- ========================================================================
  -- SECURITY CHECK
  -- ========================================================================
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update challenges';
  END IF;

  -- ========================================================================
  -- IDEMPOTENCY CHECK (prevent duplicate execution)
  -- ========================================================================
  execution_checksum := md5(p_challenge_id::text || p_data::text);

  IF EXISTS (
    SELECT 1 FROM challenge_update_log
    WHERE checksum = execution_checksum
      AND executed_at > now() - interval '1 hour'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'This update was already executed recently',
      'participants_affected', 0
    );
  END IF;

  -- ========================================================================
  -- LOCK PARTICIPANTS FIRST (prevent race conditions)
  -- ========================================================================

  PERFORM 1
  FROM public.challenge_participants
  WHERE challenge_id = p_challenge_id
  FOR UPDATE;

  -- ========================================================================
  -- LOCK CHALLENGE
  -- ========================================================================
  SELECT * INTO old_challenge
  FROM public.challenges
  WHERE id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge % not found', p_challenge_id;
  END IF;

  -- ========================================================================
  -- EXTRACT AND VALIDATE VALUES
  -- ========================================================================

  old_target := COALESCE((old_challenge.requirements->>'target')::int, 0);
  old_points := COALESCE(old_challenge.points, 0);
  old_badge_id := old_challenge.badge_id;

  new_target := COALESCE((p_data->'requirements'->>'target')::int, old_target);
  new_points := COALESCE((p_data->>'points')::int, old_points);
  new_badge_id := COALESCE((p_data->>'badge_id')::uuid, old_badge_id);

  -- Validate
  IF new_target < 0 THEN
    RAISE EXCEPTION 'Challenge target cannot be negative: %', new_target;
  END IF;

  IF new_points < 0 THEN
    RAISE EXCEPTION 'Challenge points cannot be negative: %', new_points;
  END IF;

  IF new_badge_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM badges WHERE id = new_badge_id
  ) THEN
    RAISE EXCEPTION 'Badge % does not exist', new_badge_id;
  END IF;

  -- Determine changes
  points_changed := (new_points != old_points);
  target_changed := (new_target != old_target);
  badge_changed := (new_badge_id IS DISTINCT FROM old_badge_id);

  -- ========================================================================
  -- UPDATE CHALLENGE
  -- ========================================================================

  UPDATE public.challenges
  SET
    title = COALESCE(p_data->>'title', title),
    description = COALESCE(p_data->>'description', description),
    points = new_points,
    badge_id = new_badge_id,
    requirements = COALESCE(p_data->'requirements', requirements),
    updated_at = now()
  WHERE id = p_challenge_id;

  -- ========================================================================
  -- UPDATE PARTICIPANTS (if rewards changed)
  -- ========================================================================

  IF points_changed OR target_changed OR badge_changed THEN
    DECLARE
      r_participant record;
      current_progress integer;
      is_now_completed boolean;
      old_awarded_points integer;
      new_badge_obj jsonb;
      current_badges jsonb;
      points_delta integer;
    BEGIN
      FOR r_participant IN
        SELECT * FROM public.challenge_participants
        WHERE challenge_id = p_challenge_id
        ORDER BY user_id
      LOOP
        participants_affected := participants_affected + 1;

        -- Safe progress extraction (handle NULL)
        current_progress := COALESCE(
          (r_participant.progress->>'current')::int,
          0
        );

        is_now_completed := (current_progress >= new_target);

        -- ================================================================
        -- NORMALIZE PROGRESS (if target decreased)
        -- ================================================================
        IF target_changed AND current_progress > new_target THEN
          UPDATE public.challenge_participants
          SET
            progress = jsonb_build_object(
              'current', new_target,
              'target', new_target
            ),
            updated_at = now()
          WHERE id = r_participant.id;

          current_progress := new_target;
          is_now_completed := true;
        END IF;

        -- ================================================================
        -- ENSURE user_rewards EXISTS
        -- ================================================================
        INSERT INTO public.user_rewards (user_id, points, badges)
        VALUES (r_participant.user_id, 0, '[]'::jsonb)
        ON CONFLICT (user_id) DO NOTHING;

        -- ================================================================
        -- CASE 1: NEWLY COMPLETED
        -- ================================================================
        IF NOT r_participant.completed AND is_now_completed THEN

          UPDATE public.challenge_participants
          SET
            completed = true,
            completion_date = now(),
            updated_at = now()
          WHERE id = r_participant.id;

          -- Build badge with CORRECT earned_at
          IF new_badge_id IS NOT NULL THEN
            SELECT jsonb_build_object(
              'id', b.id,
              'icon', b.icon,
              'name', b.name,
              'color', b.color,
              'earned_at', now()  -- ✅ FIX: Use NOW(), not badge created_at
            )
            INTO new_badge_obj
            FROM badges b
            WHERE b.id = new_badge_id;
          END IF;

          -- Insert reward record
          INSERT INTO public.challenge_participant_rewards (
            challenge_id,
            user_id,
            awarded_points,
            awarded_badge,
            awarded_at,
            updated_at
          ) VALUES (
            p_challenge_id,
            r_participant.user_id,
            new_points,
            new_badge_id::text,
            now(),
            now()
          )
          ON CONFLICT (challenge_id, user_id) DO NOTHING;

          -- Award points and badge
          UPDATE public.user_rewards
          SET
            points = points + new_points,
            badges = CASE
              WHEN new_badge_obj IS NOT NULL
              THEN badges || jsonb_build_array(new_badge_obj)
              ELSE badges
            END,
            updated_at = now()
          WHERE user_id = r_participant.user_id;

        -- ================================================================
        -- CASE 2: ALREADY COMPLETED (adjust rewards)
        -- ================================================================
        ELSIF r_participant.completed THEN

          -- ✅ FIX: Get OLD points BEFORE upsert
          SELECT COALESCE(awarded_points, 0)
          INTO old_awarded_points
          FROM public.challenge_participant_rewards
          WHERE challenge_id = p_challenge_id
            AND user_id = r_participant.user_id;

          -- Upsert reward record
          INSERT INTO public.challenge_participant_rewards (
            challenge_id,
            user_id,
            awarded_points,
            awarded_badge,
            awarded_at,
            updated_at
          ) VALUES (
            p_challenge_id,
            r_participant.user_id,
            new_points,
            new_badge_id::text,
            COALESCE(r_participant.completion_date, now()),
            now()
          )
          ON CONFLICT (challenge_id, user_id)
          DO UPDATE SET
            awarded_points = EXCLUDED.awarded_points,
            awarded_badge = EXCLUDED.awarded_badge,
            updated_at = now();

          -- ✅ FIX: Calculate delta CORRECTLY (using OLD value)
          IF points_changed THEN
            points_delta := new_points - old_awarded_points;

            IF points_delta != 0 THEN
              UPDATE public.user_rewards
              SET
                points = points + points_delta,
                updated_at = now()
              WHERE user_id = r_participant.user_id;
            END IF;
          END IF;

          -- Replace badge if changed
          IF badge_changed AND new_badge_id IS NOT NULL THEN
            -- Build new badge
            SELECT jsonb_build_object(
              'id', b.id,
              'icon', b.icon,
              'name', b.name,
              'color', b.color,
              'earned_at', COALESCE(r_participant.completion_date, now())
            )
            INTO new_badge_obj
            FROM badges b
            WHERE b.id = new_badge_id;

            -- ✅ FIX: Get FRESH badges (not stale)
            SELECT badges INTO current_badges
            FROM public.user_rewards
            WHERE user_id = r_participant.user_id;

            -- Remove old badge, add new one
            UPDATE public.user_rewards
            SET
              badges = (
                SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
                FROM jsonb_array_elements(current_badges) elem
                WHERE (elem->>'id')::uuid != old_badge_id
              ) || jsonb_build_array(new_badge_obj),
              updated_at = now()
            WHERE user_id = r_participant.user_id;
          END IF;

        END IF;

      END LOOP;

    END;
  END IF;

  -- ========================================================================
  -- LOG EXECUTION
  -- ========================================================================

  execution_time_ms := EXTRACT(MILLISECOND FROM clock_timestamp() - start_time)::integer;

  INSERT INTO challenge_update_log (
    challenge_id,
    update_data,
    checksum,
    participants_affected,
    executed_at,
    execution_time_ms
  ) VALUES (
    p_challenge_id,
    p_data,
    execution_checksum,
    participants_affected,
    now(),
    execution_time_ms
  )
  ON CONFLICT (checksum) DO NOTHING;

  -- ========================================================================
  -- AUDIT LOG
  -- ========================================================================

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit') THEN
    PERFORM log_audit(
      'challenge.updated',
      'challenge',
      p_challenge_id,
      to_jsonb(old_challenge),
      p_data,
      jsonb_build_object(
        'participants_affected', participants_affected,
        'points_changed', points_changed,
        'target_changed', target_changed,
        'badge_changed', badge_changed,
        'execution_time_ms', execution_time_ms
      )
    );
  END IF;

  -- ========================================================================
  -- RETURN SUCCESS
  -- ========================================================================

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Challenge updated successfully',
    'participants_affected', participants_affected,
    'execution_time_ms', execution_time_ms,
    'changes', jsonb_build_object(
      'points_changed', points_changed,
      'target_changed', target_changed,
      'badge_changed', badge_changed,
      'old_points', old_points,
      'new_points', new_points,
      'old_target', old_target,
      'new_target', new_target
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating challenge: %', SQLERRM;

    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$function$;

COMMENT ON FUNCTION public.update_challenge_and_rewards_v2 IS
  'Production-ready version with all bug fixes:
  - Fixed delta calculation bug (Bug #1)
  - Fixed earned_at timestamp bug (Bug #2)
  - Fixed stale data in badge replacement (Bug #3)
  - Added unique constraint requirement (Bug #4)
  - Fixed race conditions with proper locking (Bug #5)
  - Added NULL handling (Bug #6)
  - Added idempotency checks (Bug #7)
  - Returns detailed results
  - Comprehensive error handling';

-- ============================================================================
-- STEP 4: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.update_challenge_and_rewards_v2(uuid, jsonb) TO authenticated;
GRANT SELECT, INSERT ON challenge_update_log TO authenticated;

-- ============================================================================
-- Commit transaction
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify unique constraint exists
-- SELECT conname, contype
-- FROM pg_constraint
-- WHERE conrelid = 'challenge_participant_rewards'::regclass
--   AND conname = 'unique_challenge_participant_reward';

-- Verify function exists
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE proname = 'update_challenge_and_rewards_v2';

-- Test function (replace with real challenge ID)
-- SELECT update_challenge_and_rewards_v2(
--   'your-challenge-id',
--   '{"points": 150}'::jsonb
-- );
