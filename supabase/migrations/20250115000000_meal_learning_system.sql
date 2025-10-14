/*
  # Meal Learning System Schema
  
  This migration adds tables for:
  1. User meal feedback and ratings
  2. ML training data
  3. Meal generation logs
  4. Enhanced food database with health mappings
*/

-- Create meal_feedback table for user ratings and feedback
CREATE TABLE IF NOT EXISTS meal_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_id text NOT NULL, -- Reference to generated meal
  meal_name text NOT NULL,
  template_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  liked boolean,
  satiety_score integer CHECK (satiety_score >= 1 AND satiety_score <= 5),
  goal_progress_score integer CHECK (goal_progress_score >= 1 AND goal_progress_score <= 5),
  feedback_text text,
  consumed boolean DEFAULT false,
  consumed_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_generation_logs table for tracking generation decisions
CREATE TABLE IF NOT EXISTS meal_generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL, -- Groups related meal generations
  meal_name text NOT NULL,
  template_name text,
  template_score numeric,
  macro_alignment_score numeric,
  health_condition_score numeric,
  variety_score numeric,
  total_score numeric,
  selected_reason text, -- Why this template was chosen
  alternatives_considered jsonb, -- Other templates that were considered
  scaling_factor numeric,
  final_calories numeric,
  final_protein numeric,
  final_carbs numeric,
  final_fats numeric,
  health_conditions jsonb,
  dietary_restrictions jsonb,
  goal text,
  diet_type text,
  created_at timestamptz DEFAULT now()
);

-- Create enhanced food_health_mappings table
CREATE TABLE IF NOT EXISTS food_health_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_key text NOT NULL,
  health_condition text NOT NULL,
  benefit_type text CHECK (benefit_type IN ('beneficial', 'neutral', 'restricted', 'avoid')),
  benefit_score numeric DEFAULT 0, -- -2 to +2 scale
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(food_key, health_condition)
);

-- Create user_preferences table for learning user patterns
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  preference_type text NOT NULL, -- 'food_likes', 'food_dislikes', 'meal_timing', 'cooking_style'
  preference_key text NOT NULL, -- food name, meal type, etc.
  preference_value numeric NOT NULL, -- strength of preference (-1 to +1)
  confidence numeric DEFAULT 0.5, -- how confident we are in this preference
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, preference_type, preference_key)
);

-- Create ml_model_performance table for tracking model accuracy
CREATE TABLE IF NOT EXISTS ml_model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  evaluation_date timestamptz DEFAULT now(),
  training_data_size integer,
  test_data_size integer,
  notes text
);

-- Enable RLS on all new tables
ALTER TABLE meal_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_health_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for meal_feedback
CREATE POLICY "Users can manage own meal feedback"
  ON meal_feedback
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for meal_generation_logs
CREATE POLICY "Users can read own meal generation logs"
  ON meal_generation_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for food_health_mappings (read-only for users)
CREATE POLICY "Users can read food health mappings"
  ON food_health_mappings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for ml_model_performance (admin only)
CREATE POLICY "Admins can manage ML model performance"
  ON ml_model_performance
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_feedback_user_id ON meal_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_feedback_meal_id ON meal_feedback(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_feedback_rating ON meal_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_meal_feedback_created_at ON meal_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_meal_generation_logs_user_id ON meal_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_generation_logs_session_id ON meal_generation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_meal_generation_logs_created_at ON meal_generation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_food_health_mappings_food_key ON food_health_mappings(food_key);
CREATE INDEX IF NOT EXISTS idx_food_health_mappings_health_condition ON food_health_mappings(health_condition);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);

-- Insert initial food health mappings data
INSERT INTO food_health_mappings (food_key, health_condition, benefit_type, benefit_score, notes) VALUES
-- Diabetes beneficial foods
('oats', 'diabetes', 'beneficial', 1.5, 'High fiber, low glycemic index'),
('lentils', 'diabetes', 'beneficial', 1.8, 'High fiber, protein, low glycemic index'),
('blackBeans', 'diabetes', 'beneficial', 1.6, 'High fiber, protein, complex carbs'),
('sweetPotato', 'diabetes', 'beneficial', 1.2, 'Lower glycemic index than white potato'),
('chiaSeeds', 'diabetes', 'beneficial', 1.4, 'High fiber, omega-3, helps blood sugar control'),
('berries', 'diabetes', 'beneficial', 1.3, 'Low sugar, high antioxidants'),

-- Heart disease beneficial foods
('salmon', 'heartDisease', 'beneficial', 2.0, 'High omega-3 fatty acids'),
('almonds', 'heartDisease', 'beneficial', 1.7, 'Healthy fats, vitamin E'),
('walnuts', 'heartDisease', 'beneficial', 1.8, 'Omega-3, antioxidants'),
('oliveOil', 'heartDisease', 'beneficial', 1.9, 'Monounsaturated fats'),
('avocado', 'heartDisease', 'beneficial', 1.6, 'Healthy fats, potassium'),
('broccoli', 'heartDisease', 'beneficial', 1.4, 'Antioxidants, fiber'),
('kale', 'heartDisease', 'beneficial', 1.5, 'Antioxidants, vitamin K'),
('flaxseeds', 'heartDisease', 'beneficial', 1.7, 'Omega-3, fiber'),

-- High blood pressure beneficial foods
('spinach', 'highBloodPressure', 'beneficial', 1.6, 'High potassium, magnesium'),
('oats', 'highBloodPressure', 'beneficial', 1.3, 'Beta-glucan fiber'),
('lentils', 'highBloodPressure', 'beneficial', 1.4, 'High potassium, magnesium, fiber'),

-- Thyroid issues beneficial foods
('salmon', 'thyroidIssues', 'beneficial', 1.5, 'High selenium, omega-3'),
('eggs', 'thyroidIssues', 'beneficial', 1.3, 'Iodine, selenium'),
('brazilNuts', 'thyroidIssues', 'beneficial', 1.8, 'Very high selenium'),

-- Foods to avoid for diabetes
('whiteRice', 'diabetes', 'restricted', -1.2, 'High glycemic index'),
('whitePotato', 'diabetes', 'restricted', -1.0, 'High glycemic index'),
('grapes', 'diabetes', 'restricted', -0.8, 'High sugar content'),
('pineapple', 'diabetes', 'restricted', -0.7, 'High sugar content'),

-- Foods to avoid for heart disease
('cheese', 'heartDisease', 'restricted', -1.0, 'High saturated fat'),
('coconutOil', 'heartDisease', 'restricted', -1.3, 'High saturated fat'),
('leanBeef', 'heartDisease', 'restricted', -0.8, 'Saturated fat content'),

-- Foods to avoid for high blood pressure
('cheese', 'highBloodPressure', 'restricted', -1.1, 'High sodium content'),
('processedMeats', 'highBloodPressure', 'restricted', -1.5, 'Very high sodium'),

-- Allergy restrictions
('tofu', 'soyAllergy', 'avoid', -2.0, 'Contains soy'),
('tempeh', 'soyAllergy', 'avoid', -2.0, 'Contains soy'),
('edamame', 'soyAllergy', 'avoid', -2.0, 'Contains soy'),
('soyMilk', 'soyAllergy', 'avoid', -2.0, 'Contains soy'),
('seitan', 'glutenAllergy', 'avoid', -2.0, 'Contains gluten'),
('wholeWheatBread', 'glutenAllergy', 'avoid', -2.0, 'Contains gluten'),
('wholeWheatPasta', 'glutenAllergy', 'avoid', -2.0, 'Contains gluten'),
('oats', 'glutenAllergy', 'avoid', -1.5, 'May contain gluten'),
('almonds', 'nutAllergy', 'avoid', -2.0, 'Tree nuts'),
('walnuts', 'nutAllergy', 'avoid', -2.0, 'Tree nuts'),
('cashews', 'nutAllergy', 'avoid', -2.0, 'Tree nuts'),
('peanuts', 'nutAllergy', 'avoid', -2.0, 'Peanuts'),
('almondMilk', 'nutAllergy', 'avoid', -2.0, 'Contains almonds');

-- Create trigger for updated_at on meal_feedback
CREATE TRIGGER update_meal_feedback_updated_at
  BEFORE UPDATE ON meal_feedback
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create trigger for updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
