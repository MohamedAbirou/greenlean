/*
  # Fix profiles table permissions

  1. Changes
    - Update RLS policies for the profiles table to allow proper user creation during signup
    - Add policy for auth service to create profiles during signup
    
  2. Security
    - Enable RLS on profiles table (already enabled)
    - Add policy for service role to manage profiles
    - Maintain existing user policies
*/

-- Add policy for service role to manage profiles
CREATE POLICY "Service role can manage all profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update the existing signup policy to properly handle new user creation
DROP POLICY IF EXISTS "Allow users to insert their own profile during signup" ON public.profiles;

CREATE POLICY "Allow users to insert their own profile during signup"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Ensure proper permissions for the auth service
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;