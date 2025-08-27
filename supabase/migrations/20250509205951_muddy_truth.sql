/*
  # Add Community Photos Support

  1. Changes
    - Add community_visible column to progress_photos
    - Add policy for viewing public photos
    - Add indexes for efficient querying
    
  2. Security
    - Only photos marked as community_visible can be seen by other users
    - Users can still control photo privacy independently
*/

-- Add community visibility column
ALTER TABLE progress_photos 
ADD COLUMN community_visible boolean DEFAULT false;

-- Create policy for viewing community photos
CREATE POLICY "Users can view community-visible photos"
ON progress_photos
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR (community_visible = true AND is_private = false)
);

-- Create index for efficient filtering
CREATE INDEX progress_photos_community_idx 
ON progress_photos(community_visible, is_private);