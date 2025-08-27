/*
  # Fix user rewards RLS policies

  1. Changes
    - Update RLS policies for user_rewards table to allow:
      - Users to insert their own rewards
      - Users to update their own rewards
      - Service role to manage all rewards
      - Users to view their own rewards
  
  2. Security
    - Maintain RLS enabled on user_rewards table
    - Add policies for authenticated users to manage their own rewards
    - Keep service role full access policy
*/

-- Drop existing policies to recreate them with correct permissions
DROP POLICY IF EXISTS "Users can view their own rewards" ON user_rewards;
DROP POLICY IF EXISTS "Service role can manage rewards" ON user_rewards;

-- Recreate policies with correct permissions
CREATE POLICY "Users can view their own rewards"
ON user_rewards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
ON user_rewards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON user_rewards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage rewards"
ON user_rewards
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);