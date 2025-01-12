-- 1) Drop old table (DANGER: this erases data!)
DROP TABLE IF EXISTS public.users CASCADE;

-- 2) Create the new `users` table
CREATE TABLE public.users (
  id                UUID PRIMARY KEY,            -- Ties to Supabase Auth user
  email             TEXT UNIQUE NOT NULL,        -- Single source of truth for Email
  username          TEXT UNIQUE NOT NULL,        -- Distinct handle (like "reece123")
  display_name      TEXT,                        -- e.g. "Reece the Jedi"
  phone_number      TEXT,                        -- Optional phone
  avatar_url        TEXT,                        -- Link to user’s (or AI’s) avatar
  description       TEXT,                        -- "Bio" or "about me"
  status            TEXT,                        -- e.g. "ONLINE", "OFFLINE", "DND", etc.
  faction           TEXT,                        -- e.g. "Jedi", "Sith", etc.
  last_seen         TIMESTAMP,                   -- Last activity
  is_bot            BOOLEAN DEFAULT FALSE,       -- Distinguish AI/bot vs. real human
  preferences       JSONB,                       -- e.g. { "theme": "dark", "ai_auto_reply": true }
  ai_persona        JSONB,                       -- Minimal style data or advanced AI config
  gamification      JSONB,                       -- ranks, XP, achievements
  metadata          JSONB,                       -- fallback for expansions
  placeholder_col_1 TEXT,                        -- extra
  placeholder_col_2 JSONB,                       -- extra
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

-- 3) Enable Row Level Security (RLS) on the new table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- (Optional) Force RLS so no bypass is possible
-- ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- 4) Create RLS policies
-- Policy A: Let all authenticated users read all user rows (less secure, more functional)
CREATE POLICY "Public read of all users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Policy B: Insert own row (when user signs up, id must match auth.uid())
CREATE POLICY "Insert your own user row"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK ( id = auth.uid() );

-- Policy C: Update only your own row
CREATE POLICY "Update self"
ON public.users
FOR UPDATE
TO authenticated
USING ( id = auth.uid() )
WITH CHECK ( id = auth.uid() );

-- Policy D: Optionally allow a user to delete themselves
-- (DANGEROUS: might not want this in real production)
CREATE POLICY "Delete self"
ON public.users
FOR DELETE
TO authenticated
USING ( id = auth.uid() );


------------------------------
-- 1) Drop existing table
------------------------------
DROP TABLE IF EXISTS public.ai_documents CASCADE;

------------------------------
-- 2) Create the `ai_documents` table
------------------------------
CREATE TABLE public.ai_documents (
  id               UUID PRIMARY KEY,
  owner_user_id    UUID NOT NULL,            -- references public.users(id)
  title            TEXT,                     -- e.g. "My Personal Blog Posts"
  description      TEXT,                     -- optional extra info
  source_type      TEXT,                     -- "uploaded_file", "google_drive", etc.
  content_url      TEXT,                     -- link/path to large file if stored externally
  embedding_refs   JSONB,                    -- references to vector index or chunk metadata
  metadata         JSONB,                    -- fallback for expansions
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

------------------------------
-- 3) Enable RLS
------------------------------
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;

-- Optional: Force RLS
-- ALTER TABLE public.ai_documents FORCE ROW LEVEL SECURITY;

------------------------------
-- 4) Define RLS Policies
------------------------------

-- Policy A: SELECT
-- Only the user who owns the doc can read it
-- If you'd like to make them visible to all, replace `USING ( owner_user_id = auth.uid() )` with `USING (true)`.
CREATE POLICY "Select ai_documents if owner"
ON public.ai_documents
FOR SELECT
TO authenticated
USING ( owner_user_id = auth.uid() );

-- Policy B: INSERT
-- Let any authenticated user insert, as long as the `owner_user_id` matches their auth.uid().
CREATE POLICY "Insert your own ai_docs"
ON public.ai_documents
FOR INSERT
TO authenticated
WITH CHECK ( owner_user_id = auth.uid() );

-- Policy C: UPDATE
-- Let the owner update their doc.
CREATE POLICY "Update your own ai_docs"
ON public.ai_documents
FOR UPDATE
TO authenticated
USING ( owner_user_id = auth.uid() )
WITH CHECK ( owner_user_id = auth.uid() );

-- Policy D: DELETE
-- Let the owner delete their doc.
CREATE POLICY "Delete your own ai_docs"
ON public.ai_documents
FOR DELETE
TO authenticated
USING ( owner_user_id = auth.uid() );


-------------------------------------
-- 1) WORKSPACES TABLE
-------------------------------------
DROP TABLE IF EXISTS public.workspaces CASCADE;

CREATE TABLE public.workspaces (
  id               UUID PRIMARY KEY,
  name             TEXT NOT NULL,
  owner_id         UUID NOT NULL,             -- references users.id
  workspace_type   TEXT DEFAULT 'standard',   -- e.g. 'public', 'private', 'invite_only'
  metadata         JSONB,
  placeholder_1    TEXT,
  placeholder_2    JSONB,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;  -- optional

-- RLS Policies:
-- 1) SELECT: let all authenticated users see all workspaces (less secure).
CREATE POLICY "Public read of all workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (true);

-- 2) INSERT: user must set owner_id = their auth.uid().
CREATE POLICY "Insert workspace"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK ( owner_id = auth.uid() );

-- 3) UPDATE: only the owner can update.
CREATE POLICY "Update if workspace owner"
ON public.workspaces
FOR UPDATE
TO authenticated
USING ( owner_id = auth.uid() )
WITH CHECK ( owner_id = auth.uid() );

-- 4) DELETE: only the owner can delete.
CREATE POLICY "Delete if workspace owner"
ON public.workspaces
FOR DELETE
TO authenticated
USING ( owner_id = auth.uid() );


-------------------------------------
-- 2) WORKSPACE_MEMBERS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.workspace_members CASCADE;

CREATE TABLE public.workspace_members (
  id             UUID PRIMARY KEY,
  workspace_id   UUID NOT NULL,       -- references workspaces.id
  user_id        UUID NOT NULL,       -- references users.id
  role           TEXT,                -- 'owner','admin','member','guest'
  permissions    JSONB,               -- e.g. { "can_create_channels": true }
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1) SELECT: let everyone read memberships (less secure).
CREATE POLICY "Public read of workspace_members"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (true);

-- 2) INSERT: user can insert themselves into any workspace (very open).
CREATE POLICY "Insert membership"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- 3) UPDATE: only the user themself can update the row.
CREATE POLICY "Update your own membership"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- 4) DELETE: only the user themself can remove themselves.
CREATE POLICY "Delete your own membership"
ON public.workspace_members
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-------------------------------------
-- 3) CHANNELS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.channels CASCADE;

CREATE TABLE public.channels (
  id               UUID PRIMARY KEY,
  workspace_id     UUID NOT NULL,                 -- references workspaces.id
  channel_type     TEXT DEFAULT 'text',           -- e.g. 'text','voice','stage'
  slug             TEXT NOT NULL,                 -- unique within workspace
  name             TEXT,
  description      TEXT,
  is_private       BOOLEAN DEFAULT false,
  metadata         JSONB,
  placeholder_1    TEXT,
  placeholder_2    JSONB,
  created_by       UUID NOT NULL,                 -- references users.id
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.channels FORCE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1) SELECT: everyone can see channels (less secure).
CREATE POLICY "Select all channels"
ON public.channels
FOR SELECT
TO authenticated
USING (true);

-- 2) INSERT: let any user create a channel, with created_by = auth.uid().
CREATE POLICY "Insert channel"
ON public.channels
FOR INSERT
TO authenticated
WITH CHECK ( created_by = auth.uid() );

-- 3) UPDATE: only the channel's creator can update.
CREATE POLICY "Update channel if creator"
ON public.channels
FOR UPDATE
TO authenticated
USING ( created_by = auth.uid() )
WITH CHECK ( created_by = auth.uid() );

-- 4) DELETE: only the channel's creator can delete.
CREATE POLICY "Delete channel if creator"
ON public.channels
FOR DELETE
TO authenticated
USING ( created_by = auth.uid() );

-------------------------------------
-- 4) CHANNEL_MEMBERS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.channel_members CASCADE;

CREATE TABLE public.channel_members (
  id             UUID PRIMARY KEY,
  channel_id     UUID NOT NULL,        -- references channels.id
  user_id        UUID NOT NULL,        -- references users.id
  role           TEXT,                 -- 'member','moderator','admin', etc.
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.channel_members FORCE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1) SELECT: let everyone see who is in each channel (less secure).
CREATE POLICY "Select all channel_members"
ON public.channel_members
FOR SELECT
TO authenticated
USING (true);

-- 2) INSERT: user can insert themselves into any channel (very open).
CREATE POLICY "Insert channel membership"
ON public.channel_members
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- 3) UPDATE: only the user themself can update.
CREATE POLICY "Update channel membership if self"
ON public.channel_members
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- 4) DELETE: only the user themself can remove themselves.
CREATE POLICY "Delete channel membership if self"
ON public.channel_members
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-------------------------------------
-- 1) DM_ROOMS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.dm_rooms CASCADE;

CREATE TABLE public.dm_rooms (
  id             UUID PRIMARY KEY,
  room_name      TEXT,                      -- e.g. "Reece + Vader + Yoda"
  is_group       BOOLEAN DEFAULT false,     -- if true, it can have multiple members
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.dm_rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dm_rooms FORCE ROW LEVEL SECURITY;  -- optional

-- RLS Policies for dm_rooms:

-- A) SELECT: Let everyone see all dm_rooms (very open).
CREATE POLICY "Select all dm_rooms"
ON public.dm_rooms
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: Any user can create a new DM room (no real checks).
CREATE POLICY "Insert dm_room"
ON public.dm_rooms
FOR INSERT
TO authenticated
WITH CHECK (true);

-- C) UPDATE: We'll allow anyone to update any dm_room.
CREATE POLICY "Update dm_room open"
ON public.dm_rooms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- D) DELETE: We'll allow anyone to delete any dm_room.
CREATE POLICY "Delete dm_room open"
ON public.dm_rooms
FOR DELETE
TO authenticated
USING (true);

-------------------------------------
-- 2) DM_ROOM_MEMBERS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.dm_room_members CASCADE;

CREATE TABLE public.dm_room_members (
  id             UUID PRIMARY KEY,
  dm_room_id     UUID NOT NULL,      -- references dm_rooms.id
  user_id        UUID NOT NULL,      -- references users.id
  role           TEXT,               -- e.g. "member", "owner"
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.dm_room_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dm_room_members FORCE ROW LEVEL SECURITY;

-- RLS Policies:

-- A) SELECT: Let everyone see which users are in each DM room (again, very open).
CREATE POLICY "Select all dm_room_members"
ON public.dm_room_members
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: A user can insert themselves into a DM room. (No checks on the room).
CREATE POLICY "Insert dm_room_members"
ON public.dm_room_members
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- C) UPDATE: Only the user themselves can update that membership row.
CREATE POLICY "Update dm_room_members if self"
ON public.dm_room_members
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- D) DELETE: Only the user themselves can delete their row.
CREATE POLICY "Delete dm_room_members if self"
ON public.dm_room_members
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-------------------------------------
-- 3) DIRECT_MESSAGES TABLE
-------------------------------------
DROP TABLE IF EXISTS public.direct_messages CASCADE;

CREATE TABLE public.direct_messages (
  id             UUID PRIMARY KEY,
  dm_room_id     UUID NOT NULL,       -- references dm_rooms.id
  sender_id      UUID NOT NULL,       -- references users.id
  parent_id      UUID,                -- for optional threading
  message_text   TEXT,
  attachments    JSONB,
  mentions       JSONB,               -- e.g. ["user_abc", "ai_vader"]
  metadata       JSONB,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now(),
  placeholder_1  TEXT
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.direct_messages FORCE ROW LEVEL SECURITY;

-- RLS Policies:

-- A) SELECT: Typically, we only want DM room members to read. But if we go "less secure," we let everyone see them:
--    If you want at least a membership check, use the commented code. For TOTALLY open, do (true).
/*
CREATE POLICY "Select direct messages if in DM room"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM dm_room_members m
    WHERE m.dm_room_id = direct_messages.dm_room_id
      AND m.user_id = auth.uid()
  )
);
*/
-- For maximum open usage, do this:
CREATE POLICY "Select direct messages open"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: Let any user post messages if they are the sender. 
--    For TOTALLY open, you can do (true), but let's at least require sender_id=auth.uid().
CREATE POLICY "Insert DM if user is sender"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);

-- C) UPDATE: Usually only the sender can update, or no one can. We'll let sender do it:
CREATE POLICY "Update own DM"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING ( sender_id = auth.uid() )
WITH CHECK ( sender_id = auth.uid() );

-- D) DELETE: Let the sender delete:
CREATE POLICY "Delete own DM"
ON public.direct_messages
FOR DELETE
TO authenticated
USING ( sender_id = auth.uid() );

-------------------------------------
-- 1) CHANNEL MESSAGES TABLE
-------------------------------------
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY,
  channel_id      UUID NOT NULL,        -- references channels.id
  user_id         UUID NOT NULL,        -- references users.id (the sender)
  parent_id       UUID,                 -- for threading (NULL if top-level)
  message_text    TEXT,                 -- content
  attachments     JSONB,                -- e.g. [ { "url":"...", "type":"image/png"} ]
  mentions        JSONB,                -- e.g. [ "user123", "aiagent_vader" ]
  metadata        JSONB,                -- ephemeral flags, pinned status, etc.
  placeholder_1   TEXT,
  placeholder_2   JSONB,
  created_at      TIMESTAMP DEFAULT now(),
  updated_at      TIMESTAMP DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;  -- optional

-- RLS Policies:
-- A) SELECT: Typically we only allow channel members. 
--    But "less secure" let's allow everyone to read messages:
CREATE POLICY "Select all channel messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: Usually requires channel membership. 
--    But for minimal friction, let's only require user_id=auth.uid().
CREATE POLICY "Insert message if user is sender"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- C) UPDATE: Usually only the sender can update:
CREATE POLICY "Update own message"
ON public.messages
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- D) DELETE: Also typically only the sender can delete:
CREATE POLICY "Delete own message"
ON public.messages
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-------------------------------------
-- 2) PINNED MESSAGES TABLE
-------------------------------------
DROP TABLE IF EXISTS public.pinned_messages CASCADE;

CREATE TABLE public.pinned_messages (
  id               UUID PRIMARY KEY,
  message_type     TEXT NOT NULL,        -- 'channel' or 'direct'
  message_id       UUID NOT NULL,        -- references messages.id or direct_messages.id
  pinned_by        UUID NOT NULL,        -- references users.id
  pinned_at        TIMESTAMP DEFAULT now(),
  metadata         JSONB,
  placeholder_1    TEXT,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies:

-- A) SELECT: Let everyone see pinned references
CREATE POLICY "Select pinned_messages all"
ON public.pinned_messages
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: The user must set pinned_by = themselves
CREATE POLICY "Insert pinned_messages"
ON public.pinned_messages
FOR INSERT
TO authenticated
WITH CHECK ( pinned_by = auth.uid() );

-- C) UPDATE: Only the original pinner can update
CREATE POLICY "Update pinned_messages if pinned_by self"
ON public.pinned_messages
FOR UPDATE
TO authenticated
USING ( pinned_by = auth.uid() )
WITH CHECK ( pinned_by = auth.uid() );

-- D) DELETE: Only the pinner can delete
CREATE POLICY "Delete pinned_messages if pinned_by self"
ON public.pinned_messages
FOR DELETE
TO authenticated
USING ( pinned_by = auth.uid() );

-------------------------------------
-- 3) MESSAGE REACTIONS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.message_reactions CASCADE;

CREATE TABLE public.message_reactions (
  id               UUID PRIMARY KEY,
  message_type     TEXT,          -- 'channel' or 'direct'
  message_id       UUID NOT NULL, -- references messages.id or direct_messages.id
  user_id          UUID NOT NULL, -- references users.id
  emoji            TEXT,          -- e.g. ':yoda:', '❤️', etc.
  metadata         JSONB,         -- for custom emojis, etc.
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- A) SELECT: Everyone can see reactions
CREATE POLICY "Select all message_reactions"
ON public.message_reactions
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: user_id must match auth.uid():
CREATE POLICY "Insert reaction"
ON public.message_reactions
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- C) UPDATE: typically we don't update reactions, but let's allow the user to do so
CREATE POLICY "Update own reaction"
ON public.message_reactions
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- D) DELETE: only the user who reacted can remove it
CREATE POLICY "Delete own reaction"
ON public.message_reactions
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-------------------------------------
-- 4) THREAD SUMMARIES TABLE (optional)
-------------------------------------
DROP TABLE IF EXISTS public.thread_summaries CASCADE;

CREATE TABLE public.thread_summaries (
  id                UUID PRIMARY KEY,
  channel_id        UUID,                 -- references channels.id
  parent_message_id UUID,                 -- references messages.id (the top-level thread)
  summary_text      TEXT NOT NULL,
  pinned            BOOLEAN DEFAULT false,
  metadata          JSONB,
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

ALTER TABLE public.thread_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- A) SELECT: let everyone see them
CREATE POLICY "Select thread_summaries"
ON public.thread_summaries
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: let any user create a summary
CREATE POLICY "Insert thread_summaries"
ON public.thread_summaries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- C) UPDATE: let anyone update
CREATE POLICY "Update thread_summaries open"
ON public.thread_summaries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- D) DELETE: let anyone delete
CREATE POLICY "Delete thread_summaries open"
ON public.thread_summaries
FOR DELETE
TO authenticated
USING (true);

-------------------------------------
-- 1) NOTIFICATIONS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
  id                UUID PRIMARY KEY,
  user_id           UUID NOT NULL,            -- The user who receives the notification
  notification_type TEXT,                     -- e.g. 'mention', 'dm', 'system', 'rank_up'
  title             TEXT,
  body              TEXT,
  link              TEXT,                     -- e.g. "/channels/abc?message=123"
  is_read           BOOLEAN DEFAULT false,
  metadata          JSONB,
  placeholder_1     TEXT,
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

-- RLS POLICIES:

-- A) SELECT: typically you'd only let the recipient see. We'll do that for at least partial privacy:
CREATE POLICY "Select notifications if user is recipient"
ON public.notifications
FOR SELECT
TO authenticated
USING ( user_id = auth.uid() );

-- B) INSERT: usually system logic or triggers do this, but let's allow any user if they set user_id = their own (very open):
CREATE POLICY "Insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- C) UPDATE: only the user can update (like marking it read):
CREATE POLICY "Update notifications if user is recipient"
ON public.notifications
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- D) DELETE: only the recipient can delete
CREATE POLICY "Delete notifications if user is recipient"
ON public.notifications
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );

-------------------------------------
-- 2) MODERATION_ACTIONS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.moderation_actions CASCADE;

CREATE TABLE public.moderation_actions (
  id               UUID PRIMARY KEY,
  workspace_id     UUID,              -- references workspaces.id, can be NULL if global
  channel_id       UUID,              -- references channels.id, can be NULL if channel-specific
  acted_upon_id    UUID NOT NULL,     -- user who is banned/kicked
  acted_by_id      UUID NOT NULL,     -- user who performed the action
  action_type      TEXT NOT NULL,     -- 'ban', 'kick', 'mute', 'warn'
  reason           TEXT,
  expires_at       TIMESTAMP,         -- if temporary ban
  metadata         JSONB,
  created_at       TIMESTAMP DEFAULT now()
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- A) SELECT: let everyone see the logs, for minimal friction
CREATE POLICY "Select all moderation_actions"
ON public.moderation_actions
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: let any user create a moderation action (extremely open)
CREATE POLICY "Insert moderation actions"
ON public.moderation_actions
FOR INSERT
TO authenticated
WITH CHECK ( acted_by_id = auth.uid() );

-- C) UPDATE: we can let the user who performed it or who was targeted? We'll keep it open
CREATE POLICY "Update moderation actions open"
ON public.moderation_actions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- D) DELETE: also open
CREATE POLICY "Delete moderation actions open"
ON public.moderation_actions
FOR DELETE
TO authenticated
USING (true);

-------------------------------------
-- 3) CALL_SESSIONS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.call_sessions CASCADE;

CREATE TABLE public.call_sessions (
  id             UUID PRIMARY KEY,
  call_type      TEXT DEFAULT 'user_to_user',   -- 'user_to_user','user_to_ai','group_call'
  channel_id     UUID,                          -- if it's a "voice channel" type
  dm_room_id     UUID,                          -- if it's a direct message call
  initiator_id   UUID NOT NULL,                 -- references users.id
  participants   JSONB,                         -- e.g. ["user1","user2","ai_vader"]
  started_at     TIMESTAMP DEFAULT now(),
  ended_at       TIMESTAMP,
  metadata       JSONB,                         -- store STT transcripts, TTS config, etc.
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES:
-- A) SELECT: let everyone see call sessions (very open)
CREATE POLICY "Select call_sessions"
ON public.call_sessions
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: user_id must match initiator
CREATE POLICY "Insert call_sessions"
ON public.call_sessions
FOR INSERT
TO authenticated
WITH CHECK ( initiator_id = auth.uid() );

-- C) UPDATE & DELETE: let's allow all
CREATE POLICY "Update call_sessions open"
ON public.call_sessions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete call_sessions open"
ON public.call_sessions
FOR DELETE
TO authenticated
USING (true);


-------------------------------------
-- 4) CUSTOM_EMOJIS TABLE
-------------------------------------
DROP TABLE IF EXISTS public.custom_emojis CASCADE;

CREATE TABLE public.custom_emojis (
  id            UUID PRIMARY KEY,
  emoji_name    TEXT UNIQUE NOT NULL,  -- e.g. 'yoda', 'vaderhelmet', etc.
  image_url     TEXT NOT NULL,         -- link to PNG in storage bucket
  is_global     BOOLEAN DEFAULT true,  -- can all workspaces or channels use it?
  metadata      JSONB,
  placeholder_1 TEXT,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);

ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;

-- RLS:
-- A) SELECT: let everyone see custom emojis
CREATE POLICY "Select all custom_emojis"
ON public.custom_emojis
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT: let any user add a new emoji
CREATE POLICY "Insert custom_emojis"
ON public.custom_emojis
FOR INSERT
TO authenticated
WITH CHECK (true);

-- C) UPDATE: let any user update any emoji
CREATE POLICY "Update custom_emojis open"
ON public.custom_emojis
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- D) DELETE: let any user delete
CREATE POLICY "Delete custom_emojis open"
ON public.custom_emojis
FOR DELETE
TO authenticated
USING (true);


-------------------------------------
-- 5) SLASH_COMMANDS TABLE (optional)
-------------------------------------
DROP TABLE IF EXISTS public.slash_commands CASCADE;

CREATE TABLE public.slash_commands (
  id            UUID PRIMARY KEY,
  command       TEXT NOT NULL,        -- e.g. "poll","giphy"
  description   TEXT,
  permissions   JSONB,                -- e.g. { "admin_only": true }
  metadata      JSONB,
  placeholder_1 TEXT,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);

ALTER TABLE public.slash_commands ENABLE ROW LEVEL SECURITY;

-- RLS:
-- A) SELECT: let everyone see slash commands
CREATE POLICY "Select slash_commands"
ON public.slash_commands
FOR SELECT
TO authenticated
USING (true);

-- B) INSERT/UPDATE/DELETE: wide open
CREATE POLICY "Manage slash_commands"
ON public.slash_commands
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
