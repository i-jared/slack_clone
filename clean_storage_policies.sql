-- Drop all existing policies for message-attachments
DO $$ 
BEGIN
    -- Drop policies with various naming patterns
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON storage.objects;', E'\n')
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND (
            policyname LIKE '%message%' 
            OR policyname LIKE '%msg%'
            OR policyname LIKE '%upload%'
            OR policyname LIKE '%files%'
        )
    );
END $$;

-- Create clean set of policies
DO $$ 
BEGIN
    -- Public read access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'message_attachments_read'
    ) THEN
        CREATE POLICY "message_attachments_read"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'message-attachments');
    END IF;

    -- Authenticated upload with file type validation
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'message_attachments_insert'
    ) THEN
        CREATE POLICY "message_attachments_insert"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'message-attachments'
            AND (storage.foldername(name))[1] = auth.uid()::text
            AND (
                lower(right(name, 4)) IN ('.jpg', 'jpeg', '.png', '.gif', '.pdf')
                OR lower(right(name, 5)) = '.jpeg'
            )
        );
    END IF;

    -- Owner update
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'message_attachments_update'
    ) THEN
        CREATE POLICY "message_attachments_update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'message-attachments'
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    -- Owner delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'message_attachments_delete'
    ) THEN
        CREATE POLICY "message_attachments_delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'message-attachments'
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$; 