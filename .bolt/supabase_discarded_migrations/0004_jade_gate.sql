/*
  # Add storage bucket for widget media

  1. New Storage Bucket
    - Creates a new storage bucket for widget media files
    - Sets up RLS policies for secure access
  
  2. Security
    - Public read access for media files
    - Authenticated write access with user folder isolation
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('widget-media', 'Widget Media Storage', true);

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'widget-media');

-- Allow authenticated users to upload to their folder
CREATE POLICY "User Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'widget-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "User Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'widget-media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);