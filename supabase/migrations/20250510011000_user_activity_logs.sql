/*
  # User Activity Logs Table
  - Allows users to log daily activities (workout, steps, calories, notes, etc.)
*/

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  activity_type text NOT NULL, -- e.g. 'Workout', 'Steps', 'Cardio', 'Yoga', etc.
  duration_minutes integer,    -- optional, for workouts
  calories_burned integer,     -- optional
  steps integer,               -- optional
  notes text,                  -- optional
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own logs
CREATE POLICY "Users can manage own activity logs"
  ON user_activity_logs FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role can do anything
CREATE POLICY "Service role can manage activity logs"
  ON user_activity_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_activity_logs_updated_at ON user_activity_logs;
CREATE TRIGGER update_user_activity_logs_updated_at
  BEFORE UPDATE ON user_activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
