/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing INSERT policies that might conflict
    - Add new INSERT policy for public role during signup
    - Add policy for authenticated users to manage their own profile
  
  2. Security
    - Enable RLS on profiles table (already enabled)
    - Add policies to allow profile creation during signup
    - Maintain existing security for authenticated users
*/

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Allow users to insert their own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies
CREATE POLICY "Allow profile creation during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to manage their own profile"
ON profiles
FOR ALL 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);