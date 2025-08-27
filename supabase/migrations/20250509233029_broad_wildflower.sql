/*
  # Add admin functionality

  1. New Tables
    - `admin_users`
      - Links to profiles table
      - Stores admin-specific settings and permissions
  
  2. Security
    - Add admin claim to auth.users
    - Create policies for admin access
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Only super admins can manage admin users"
ON admin_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = user_id
  );
$$;

-- Create policies for admin access to challenges
CREATE POLICY "Admins can manage all challenges"
ON challenges
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create policies for admin access to challenge_participants
CREATE POLICY "Admins can view all challenge participants"
ON challenge_participants
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Create policies for admin access to user_rewards
CREATE POLICY "Admins can manage all rewards"
ON user_rewards
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create updated_at trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();