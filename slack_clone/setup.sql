-- Example snippet for direct_messages to have a valid foreign key from sender_id -> users(id)
-- Adjust similarly if you want expansions like sender:sender_id(*).

-- If table exists, drop or alter as needed:
DROP TABLE IF EXISTS public.direct_messages CASCADE;

CREATE TABLE public.direct_messages (
  id             UUID PRIMARY KEY,
  dm_room_id     UUID NOT NULL,
  sender_id      UUID NOT NULL,
  parent_id      UUID,
  message_text   TEXT,
  attachments    JSONB,
  mentions       JSONB,
  metadata       JSONB,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now(),
  placeholder_1  TEXT
);

ALTER TABLE public.direct_messages
  ADD CONSTRAINT direct_messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES public.users (id)
  ON DELETE CASCADE;

-- If you want relationship expansion for dm_room_id, do:
ALTER TABLE public.direct_messages
  ADD CONSTRAINT direct_messages_dm_room_id_fkey
  FOREIGN KEY (dm_room_id)
  REFERENCES public.dm_rooms (id)
  ON DELETE CASCADE;

-- RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select direct messages open"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert DM if user is sender"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK ( sender_id = auth.uid() );

CREATE POLICY "Update own DM"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING ( sender_id = auth.uid() )
WITH CHECK ( sender_id = auth.uid() );

CREATE POLICY "Delete own DM"
ON public.direct_messages
FOR DELETE
TO authenticated
USING ( sender_id = auth.uid() );