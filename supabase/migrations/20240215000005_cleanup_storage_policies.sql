-- Drop all existing storage policies
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
    END LOOP;
END $$;

-- Create clean set of policies for avatars
CREATE POLICY "avatars_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (
        lower(right(name, 4)) IN ('.jpg', '.png', '.gif')
        OR lower(right(name, 5)) = '.jpeg'
    )
);

CREATE POLICY "avatars_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create clean set of policies for message attachments
CREATE POLICY "message_attachments_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'message_attachments');

CREATE POLICY "message_attachments_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'message_attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (
        lower(right(name, 4)) IN ('.jpg', '.png', '.gif', '.pdf')
        OR lower(right(name, 5)) = '.jpeg'
    )
);

CREATE POLICY "message_attachments_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'message_attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "message_attachments_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'message_attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
); 