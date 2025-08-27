/*
  # Fix signup trigger and policies

  1. Changes
    - Drop existing trigger and function
    - Recreate handle_new_user function with security definer
    - Recreate trigger with proper permissions
    - Update policies to ensure proper access

  2. Security
    - Function runs with elevated privileges
    - Maintains RLS security
    - Proper permission grants
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update policies
DROP POLICY IF EXISTS "Enable insert for signup" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
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
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;