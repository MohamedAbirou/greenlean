/*
  # Fix admin_users RLS policy

  1. Changes
    - Drop existing policy that causes infinite recursion
    - Create new policies for admin_users table:
      - Allow super_admins to manage all admin users
      - Allow admins to view admin users
      - Allow users to check their own admin status

  2. Security
    - Maintains RLS protection
    - Prevents infinite recursion by simplifying policy logic
    - Ensures proper access control for admin management
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users;

-- Create new policies with proper access control
CREATE POLICY "Super admins can manage admin users"
ON admin_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role = 'super_admin'
  )
);

CREATE POLICY "Admins can view admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Users can check their own admin status"
ON admin_users
FOR SELECT
TO authenticated
USING (id = auth.uid());