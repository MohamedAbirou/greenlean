/*
  # AI-Generated Meal and Workout Plans System

  1. New Tables
    - `ai_meal_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `quiz_result_id` (uuid, references quiz_results)
      - `plan_data` (jsonb) - Complete meal plan with recipes, macros, portions
      - `daily_calories` (integer)
      - `preferences` (text)
      - `restrictions` (text)
      - `generated_at` (timestamp)
      - `is_active` (boolean) - Current active plan
      - `created_at` (timestamp)
    
    - `ai_workout_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `quiz_result_id` (uuid, references quiz_results)
      - `plan_data` (jsonb) - Complete workout schedule with exercises, sets, reps
      - `workout_type` (text)
      - `duration_per_session` (text)
      - `frequency_per_week` (integer)
      - `generated_at` (timestamp)
      - `is_active` (boolean) - Current active plan
      - `created_at` (timestamp)
    
    - `daily_nutrition_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `log_date` (date)
      - `meal_type` (text) - breakfast, lunch, dinner, snack
      - `food_items` (jsonb) - Array of food items with portions and macros
      - `total_calories` (integer)
      - `total_protein` (numeric)
      - `total_carbs` (numeric)
      - `total_fats` (numeric)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `workout_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `workout_date` (date)
      - `workout_type` (text)
      - `exercises` (jsonb) - Array of exercises with sets, reps, weight
      - `duration_minutes` (integer)
      - `calories_burned` (integer)
      - `notes` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
    
    - `daily_water_intake`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `log_date` (date)
      - `glasses` (integer) - Number of glasses (250ml each)
      - `total_ml` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_progress_snapshots`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `snapshot_date` (date)
      - `weight` (numeric)
      - `body_fat_percentage` (numeric)
      - `measurements` (jsonb) - chest, waist, hips, etc.
      - `progress_photo_url` (text)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for performance optimization on frequently queried fields
*/

-- Create ai_meal_plans table
CREATE TABLE IF NOT EXISTS ai_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  quiz_result_id uuid REFERENCES quiz_results ON DELETE SET NULL,
  plan_data jsonb NOT NULL,
  daily_calories integer NOT NULL,
  preferences text DEFAULT '',
  restrictions text DEFAULT '',
  generated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create ai_workout_plans table
CREATE TABLE IF NOT EXISTS ai_workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  quiz_result_id uuid REFERENCES quiz_results ON DELETE SET NULL,
  plan_data jsonb NOT NULL,
  workout_type text NOT NULL,
  duration_per_session text NOT NULL,
  frequency_per_week integer DEFAULT 3,
  generated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create daily_nutrition_logs table
CREATE TABLE IF NOT EXISTS daily_nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_calories integer DEFAULT 0,
  total_protein numeric(10, 2) DEFAULT 0,
  total_carbs numeric(10, 2) DEFAULT 0,
  total_fats numeric(10, 2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  workout_type text NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes integer DEFAULT 0,
  calories_burned integer DEFAULT 0,
  notes text DEFAULT '',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create daily_water_intake table
CREATE TABLE IF NOT EXISTS daily_water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  glasses integer DEFAULT 0,
  total_ml integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- Create user_progress_snapshots table
CREATE TABLE IF NOT EXISTS user_progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric(10, 2),
  body_fat_percentage numeric(5, 2),
  measurements jsonb DEFAULT '{}'::jsonb,
  progress_photo_url text,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE ai_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_meal_plans
CREATE POLICY "Users can read own meal plans"
  ON ai_meal_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON ai_meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON ai_meal_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON ai_meal_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_workout_plans
CREATE POLICY "Users can read own workout plans"
  ON ai_workout_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON ai_workout_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON ai_workout_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON ai_workout_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_nutrition_logs
CREATE POLICY "Users can read own nutrition logs"
  ON daily_nutrition_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs"
  ON daily_nutrition_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs"
  ON daily_nutrition_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs"
  ON daily_nutrition_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for workout_logs
CREATE POLICY "Users can read own workout logs"
  ON workout_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_water_intake
CREATE POLICY "Users can read own water intake"
  ON daily_water_intake
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake"
  ON daily_water_intake
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water intake"
  ON daily_water_intake
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake"
  ON daily_water_intake
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_progress_snapshots
CREATE POLICY "Users can read own progress snapshots"
  ON user_progress_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress snapshots"
  ON user_progress_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress snapshots"
  ON user_progress_snapshots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress snapshots"
  ON user_progress_snapshots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_meal_plans_user_id ON ai_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_meal_plans_active ON ai_meal_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user_id ON ai_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_active ON ai_workout_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON daily_nutrition_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON daily_water_intake(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_user_date ON user_progress_snapshots(user_id, snapshot_date DESC);

-- Function to update water intake updated_at
CREATE OR REPLACE FUNCTION update_water_intake_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for water intake updated_at
CREATE TRIGGER trigger_update_water_intake_updated_at
  BEFORE UPDATE ON daily_water_intake
  FOR EACH ROW
  EXECUTE FUNCTION update_water_intake_updated_at();

-- Function to deactivate old plans when a new plan is set as active
CREATE OR REPLACE FUNCTION deactivate_old_meal_plans()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE ai_meal_plans
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deactivate_old_workout_plans()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE ai_workout_plans
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for plan deactivation
CREATE TRIGGER trigger_deactivate_old_meal_plans
  BEFORE INSERT OR UPDATE ON ai_meal_plans
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION deactivate_old_meal_plans();

CREATE TRIGGER trigger_deactivate_old_workout_plans
  BEFORE INSERT OR UPDATE ON ai_workout_plans
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION deactivate_old_workout_plans();