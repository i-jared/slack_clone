ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS parent_id bigint REFERENCES public.messages (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS messages_parent_id_idx
  ON public.messages (parent_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow individual insert access" ON public.messages;
DROP POLICY IF EXISTS "Allow logged-in read access" ON public.messages;

-- Recreate policies with correct syntax
CREATE POLICY "Allow individual insert access"
ON public.messages
FOR INSERT
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Allow logged-in read access"
ON public.messages
FOR SELECT
USING ( auth.role() = 'authenticated' );
