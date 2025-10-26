/*
  # Fix Registration Flow and Profile Creation

  1. Purpose
    - Fix the 401 error during registration by updating the user creation trigger
    - Store registration data in user metadata for post-confirmation processing
    - Ensure proper RLS policies for authenticated users only

  2. Changes
    - Update handle_new_user() function to extract username from metadata
    - The trigger creates a basic profile immediately (id, email, full_name, username)
    - Additional registration data (age, gender, height, etc.) will be stored in metadata
    - After email confirmation, the client updates the profile with full data

  3. Security
    - Profile row is created automatically by trigger (bypasses RLS)
    - Users can only update their own profile after authentication
    - No INSERT policy needed since trigger handles creation
    - Email confirmation required before profile updates
*/

-- Drop existing trigger and function to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert basic profile data immediately
  -- Additional data will be updated after email confirmation
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Remove the INSERT policy (no longer needed since trigger handles creation)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ensure UPDATE policy exists for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
