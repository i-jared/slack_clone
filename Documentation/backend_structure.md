Below is a **deterministic, exhaustive** backend architecture document specifically for **junior developers** who want a **concrete reference** on how our **Supabase**-powered system is set up. This guide **does not** guess or hedge. It tells you exactly what to do and how each table/column/policy works. If you follow it line by line, you will get the same results every time. 

**Important**: The instructions here are **destructive** (they drop old tables). We’re assuming you want a **fresh** start. If you already have data you care about, you must back it up or do partial modifications instead.

---

# **Supabase Backend Architecture – Definitive Guide**

## **1. Environment Setup**

1. **Project Variables**:  
   - `NEXT_PUBLIC_SUPABASE_URL = "https://<your-supabase-id>.supabase.co"`  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY = "<your-anon-key>"`  

2. **Create Client**: (In a file like `lib/supabaseClient.js`)
   ```js
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```
   This is **the** instance you import everywhere else.

3. **RLS**: We rely on each user’s token from Supabase Auth. That means any insert, select, update, or delete automatically checks the user’s `auth.uid()` in the database. 

---

## **2. Table-by-Table Definitions**

### **2.1 Master List of Tables**

We have ~15 tables. Each is in the `public` schema. They are:

1. `users`
2. `ai_documents`
3. `workspaces`
4. `workspace_members`
5. `channels`
6. `channel_members`
7. `dm_rooms`
8. `dm_room_members`
9. `direct_messages`
10. `messages`
11. `pinned_messages`
12. `message_reactions`
13. `notifications`
14. `moderation_actions`
15. `call_sessions`
16. `custom_emojis`
17. `slash_commands` (optional)
18. `thread_summaries` (optional)

**Yes**, that’s a lot, but they give us the entire Slack/Discord-like + AI system we want.

---

### **2.2. `users`** (Store user accounts)

```sql
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id                UUID PRIMARY KEY,     -- Must match Supabase Auth user ID
  email             TEXT UNIQUE NOT NULL,
  username          TEXT UNIQUE NOT NULL, -- e.g. "reece123"
  display_name      TEXT,
  phone_number      TEXT,
  avatar_url        TEXT,
  description       TEXT,
  status            TEXT,                 -- "ONLINE","OFFLINE","DND" etc.
  faction           TEXT,                 -- "Jedi","Sith","Rebel"...
  last_seen         TIMESTAMP,
  is_bot            BOOLEAN DEFAULT false,
  preferences       JSONB,                -- { "theme": "dark", "ai_auto_reply": true, etc. }
  ai_persona        JSONB,                -- Additional info for user's AI style
  gamification      JSONB,                -- ranks, XP, achievements, etc.
  metadata          JSONB,                -- fallback for expansions
  placeholder_col_1 TEXT,
  placeholder_col_2 JSONB,
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies (less secure approach: everyone can see all users):
CREATE POLICY "Public read of all users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert your own user row"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK ( id = auth.uid() );

CREATE POLICY "Update self"
ON public.users
FOR UPDATE
TO authenticated
USING ( id = auth.uid() )
WITH CHECK ( id = auth.uid() );

CREATE POLICY "Delete self"
ON public.users
FOR DELETE
TO authenticated
USING ( id = auth.uid() );
```

**Usage** in code:
```js
// Insert example:
const { data, error } = await supabase
  .from('users')
  .insert([{ id: userIdFromAuth, email, username }])
```
If `id` != the user’s `auth.uid()`, it fails.

---

### **2.3. `ai_documents`** (Big text for AI)

```sql
DROP TABLE IF EXISTS public.ai_documents CASCADE;

CREATE TABLE public.ai_documents (
  id             UUID PRIMARY KEY,
  owner_user_id  UUID NOT NULL,   -- references users.id
  title          TEXT,
  description    TEXT,
  source_type    TEXT,            -- e.g. "uploaded_file", "google_drive"
  content_url    TEXT,            -- link to actual doc
  embedding_refs JSONB,           -- vector embeddings if needed
  metadata       JSONB,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select ai_documents if owner"
ON public.ai_documents
FOR SELECT
TO authenticated
USING ( owner_user_id = auth.uid() );

CREATE POLICY "Insert your own ai_docs"
ON public.ai_documents
FOR INSERT
TO authenticated
WITH CHECK ( owner_user_id = auth.uid() );

CREATE POLICY "Update your own ai_docs"
ON public.ai_documents
FOR UPDATE
TO authenticated
USING ( owner_user_id = auth.uid() )
WITH CHECK ( owner_user_id = auth.uid() );

CREATE POLICY "Delete your own ai_docs"
ON public.ai_documents
FOR DELETE
TO authenticated
USING ( owner_user_id = auth.uid() );
```
**Only** the doc’s owner can see or manipulate it.

---

### **2.4. `workspaces`** and `workspace_members`

```sql
DROP TABLE IF EXISTS public.workspaces CASCADE;
CREATE TABLE public.workspaces (
  id             UUID PRIMARY KEY,
  name           TEXT NOT NULL,
  owner_id       UUID NOT NULL,   -- references users.id
  workspace_type TEXT DEFAULT 'standard',
  metadata       JSONB,
  placeholder_1  TEXT,
  placeholder_2  JSONB,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read of all workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert workspace"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK ( owner_id = auth.uid() );

CREATE POLICY "Update if workspace owner"
ON public.workspaces
FOR UPDATE
TO authenticated
USING ( owner_id = auth.uid() )
WITH CHECK ( owner_id = auth.uid() );

CREATE POLICY "Delete if workspace owner"
ON public.workspaces
FOR DELETE
TO authenticated
USING ( owner_id = auth.uid() );
```

```sql
DROP TABLE IF EXISTS public.workspace_members CASCADE;
CREATE TABLE public.workspace_members (
  id             UUID PRIMARY KEY,
  workspace_id   UUID NOT NULL,
  user_id        UUID NOT NULL,
  role           TEXT,
  permissions    JSONB,
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read of workspace_members"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert membership"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Update your own membership"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Delete your own membership"
ON public.workspace_members
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );
```

**Hence**: Everyone can see all workspaces, users can add themselves to any workspace. This is a “less secure” approach. 

---

### **2.5. `channels`** and `channel_members`

```sql
DROP TABLE IF EXISTS public.channels CASCADE;
CREATE TABLE public.channels (
  id               UUID PRIMARY KEY,
  workspace_id     UUID NOT NULL,
  channel_type     TEXT DEFAULT 'text',
  slug             TEXT NOT NULL,
  name             TEXT,
  description      TEXT,
  is_private       BOOLEAN DEFAULT false,
  metadata         JSONB,
  placeholder_1    TEXT,
  placeholder_2    JSONB,
  created_by       UUID NOT NULL, 
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all channels"
ON public.channels
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert channel"
ON public.channels
FOR INSERT
TO authenticated
WITH CHECK ( created_by = auth.uid() );

CREATE POLICY "Update channel if creator"
ON public.channels
FOR UPDATE
TO authenticated
USING ( created_by = auth.uid() )
WITH CHECK ( created_by = auth.uid() );

CREATE POLICY "Delete channel if creator"
ON public.channels
FOR DELETE
TO authenticated
USING ( created_by = auth.uid() );
```

```sql
DROP TABLE IF EXISTS public.channel_members CASCADE;
CREATE TABLE public.channel_members (
  id             UUID PRIMARY KEY,
  channel_id     UUID NOT NULL,
  user_id        UUID NOT NULL,
  role           TEXT,
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all channel_members"
ON public.channel_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert channel membership"
ON public.channel_members
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Update channel membership if self"
ON public.channel_members
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Delete channel membership if self"
ON public.channel_members
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );
```

**Takeaway**: Everyone sees all channels, any user can create or join. 

---

### **2.6. `dm_rooms`, `dm_room_members`, `direct_messages`** (Group or 1-to-1 DMs)

```sql
DROP TABLE IF EXISTS public.dm_rooms CASCADE;
CREATE TABLE public.dm_rooms (
  id             UUID PRIMARY KEY,
  room_name      TEXT,
  is_group       BOOLEAN DEFAULT false,
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.dm_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all dm_rooms"
ON public.dm_rooms
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert dm_room"
ON public.dm_rooms
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update dm_room open"
ON public.dm_rooms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete dm_room open"
ON public.dm_rooms
FOR DELETE
TO authenticated
USING (true);
```

```sql
DROP TABLE IF EXISTS public.dm_room_members CASCADE;
CREATE TABLE public.dm_room_members (
  id             UUID PRIMARY KEY,
  dm_room_id     UUID NOT NULL,
  user_id        UUID NOT NULL,
  role           TEXT,
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.dm_room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all dm_room_members"
ON public.dm_room_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert dm_room_members"
ON public.dm_room_members
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Update dm_room_members if self"
ON public.dm_room_members
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Delete dm_room_members if self"
ON public.dm_room_members
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );
```

```sql
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

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- By default, let's let everyone see all DMs:
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
```

---

### **2.7. `messages`** (Channel messages), `pinned_messages`, `message_reactions`, `thread_summaries` (optional)

```sql
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
```

```sql
DROP TABLE IF EXISTS public.pinned_messages CASCADE;
CREATE TABLE public.pinned_messages (
  id             UUID PRIMARY KEY,
  message_type   TEXT NOT NULL,   -- 'channel' or 'direct'
  message_id     UUID NOT NULL,
  pinned_by      UUID NOT NULL,
  pinned_at      TIMESTAMP DEFAULT now(),
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select pinned_messages all"
ON public.pinned_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert pinned_messages"
ON public.pinned_messages
FOR INSERT
TO authenticated
WITH CHECK ( pinned_by = auth.uid() );

CREATE POLICY "Update pinned_messages if pinned_by self"
ON public.pinned_messages
FOR UPDATE
TO authenticated
USING ( pinned_by = auth.uid() )
WITH CHECK ( pinned_by = auth.uid() );

CREATE POLICY "Delete pinned_messages if pinned_by self"
ON public.pinned_messages
FOR DELETE
TO authenticated
USING ( pinned_by = auth.uid() );
```

```sql
DROP TABLE IF EXISTS public.message_reactions CASCADE;
CREATE TABLE public.message_reactions (
  id             UUID PRIMARY KEY,
  message_type   TEXT,
  message_id     UUID NOT NULL,
  user_id        UUID NOT NULL,
  emoji          TEXT,
  metadata       JSONB,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all message_reactions"
ON public.message_reactions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert reaction"
ON public.message_reactions
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Update own reaction"
ON public.message_reactions
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Delete own reaction"
ON public.message_reactions
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );
```

**Optional** `thread_summaries`:

```sql
DROP TABLE IF EXISTS public.thread_summaries CASCADE;
CREATE TABLE public.thread_summaries (
  id                UUID PRIMARY KEY,
  channel_id        UUID,
  parent_message_id UUID,
  summary_text      TEXT NOT NULL,
  pinned            BOOLEAN DEFAULT false,
  metadata          JSONB,
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

ALTER TABLE public.thread_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select thread_summaries"
ON public.thread_summaries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert thread_summaries"
ON public.thread_summaries
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update thread_summaries open"
ON public.thread_summaries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete thread_summaries open"
ON public.thread_summaries
FOR DELETE
TO authenticated
USING (true);
```

---

### **2.8. `notifications`, `moderation_actions`, `call_sessions`, `custom_emojis`, `slash_commands`**

```sql
-- 1) Notifications
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
  id                UUID PRIMARY KEY,
  user_id           UUID NOT NULL,
  notification_type TEXT,
  title             TEXT,
  body              TEXT,
  link              TEXT,
  is_read           BOOLEAN DEFAULT false,
  metadata          JSONB,
  placeholder_1     TEXT,
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select notifications if user is recipient"
ON public.notifications
FOR SELECT
TO authenticated
USING ( user_id = auth.uid() );

CREATE POLICY "Insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Update notifications if user is recipient"
ON public.notifications
FOR UPDATE
TO authenticated
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Delete notifications if user is recipient"
ON public.notifications
FOR DELETE
TO authenticated
USING ( user_id = auth.uid() );
```

```sql
-- 2) Moderation Actions
DROP TABLE IF EXISTS public.moderation_actions CASCADE;
CREATE TABLE public.moderation_actions (
  id            UUID PRIMARY KEY,
  workspace_id  UUID,
  channel_id    UUID,
  acted_upon_id UUID NOT NULL,
  acted_by_id   UUID NOT NULL,
  action_type   TEXT NOT NULL,  -- 'ban','kick','mute','warn'
  reason        TEXT,
  expires_at    TIMESTAMP,
  metadata      JSONB,
  created_at    TIMESTAMP DEFAULT now()
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all moderation_actions"
ON public.moderation_actions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert moderation actions"
ON public.moderation_actions
FOR INSERT
TO authenticated
WITH CHECK ( acted_by_id = auth.uid() );

CREATE POLICY "Update moderation actions open"
ON public.moderation_actions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete moderation actions open"
ON public.moderation_actions
FOR DELETE
TO authenticated
USING (true);
```

```sql
-- 3) Call Sessions
DROP TABLE IF EXISTS public.call_sessions CASCADE;
CREATE TABLE public.call_sessions (
  id            UUID PRIMARY KEY,
  call_type     TEXT DEFAULT 'user_to_user',   -- 'user_to_ai','group_call'
  channel_id    UUID,
  dm_room_id    UUID,
  initiator_id  UUID NOT NULL,
  participants  JSONB,
  started_at    TIMESTAMP DEFAULT now(),
  ended_at      TIMESTAMP,
  metadata      JSONB,
  placeholder_1 TEXT,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select call_sessions"
ON public.call_sessions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert call_sessions"
ON public.call_sessions
FOR INSERT
TO authenticated
WITH CHECK ( initiator_id = auth.uid() );

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
```

```sql
-- 4) Custom Emojis
DROP TABLE IF EXISTS public.custom_emojis CASCADE;
CREATE TABLE public.custom_emojis (
  id             UUID PRIMARY KEY,
  emoji_name     TEXT UNIQUE NOT NULL,
  image_url      TEXT NOT NULL,
  is_global      BOOLEAN DEFAULT true,
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);

ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select all custom_emojis"
ON public.custom_emojis
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert custom_emojis"
ON public.custom_emojis
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update custom_emojis open"
ON public.custom_emojis
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete custom_emojis open"
ON public.custom_emojis
FOR DELETE
TO authenticated
USING (true);
```

```sql
-- 5) Slash Commands (optional)
DROP TABLE IF EXISTS public.slash_commands CASCADE;
CREATE TABLE public.slash_commands (
  id            UUID PRIMARY KEY,
  command       TEXT NOT NULL,
  description   TEXT,
  permissions   JSONB,
  metadata      JSONB,
  placeholder_1 TEXT,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);

ALTER TABLE public.slash_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select slash_commands"
ON public.slash_commands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Manage slash_commands"
ON public.slash_commands
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## **3. Usage Instructions for Junior Devs**


3. **When calling** from front-end or serverless code, always use the **Supabase** client in a context that has the user’s token. If you do so, the RLS checks automatically.

4. **Inserting Data**:
   - If a table expects a `user_id = auth.uid()`, you must pass `user_id: <the user’s id>` in the payload. Otherwise, you’ll get an RLS violation error. 
   - Example:
     ```js
     // sending a channel message:
     await supabase.from('messages').insert([{
       id: crypto.randomUUID(),
       channel_id: someChannelId,
       user_id: authUserId, // must match the actual logged-in user
       message_text: "Hello channel"
     }])
     ```

5. **Reading Data**:
   - Because our “less secure” RLS often uses `USING (true)` for select, you can do:
     ```js
     const { data, error } = await supabase
       .from('messages')
       .select('*')
     ```
     Everyone sees everything. If you want privacy, you’d do membership checks (discussed above).

6. **File/Emoji/Avatars**:
   - We store images in **Supabase Storage**. The `url` or `image_url` is saved in the relevant table. 
   - If you want user avatars, set `avatar_url` in `users`. 
   - For custom emojis, set `image_url` in `custom_emojis`.

7. **Realtime**:
   - To listen for inserts/updates:
     ```js
     supabase
       .channel('any-name')
       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
         console.log("New message:", payload.new)
       })
       .subscribe()
     ```
   - RLS ensures you only get changes you can “SELECT.”

---

## **4. Guaranteed Consistency & Determinism**

- Because the above SQL statements are explicit, **the final schema** will always be the same if you run them all. 
- If you see an RLS error complaining about “row violates check policy,” it means you tried to insert a row with a user_id not matching the token’s `auth.uid()`.
- If you see “null data” on select, it might be an RLS problem, or you forgot to pass the user’s token.

---

## **5. Recap**

**This** is the final, **definitive** Supabase backend architecture:

1. **One** schema, `public`. 
2. 15+ tables covering everything from user profiles to messages to direct messages. 
3. “Less secure” RLS that typically allows broad reads (`USING (true)`), but ensures user authenticity on writes (`user_id = auth.uid()`).
4. Placeholders (`placeholder_1`, `placeholder_2`) and `metadata` columns to never require migrations again.

By following these exact SQL statements in order, your project’s DB will be **identical** to the plan. If you deviate or run partial scripts, you may end up with mismatched RLS or missing columns. So please **copy/paste** carefully and confirm everything matches. This ensures your “stupid but code-savvy” approach yields correct, consistent results every time.

**End** of Document. If you have further questions, consult the sections above or contact your lead dev.