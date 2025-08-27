/*
  # Add saved tips functionality

  1. New Tables
    - `saved_tips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tip_id` (integer)
      - `tip_content` (text)
      - `tip_title` (text)
      - `tip_category` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_tips` table
    - Add policies for authenticated users
*/

-- Create saved_tips table
CREATE TABLE IF NOT EXISTS saved_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tip_id integer NOT NULL,
  tip_content text NOT NULL,
  tip_title text NOT NULL,
  tip_category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saved_tips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own saved tips"
ON saved_tips
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX saved_tips_user_id_idx ON saved_tips(user_id);
CREATE UNIQUE INDEX saved_tips_user_tip_idx ON saved_tips(user_id, tip_id);