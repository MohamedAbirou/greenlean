-- Create storage bucket for avatars (only if it does not exist)
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Allow authenticated users to upload avatars
DO $$
BEGIN
  -- Drop if already exists to avoid duplicates
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

  -- Recreate policies
  CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING ( bucket_id = 'avatars' );

  CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK ( bucket_id = 'avatars' );

  CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO public
  USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

  CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO public
  USING ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );
END $$;
