-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload avatars
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