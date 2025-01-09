-- Add a new policy for reading user data (if it doesn't exist)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Note: This is non-destructive as it only adds a policy if it doesn't exist
-- Existing policies will remain unchanged 