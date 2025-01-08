-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Create new policies with proper conditions
CREATE POLICY "Allow public read access for storage" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id IN ('avatars', 'message-attachments'));

CREATE POLICY "Allow authenticated users to upload files" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id IN ('avatars', 'message-attachments'));

CREATE POLICY "Allow users to update their own files" 
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id IN ('avatars', 'message-attachments'));

CREATE POLICY "Allow users to delete their own files" 
ON storage.objects FOR DELETE 
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]); 