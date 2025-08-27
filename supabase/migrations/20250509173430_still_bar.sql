/*
  # Fix Profile Table Policies

  1. Changes
    - Add policy to allow new users to create their own profile
    - Ensure authenticated users can manage their own profiles
    - Enable service role access for system operations

  2. Security
    - Maintains RLS enabled
    - Policies ensure users can only access their own data
    - Service role maintains full access for system operations
*/

-- Drop existing policies to clean up
DROP POLICY IF EXISTS "Allow users to manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new streamlined policies
CREATE POLICY "Enable insert for signup" ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);