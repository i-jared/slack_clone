-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('message-attachments', 'message-attachments', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 10485760; -- 10MB in bytes

-- Enable RLS for storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_read" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_update" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_delete" ON storage.objects;

-- Create new policies
CREATE POLICY "message_attachments_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-attachments');

CREATE POLICY "message_attachments_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "message_attachments_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "message_attachments_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
); 