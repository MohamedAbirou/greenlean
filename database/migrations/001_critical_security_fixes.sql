-- ============================================================================
-- MIGRATION 001: CRITICAL SECURITY FIXES
-- Priority: CRITICAL - Apply immediately before production
-- Estimated time: 2-3 minutes
-- ============================================================================

-- Transaction wrapper for safety
BEGIN;

-- ============================================================================
-- FIX 1: add_admin() Function - Add Permission Check
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_admin(user_uuid uuid, role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- SECURITY CHECK: Only super_admin can grant admin privileges
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super_admin can grant admin privileges';
  END IF;

  -- Prevent granting super_admin to multiple users
  IF role = 'super_admin' THEN
    IF EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE role = 'super_admin' AND id != user_uuid
    ) THEN
      RAISE EXCEPTION 'Only one super_admin is allowed';
    END IF;
  END IF;

  -- Prevent invalid roles
  IF role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be "admin" or "super_admin"';
  END IF;

  -- Grant privileges
  INSERT INTO public.admin_users (id, role, created_at, updated_at)
  VALUES (user_uuid, role, now(), now())
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      updated_at = now();

  RETURN json_build_object(
    'success', true,
    'message', 'Admin privileges granted successfully',
    'user_id', user_uuid,
    'role', role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$function$;

COMMENT ON FUNCTION public.add_admin(uuid, text) IS
  'Grants admin privileges. Only super_admin can call this function.';

-- ============================================================================
-- FIX 2: Notifications - Fix INSERT Policy
-- ============================================================================

-- Drop insecure policy
DROP POLICY IF EXISTS "Users insert notifications" ON notifications;

-- Create secure notification function
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
  sender_user_id uuid;
BEGIN
  -- Get authenticated user ID
  sender_user_id := auth.uid();

  -- Insert notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    message,
    entity_id,
    entity_type,
    read,
    created_at
  ) VALUES (
    p_recipient_id,
    sender_user_id,
    p_type,
    p_message,
    p_entity_id,
    p_entity_type,
    false,
    now()
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$function$;

COMMENT ON FUNCTION public.create_notification IS
  'Creates a notification. Automatically sets sender_id to authenticated user.';

-- Create system notification function (for triggers/cron jobs)
CREATE OR REPLACE FUNCTION public.create_system_notification(
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
  -- System notifications have no sender_id
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    message,
    entity_id,
    entity_type,
    read,
    created_at
  ) VALUES (
    p_recipient_id,
    NULL, -- System notification
    p_type,
    p_message,
    p_entity_id,
    p_entity_type,
    false,
    now()
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$function$;

COMMENT ON FUNCTION public.create_system_notification IS
  'Creates a system notification (no sender). Used by triggers and cron jobs.';

-- No direct INSERT allowed - must use functions
-- Users can still SELECT, UPDATE (mark as read), and DELETE their own notifications

-- ============================================================================
-- FIX 3: plans Table - Add RLS Policies
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
DROP POLICY IF EXISTS "Only admins can manage plans" ON plans;

-- Public can view active plans (for pricing page, signup)
CREATE POLICY "Anyone can view active plans"
ON plans FOR SELECT
TO public
USING (is_active = true);

-- Admins can view all plans (including inactive)
CREATE POLICY "Admins can view all plans"
ON plans FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can modify plans
CREATE POLICY "Only admins can manage plans"
ON plans FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Service role has full access
CREATE POLICY "Service role has full access to plans"
ON plans FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- Commit transaction
-- ============================================================================

COMMIT;

-- ============================================================================
-- Verification queries (run these after migration)
-- ============================================================================

-- Verify plans RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'plans';

-- Verify notification policies
-- SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- Verify plans policies
-- SELECT * FROM pg_policies WHERE tablename = 'plans';

-- Test add_admin() (should fail for non-super-admin)
-- SELECT add_admin('some-uuid', 'admin');
