-- Update DM Room Members policies
DROP POLICY IF EXISTS "Insert dm_room_members" ON public.dm_room_members;
DROP POLICY IF EXISTS "Update dm_room_members if self" ON public.dm_room_members;
DROP POLICY IF EXISTS "Delete dm_room_members if self" ON public.dm_room_members;

CREATE POLICY "Insert dm_room_members" ON public.dm_room_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update dm_room_members if self" ON public.dm_room_members FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete dm_room_members if self" ON public.dm_room_members FOR DELETE TO authenticated USING (user_id = auth.uid());
