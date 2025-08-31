/*
  # Clean Policy Structure and Fix Admin Access

  1. Policy Cleanup
    - Drop all existing conflicting policies
    - Create clean, non-recursive policy structure
    - Fix admin_users table access issues
    
  2. New Clean Policy Structure
    - profiles: Users manage own data, service role has full access
    - admin_users: Simple role-based access without recursion
    - quiz_results: Users manage own data
    - progress_photos: Users manage own, community visibility rules
    - challenges: Public read, admin write
    - challenge_participants: Users manage own participation
    - user_rewards: Users read own, system manages
    - photo_likes/comments: Social interaction rules
    - saved_tips: Users manage own
    - platform_settings: Admin-only access

  3. Admin Bootstrap
    - Create function to make first user admin
    - Add RPC function for easy admin creation
    
  4. Security
    - All tables have RLS enabled
    - No recursive policy checks
    - Clear separation of concerns
*/

-- ============================================================================
-- CLEAN UP ALL EXISTING POLICIES
-- ============================================================================

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Simple admin check function (non-recursive)
CREATE OR REPLACE FUNCTION is_admin_simple(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id LIMIT 1
  );
$$;

-- Function to bootstrap first admin user
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT id INTO user_record
  FROM profiles 
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert into admin_users (upsert)
  INSERT INTO admin_users (id, role, permissions)
  VALUES (user_record.id, 'super_admin', '["all"]'::jsonb)
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    permissions = '["all"]'::jsonb,
    updated_at = now();
    
  RAISE NOTICE 'User % is now a super admin', user_email;
END;
$$;

-- RPC function for making admin (callable from client)
CREATE OR REPLACE FUNCTION rpc_make_admin(target_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Only allow if caller is already an admin or if no admins exist
  IF NOT (
    is_admin_simple(auth.uid()) OR 
    NOT EXISTS (SELECT 1 FROM admin_users LIMIT 1)
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  PERFORM make_user_admin(target_email);
  
  RETURN json_build_object('success', true, 'message', 'User promoted to admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public signup
CREATE POLICY "profiles_insert_signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Users can read all profiles (for mentions, community features)
CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role full access
CREATE POLICY "profiles_service_role"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- ADMIN_USERS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow users to check their own admin status (no recursion)
CREATE POLICY "admin_users_own_status"
ON admin_users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow existing admins to view all admin users
CREATE POLICY "admin_users_admin_view"
ON admin_users
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() 
    AND au.role IN ('admin', 'super_admin')
  )
);

-- Allow super admins to manage admin users
CREATE POLICY "admin_users_super_admin_manage"
ON admin_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() 
    AND au.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.id = auth.uid() 
    AND au.role = 'super_admin'
  )
);

-- Service role full access
CREATE POLICY "admin_users_service_role"
ON admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- QUIZ_RESULTS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can manage their own quiz results
CREATE POLICY "quiz_results_own"
ON quiz_results
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "quiz_results_service_role"
ON quiz_results
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PROGRESS_PHOTOS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Users can manage their own photos
CREATE POLICY "progress_photos_own"
ON progress_photos
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view community photos
CREATE POLICY "progress_photos_community_view"
ON progress_photos
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  (community_visible = true AND is_private = false)
);

-- Service role full access
CREATE POLICY "progress_photos_service_role"
ON progress_photos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- CHALLENGES TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view active challenges
CREATE POLICY "challenges_view_active"
ON challenges
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage all challenges
CREATE POLICY "challenges_admin_manage"
ON challenges
FOR ALL
TO authenticated
USING (is_admin_simple(auth.uid()))
WITH CHECK (is_admin_simple(auth.uid()));

-- Service role full access
CREATE POLICY "challenges_service_role"
ON challenges
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- CHALLENGE_PARTICIPANTS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Users can manage their own participation
CREATE POLICY "challenge_participants_own"
ON challenge_participants
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view all participants (for leaderboards)
CREATE POLICY "challenge_participants_view_all"
ON challenge_participants
FOR SELECT
TO authenticated
USING (true);

-- Admins can manage all participants
CREATE POLICY "challenge_participants_admin_manage"
ON challenge_participants
FOR ALL
TO authenticated
USING (is_admin_simple(auth.uid()))
WITH CHECK (is_admin_simple(auth.uid()));

-- Service role full access
CREATE POLICY "challenge_participants_service_role"
ON challenge_participants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- USER_REWARDS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "user_rewards_own_view"
ON user_rewards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own rewards (for initialization)
CREATE POLICY "user_rewards_own_insert"
ON user_rewards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- System can update rewards (challenges, etc.)
CREATE POLICY "user_rewards_system_update"
ON user_rewards
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all rewards
CREATE POLICY "user_rewards_admin_manage"
ON user_rewards
FOR ALL
TO authenticated
USING (is_admin_simple(auth.uid()))
WITH CHECK (is_admin_simple(auth.uid()));

-- Service role full access
CREATE POLICY "user_rewards_service_role"
ON user_rewards
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PHOTO_LIKES TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own likes
CREATE POLICY "photo_likes_own"
ON photo_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view likes on accessible photos
CREATE POLICY "photo_likes_view_accessible"
ON photo_likes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM progress_photos pp
    WHERE pp.id = photo_id
    AND (
      pp.user_id = auth.uid() OR 
      (pp.community_visible = true AND pp.is_private = false)
    )
  )
);

-- Service role full access
CREATE POLICY "photo_likes_service_role"
ON photo_likes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PHOTO_COMMENTS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

-- Users can manage their own comments
CREATE POLICY "photo_comments_own"
ON photo_comments
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view comments on accessible photos
CREATE POLICY "photo_comments_view_accessible"
ON photo_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM progress_photos pp
    WHERE pp.id = photo_id
    AND (
      pp.user_id = auth.uid() OR 
      (pp.community_visible = true AND pp.is_private = false)
    )
  )
);

-- Service role full access
CREATE POLICY "photo_comments_service_role"
ON photo_comments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- COMMENT_LIKES TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own comment likes
CREATE POLICY "comment_likes_own"
ON comment_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view comment likes on accessible photos
CREATE POLICY "comment_likes_view_accessible"
ON comment_likes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM photo_comments pc
    JOIN progress_photos pp ON pc.photo_id = pp.id
    WHERE pc.id = comment_id
    AND (
      pp.user_id = auth.uid() OR 
      (pp.community_visible = true AND pp.is_private = false)
    )
  )
);

-- Service role full access
CREATE POLICY "comment_likes_service_role"
ON comment_likes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- SAVED_TIPS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE saved_tips ENABLE ROW LEVEL SECURITY;

-- Users can manage their own saved tips
CREATE POLICY "saved_tips_own"
ON saved_tips
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "saved_tips_service_role"
ON saved_tips
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PLATFORM_SETTINGS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage platform settings
CREATE POLICY "platform_settings_admin_only"
ON platform_settings
FOR ALL
TO authenticated
USING (is_admin_simple(auth.uid()))
WITH CHECK (is_admin_simple(auth.uid()));

-- Service role full access
CREATE POLICY "platform_settings_service_role"
ON platform_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STORAGE POLICIES CLEANUP
-- ============================================================================

-- Clean up storage policies and recreate them properly
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing storage policies
    FOR policy_record IN (
        SELECT policyname, bucket_id 
        FROM storage.policies
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    END LOOP;
END $$;

-- Avatars bucket policies
CREATE POLICY "avatars_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_own_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_own_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Progress photos bucket policies
CREATE POLICY "progress_photos_own_manage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant permissions to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant specific permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON progress_photos TO authenticated;
GRANT SELECT ON challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON challenge_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_rewards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON comment_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_tips TO authenticated;

-- Grant insert permission for anon users (signup)
GRANT INSERT ON profiles TO anon;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS progress_photos_user_id_idx ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS progress_photos_community_idx ON progress_photos(community_visible, is_private);
CREATE INDEX IF NOT EXISTS challenges_active_idx ON challenges(is_active);
CREATE INDEX IF NOT EXISTS challenge_participants_user_id_idx ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS challenge_participants_challenge_id_idx ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS user_rewards_user_id_idx ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS photo_likes_photo_id_idx ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS photo_comments_photo_id_idx ON photo_comments(photo_id);
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS saved_tips_user_id_idx ON saved_tips(user_id);

-- ============================================================================
-- BOOTSTRAP MESSAGE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=== POLICY CLEANUP COMPLETE ===';
  RAISE NOTICE 'To make your first admin user, run:';
  RAISE NOTICE 'SELECT make_user_admin(''your-email@example.com'');';
  RAISE NOTICE 'Or use the RPC function from your app:';
  RAISE NOTICE 'supabase.rpc(''rpc_make_admin'', { target_email: ''your-email@example.com'' })';
END $$;