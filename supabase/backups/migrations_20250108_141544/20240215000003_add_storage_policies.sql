-- Enable RLS for storage.objects if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create new policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow public read access for storage'
    ) THEN
        CREATE POLICY "Allow public read access for storage" 
        ON storage.objects FOR SELECT 
        TO public 
        USING (bucket_id IN ('avatars', 'message-attachments'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload files'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload files" 
        ON storage.objects FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id IN ('avatars', 'message-attachments'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to update their own files'
    ) THEN
        CREATE POLICY "Allow users to update their own files" 
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (auth.uid()::text = (storage.foldername(name))[1])
        WITH CHECK (bucket_id IN ('avatars', 'message-attachments'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow users to delete their own files'
    ) THEN
        CREATE POLICY "Allow users to delete their own files" 
        ON storage.objects FOR DELETE 
        TO authenticated
        USING (auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$; 