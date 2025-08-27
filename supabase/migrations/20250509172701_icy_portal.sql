/*
  # Fix profiles table foreign key constraint

  1. Changes
    - Drop the existing foreign key constraint that references non-existent 'users' table
    - Add new foreign key constraint referencing 'auth.users' table
    
  2. Security
    - Maintains existing RLS policies
    - No changes to security settings required
*/

DO $$ 
BEGIN
  -- Drop the existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;

  -- Add the correct foreign key constraint
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
END $$;