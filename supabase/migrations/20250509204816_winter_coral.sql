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

-- Create policies
CREATE POLICY "Users can manage their own progress photos"
ON progress_photos
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX progress_photos_user_id_idx ON progress_photos(user_id);
CREATE INDEX progress_photos_week_number_idx ON progress_photos(week_number);

-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false);

-- Create storage policies
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