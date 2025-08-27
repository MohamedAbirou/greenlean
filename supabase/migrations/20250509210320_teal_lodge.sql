/*
  # Add social features for community photos

  1. New Tables
    - `photo_likes`
      - `id` (uuid, primary key)
      - `photo_id` (uuid, references progress_photos)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `photo_comments`
      - `id` (uuid, primary key)
      - `photo_id` (uuid, references progress_photos)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create photo_likes table
CREATE TABLE IF NOT EXISTS photo_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES progress_photos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Create photo_comments table
CREATE TABLE IF NOT EXISTS photo_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES progress_photos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for photo_likes
CREATE POLICY "Users can manage their own likes"
ON photo_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view likes on community photos"
ON photo_likes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM progress_photos
    WHERE id = photo_id
    AND (community_visible = true OR user_id = auth.uid())
  )
);

-- Create policies for photo_comments
CREATE POLICY "Users can manage their own comments"
ON photo_comments
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments on community photos"
ON photo_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM progress_photos
    WHERE id = photo_id
    AND (community_visible = true OR user_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX photo_likes_photo_id_idx ON photo_likes(photo_id);
CREATE INDEX photo_likes_user_id_idx ON photo_likes(user_id);
CREATE INDEX photo_comments_photo_id_idx ON photo_comments(photo_id);
CREATE INDEX photo_comments_user_id_idx ON photo_comments(user_id);