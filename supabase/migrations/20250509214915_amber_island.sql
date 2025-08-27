/*
  # Fix User Rewards RLS Policies

  1. Changes
    - Add policies for user rewards table
    - Allow users to read their own rewards
    - Allow system to create initial rewards for new users
    - Add trigger to create initial rewards on user creation

  2. Security
    - Enable RLS
    - Ensure proper access control
    - Handle cases where no rewards exist yet
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own rewards" ON user_rewards;
DROP POLICY IF EXISTS "Service role can manage rewards" ON user_rewards;

-- Enable RLS
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rewards"
ON user_rewards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rewards"
ON user_rewards
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to initialize user rewards
CREATE OR REPLACE FUNCTION initialize_user_rewards()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_rewards (user_id, points, badges)
  VALUES (NEW.id, 0, '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to initialize rewards for new users
DROP TRIGGER IF EXISTS on_user_created_initialize_rewards ON auth.users;
CREATE TRIGGER on_user_created_initialize_rewards
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_rewards();

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_rewards_user_id_key'
  ) THEN
    ALTER TABLE user_rewards ADD CONSTRAINT user_rewards_user_id_key UNIQUE (user_id);
  END IF;
END $$;