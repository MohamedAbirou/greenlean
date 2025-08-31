/*
  # Add Progress Photos Feature

  1. New Tables
    - `progress_photos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `photo_url` (text)
      - `caption` (text)
      - `week_number` (integer)
      - `created_at` (timestamp)
      - `is_private` (boolean)

  2. Security
    - Enable RLS on progress_photos table
    - Add policies for authenticated users
    - Create storage bucket for progress photos
*/

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  caption text,
  week_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_private boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies on progress_photos
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own progress photos" ON progress_photos;
  CREATE POLICY "Users can manage their own progress photos"
  ON progress_photos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'progress_photos_user_id_idx'
  ) THEN
    CREATE INDEX progress_photos_user_id_idx ON progress_photos(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'progress_photos_week_number_idx'
  ) THEN
    CREATE INDEX progress_photos_week_number_idx ON progress_photos(week_number);
  END IF;
END $$;

-- Create storage bucket for progress photos (only if not exists)
INSERT INTO storage.buckets (id, name, public)
SELECT 'progress-photos', 'progress-photos', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'progress-photos'
);

-- Drop and recreate storage policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own progress photos" ON storage.objects;
  CREATE POLICY "Users can manage their own progress photos"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'progress-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
END $$;
