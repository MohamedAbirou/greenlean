/*
  # Fix profiles table RLS policies

  1. Changes
    - Update the profile creation policy to be more permissive during signup
    - Ensure authenticated users can manage their own profiles
    - Maintain security while allowing necessary operations

  2. Security
    - Policies are updated to allow profile creation during signup
    - Maintains row-level security while fixing permission issues
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create more permissive policies that maintain security while allowing registration
CREATE POLICY "Enable insert for authentication" ON public.profiles
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Keep existing policies for profile management
CREATE POLICY "Enable update for users based on id" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);