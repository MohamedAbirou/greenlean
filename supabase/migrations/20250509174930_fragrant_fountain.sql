/*
  # Fix profile policies for signup

  1. Changes
    - Drop existing policies to start fresh
    - Add new simplified policies that allow:
      - Public signup
      - Authenticated user access
      - Service role access
    
  2. Security
    - Maintains RLS
    - Ensures proper access control
    - Allows profile creation during signup
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for signup" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Enable insert for signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can manage own profile"
ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT INSERT ON public.profiles TO anon;