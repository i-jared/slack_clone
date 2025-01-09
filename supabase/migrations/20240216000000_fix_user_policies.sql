-- Drop the existing policy
DROP POLICY IF EXISTS "Allow logged-in read access" ON public.users;

-- Create a new policy that allows authenticated users to read all user data
CREATE POLICY "Allow authenticated users to read all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Keep the existing policies for insert and update
-- They ensure users can only modify their own data 