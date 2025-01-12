-- Drop existing policy
DROP POLICY IF EXISTS "Insert dm_room_members" ON public.dm_room_members;

-- Create new policy that allows inserting any member
CREATE POLICY "Insert dm_room_members"
ON public.dm_room_members FOR INSERT 
TO authenticated
WITH CHECK (true);
