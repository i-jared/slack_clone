-- Enable storage by creating policies
DO $$ 
BEGIN
    -- Create policies for message_attachments bucket
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow authenticated users to read message attachments'
    ) THEN
        CREATE POLICY "Allow authenticated users to read message attachments"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'message-attachments');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow authenticated users to upload message attachments'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload message attachments"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'message-attachments'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Create policies for avatars bucket
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow authenticated users to read avatars'
    ) THEN
        CREATE POLICY "Allow authenticated users to read avatars"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'avatars');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow authenticated users to upload avatars'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload avatars"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'avatars'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Allow users to delete their own files
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = 'Allow users to delete their own files'
    ) THEN
        CREATE POLICY "Allow users to delete their own files"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ((storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$; 