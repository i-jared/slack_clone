-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_read" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_update" ON storage.objects;
DROP POLICY IF EXISTS "message_attachments_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar_read" ON storage.objects;
DROP POLICY IF EXISTS "avatar_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete" ON storage.objects;

-- Ensure buckets exist with consistent naming
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('message-attachments', 'message-attachments', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 10485760; -- 10MB in bytes

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies with consistent naming
CREATE POLICY "storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('message-attachments', 'avatars'));

CREATE POLICY "storage_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN ('message-attachments', 'avatars')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id IN ('message-attachments', 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "storage_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id IN ('message-attachments', 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
); 