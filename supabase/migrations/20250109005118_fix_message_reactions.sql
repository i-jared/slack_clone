-- Drop existing constraints if they exist
DO $$ BEGIN
    ALTER TABLE IF EXISTS public.message_reactions
        DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Add proper foreign key constraint with cascade delete
ALTER TABLE public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_fkey
    FOREIGN KEY (message_id)
    REFERENCES public.messages(id)
    ON DELETE CASCADE;

-- Ensure RLS is enabled
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.message_reactions;

-- Recreate policies with proper syntax
CREATE POLICY "Reactions are viewable by everyone"
ON public.message_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can add reactions"
ON public.message_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.message_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS message_reactions_message_id_idx
    ON public.message_reactions(message_id);

CREATE INDEX IF NOT EXISTS message_reactions_user_id_idx
    ON public.message_reactions(user_id); 