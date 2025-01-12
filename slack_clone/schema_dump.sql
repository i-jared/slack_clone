-- Updated creation for public.messages to have FK references for PostgREST expansions
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id             UUID PRIMARY KEY,
  channel_id     UUID NOT NULL,
  user_id        UUID NOT NULL,
  parent_id      UUID,
  message_text   TEXT,
  attachments    JSONB,
  mentions       JSONB,
  metadata       JSONB,
  placeholder_1  TEXT,
  placeholder_2  JSONB,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

-- Add the needed foreign keys:
ALTER TABLE public.messages
  ADD CONSTRAINT messages_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users (id)
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_channel_id_fkey
  FOREIGN KEY (channel_id)
  REFERENCES public.channels (id)
  ON DELETE CASCADE;

-- Re-enable RLS and reapply policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all channel messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert message if user is sender"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Update own message"
ON public.messages
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Delete own message"
ON public.messages
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );