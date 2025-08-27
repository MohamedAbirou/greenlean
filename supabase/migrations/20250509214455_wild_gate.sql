/*
  # Add Workout Challenges System

  1. New Tables
    - `challenges`
      - Core challenge information
      - Types: daily, weekly, streak, goal-based
      - Difficulty levels and point values
    
    - `challenge_participants`
      - Tracks user participation and progress
      - Start/end dates and completion status
    
    - `user_rewards`
      - Stores earned points and badges
      - Tracks achievement history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'streak', 'goal')),
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  points integer NOT NULL,
  requirements jsonb NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  progress jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  completion_date timestamptz,
  streak_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points integer DEFAULT 0,
  badges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at on user_rewards
CREATE TRIGGER update_user_rewards_updated_at
  BEFORE UPDATE ON user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for challenges
CREATE POLICY "Anyone can view active challenges"
ON challenges
FOR SELECT
TO authenticated
USING (is_active = true);

-- Create policies for challenge_participants
CREATE POLICY "Users can manage their own participation"
ON challenge_participants
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view challenge leaderboards"
ON challenge_participants
FOR SELECT
TO authenticated
USING (true);

-- Create policies for user_rewards
CREATE POLICY "Users can view their own rewards"
ON user_rewards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX challenges_type_idx ON challenges(type);
CREATE INDEX challenges_difficulty_idx ON challenges(difficulty);
CREATE INDEX challenges_active_idx ON challenges(is_active);
CREATE INDEX challenge_participants_challenge_idx ON challenge_participants(challenge_id);
CREATE INDEX challenge_participants_user_idx ON challenge_participants(user_id);
CREATE INDEX challenge_participants_completed_idx ON challenge_participants(completed);
CREATE INDEX user_rewards_user_idx ON user_rewards(user_id);