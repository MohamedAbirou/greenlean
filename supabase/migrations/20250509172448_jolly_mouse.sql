/*
  # Recreate Profile Table Policies

  1. Security Changes
    - Enable RLS on profiles table
    - Add policies for:
      - Public signup (INSERT)
      - Authenticated user operations (SELECT, INSERT, UPDATE)
      - Service role full access
    
  2. Policy Details
    - Signup: Allow public users to create their profile during signup
    - Auth users: Can read, create and update their own profile
    - Service role: Has full access for system operations
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public policies for signup flow
CREATE POLICY "Allow users to insert their own profile during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Authenticated user policies
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role policies for system operations
CREATE POLICY "Service role can manage all profiles"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);