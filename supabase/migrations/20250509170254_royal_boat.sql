/*
  # Add INSERT policy for profiles table
  
  1. Security Changes
    - Add INSERT policy to allow new user registration
    - Policy allows authenticated users to insert their own profile data
    - Ensures user can only create a profile with their own user ID
  
  Note: This is required for the Supabase Auth signup process to work correctly
*/

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);