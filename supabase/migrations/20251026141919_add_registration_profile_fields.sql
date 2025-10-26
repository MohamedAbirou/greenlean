/*
  # Add Registration Profile Fields

  1. Schema Changes
    - Add personal information fields collected during registration:
      - `age` (integer) - User's age
      - `date_of_birth` (date) - User's date of birth
      - `gender` (text) - User's gender identity
      - `country` (text) - User's country/region
      - `height_cm` (float) - Height in centimeters (always stored in metric)
      - `weight_kg` (float) - Weight in kilograms (always stored in metric)
      - `occupation_activity` (text) - Daily activity level description
      - `unit_system` (text) - Preferred unit system (metric/imperial)
      - `onboarding_completed` (boolean) - Track if user completed full onboarding

  2. Purpose
    - These fields are collected during the multi-step registration process
    - They will be used to skip redundant questions in the quiz
    - Data is stored in metric units internally for consistency
    - Unit system preference determines display format

  3. Notes
    - All new fields are nullable to support existing users
    - Default unit_system is 'metric'
    - onboarding_completed defaults to false
*/

-- Add registration profile fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE profiles ADD COLUMN age INT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gender TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'height_cm'
  ) THEN
    ALTER TABLE profiles ADD COLUMN height_cm FLOAT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE profiles ADD COLUMN weight_kg FLOAT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'occupation_activity'
  ) THEN
    ALTER TABLE profiles ADD COLUMN occupation_activity TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'unit_system'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unit_system TEXT DEFAULT 'metric';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;
END $$;
