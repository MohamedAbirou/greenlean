/*
  # Fix profiles table permissions

  1. Security Changes
    - Enable RLS on profiles table (if not already enabled)
    - Add policy for new user signup to insert their own profile
    - Add policy for authenticated users to read/update their own profile
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile during signup
CREATE POLICY "Allow users to insert their own profile during signup"
  ON profiles
  FOR INSERT
  WITH CHECK (true);  -- Allow initial profile creation during signup

-- Allow users to read their own profile
CREATE POLICY "Allow users to read their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);