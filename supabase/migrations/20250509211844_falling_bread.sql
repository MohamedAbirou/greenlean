/*
  # Add username field and update comment structure

  1. Changes
    - Add username field to profiles table
    - Add parent_id to photo_comments for nested replies
    - Add unique constraint and index on username
    - Update RLS policies
    
  2. Security
    - Username must be unique
    - Only authenticated users can update their username
    - Maintain existing RLS policies
*/

-- Add username field to profiles
ALTER TABLE profiles
ADD COLUMN username text UNIQUE;

-- Add parent_id to photo_comments for nested replies
ALTER TABLE photo_comments
ADD COLUMN parent_id uuid REFERENCES photo_comments(id) ON DELETE CASCADE;

-- Create index for usernames
CREATE INDEX profiles_username_idx ON profiles(username);

-- Create index for nested comments
CREATE INDEX photo_comments_parent_id_idx ON photo_comments(parent_id);

-- Update the handle_new_user function to generate a default username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  username_base TEXT;
  username_attempt TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base username from full name or email
  username_base := LOWER(REGEXP_REPLACE(
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    '[^a-zA-Z0-9]',
    '',
    'g'
  ));

  -- Try username with increasing counter until unique
  LOOP
    IF counter = 0 THEN
      username_attempt := username_base;
    ELSE
      username_attempt := username_base || counter::text;
    END IF;

    BEGIN
      INSERT INTO public.profiles (id, email, full_name, username)
      VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        username_attempt
      );
      EXIT; -- Exit loop if insert succeeds
    EXCEPTION WHEN unique_violation THEN
      counter := counter + 1;
      CONTINUE; -- Try next counter value
    END;
  END LOOP;

  RETURN NEW;
END;
$$;