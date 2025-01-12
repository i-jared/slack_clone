-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow signup insert" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.users;
DROP POLICY IF EXISTS "Allow individual update" ON public.users;

-- Allow new user creation during signup
CREATE POLICY "Allow signup insert"
ON public.users FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- For anon, only allow during signup
  (auth.role() = 'anon' AND id = auth.uid()) OR
  -- For authenticated, only allow inserting own row
  (auth.role() = 'authenticated' AND id = auth.uid())
);

-- Allow authenticated users to read all users
CREATE POLICY "Allow authenticated read"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own data
CREATE POLICY "Allow individual update"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid()); 