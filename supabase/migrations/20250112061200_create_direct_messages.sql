-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_text TEXT NOT NULL,
    dm_room_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT fk_dm_room
        FOREIGN KEY (dm_room_id) 
        REFERENCES public.dm_rooms(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_sender
        FOREIGN KEY (sender_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS direct_messages_dm_room_id_idx ON public.direct_messages(dm_room_id);
CREATE INDEX IF NOT EXISTS direct_messages_sender_id_idx ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS direct_messages_created_at_idx ON public.direct_messages(created_at);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Policies for direct_messages
CREATE POLICY "Users can view messages in their DM rooms" ON public.direct_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.dm_room_members
            WHERE dm_room_members.dm_room_id = direct_messages.dm_room_id
            AND dm_room_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their DM rooms" ON public.direct_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.dm_room_members
            WHERE dm_room_members.dm_room_id = direct_messages.dm_room_id
            AND dm_room_members.user_id = auth.uid()
        )
        AND
        sender_id = auth.uid()
    ); 