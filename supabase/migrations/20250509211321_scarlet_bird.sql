/*
  # Add comment likes and mentions functionality

  1. New Tables
    - `comment_likes`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, references photo_comments)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Changes
    - Add mentions array to photo_comments table
    - Add indexes for performance
    - Add RLS policies
*/

-- Add mentions array to photo_comments
ALTER TABLE photo_comments
ADD COLUMN mentions uuid[] DEFAULT '{}';

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES photo_comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_likes
CREATE POLICY "Users can manage their own comment likes"
ON comment_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comment likes on community photos"
ON comment_likes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM photo_comments pc
    JOIN progress_photos pp ON pc.photo_id = pp.id
    WHERE pc.id = comment_id
    AND (pp.community_visible = true OR pp.user_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX comment_likes_user_id_idx ON comment_likes(user_id);
CREATE INDEX photo_comments_mentions_idx ON photo_comments USING gin(mentions);