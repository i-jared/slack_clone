-- Update messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  ADD COLUMN IF NOT EXISTS thread_id UUID,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS edited_by UUID,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model TEXT,
  ADD COLUMN IF NOT EXISTS ai_prompt TEXT,
  ADD COLUMN IF NOT EXISTS ai_response_metadata JSONB,
  ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Update direct_messages table
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  ADD COLUMN IF NOT EXISTS thread_id UUID,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS edited_by UUID,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model TEXT,
  ADD COLUMN IF NOT EXISTS ai_prompt TEXT,
  ADD COLUMN IF NOT EXISTS ai_response_metadata JSONB,
  ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Update message_reactions table
ALTER TABLE public.message_reactions
  ADD COLUMN IF NOT EXISTS workspace_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'emoji',
  ADD COLUMN IF NOT EXISTS custom_emoji_id UUID,
  ADD COLUMN IF NOT EXISTS skin_tone TEXT,
  ADD COLUMN IF NOT EXISTS reaction_score INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- Add foreign key constraints
ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_workspace
  FOREIGN KEY (workspace_id)
  REFERENCES public.workspaces(id)
  ON DELETE CASCADE;

ALTER TABLE public.direct_messages
  ADD CONSTRAINT fk_direct_messages_workspace
  FOREIGN KEY (workspace_id)
  REFERENCES public.workspaces(id)
  ON DELETE CASCADE;

ALTER TABLE public.message_reactions
  ADD CONSTRAINT fk_message_reactions_workspace
  FOREIGN KEY (workspace_id)
  REFERENCES public.workspaces(id)
  ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_workspace_id ON public.messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_workspace_id ON public.direct_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_thread_id ON public.direct_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON public.direct_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_workspace_id ON public.message_reactions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id); 