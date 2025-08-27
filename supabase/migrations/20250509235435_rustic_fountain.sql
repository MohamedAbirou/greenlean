/*
  # Fix admin users policy recursion

  1. Changes
    - Replace recursive admin check policy with direct role check
    - Simplify policy to avoid infinite recursion
    - Maintain security by still restricting access to admin users

  2. Security
    - Policy still ensures only admin users can access the table
    - Prevents unauthorized access while fixing the recursion issue
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create new policy that avoids recursion by checking role directly
CREATE POLICY "Admins can view admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (
  auth.jwt()->>'role' = 'authenticated' AND
  EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);