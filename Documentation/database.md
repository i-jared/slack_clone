## Schema Overview

### Schema: `public`

#### Tables

1. **ai_documents**
   - `id` (uuid)
   - `owner_user_id` (uuid)
   - `title` (text)
   - `text` (text)
   - `description` (text)
   - `source_type` (text)
   - `content_url` (text)
   - `embedding_refs` (jsonb)
   - `metadata` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **call_sessions**
   - `id` (uuid)
   - `call_type` (text)
   - `channel_id` (uuid)
   - `dm_room_id` (uuid)
   - `initiator_id` (uuid)
   - `participants` (jsonb)
   - `started_at` (timestamp)
   - `ended_at` (timestamp)
   - `metadata` (jsonb)
   - `placeholder_1` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **channel_members**
   - `id` (uuid)
   - `channel_id` (uuid)
   - `user_id` (uuid)
   - `role` (text)
   - `metadata` (jsonb)
   - `placeholder_1` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

4. **channels**
   - `id` (uuid)
   - `workspace_id` (uuid)
   - `channel_type` (text)
   - `slug` (text)
   - `name` (text)
   - `description` (text)
   - `is_private` (bool)
   - `metadata` (jsonb)
   - `placeholder_1` (text)
   - `placeholder_2` (jsonb)
   - `created_by` (uuid)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

5. **custom_emojis**
   - `id` (uuid)
   - `emoji_name` (text)
   - `image_url` (text)
   - `is_global` (bool)
   - `metadata` (jsonb)
   - `placeholder_1` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

6. **direct_messages**
   - `id` (uuid)
   - `dm_room_id` (uuid)
   - `sender_id` (uuid)
   - `parent_id` (uuid)
   - `message_text` (text)
   - `attachments` (jsonb)
   - `mentions` (jsonb)
   - `metadata` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `placeholder_1` (text)

7. **dm_room_members**
   - `id` (uuid)
   - `dm_room_id` (uuid)
   - `user_id` (uuid)
   - `role` (text)
   - `metadata` (jsonb)
   - `placeholder_1` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

8. **dm_rooms**
   - `id` (uuid)
   - `room_name` (text)
   - `is_group` (bool)
   - `metadata` (jsonb)
   - `placeholder_1` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

9. **message_reactions**
   - `id` (uuid)
   - `message_type` (text)
   - `message_id` (uuid)
   - `user_id` (uuid)
   - `emoji` (text)
   - `metadata` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `placeholder_1` (text)

10. **messages**
    - `id` (uuid)
    - `channel_id` (uuid)
    - `user_id` (uuid)
    - `parent_id` (uuid)
    - `message_text` (text)
    - `attachments` (jsonb)
    - `mentions` (jsonb)
    - `metadata` (jsonb)
    - `placeholder_1` (text)
    - `placeholder_2` (jsonb)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

11. **moderation_actions**
    - `id` (uuid)
    - `workspace_id` (uuid)
    - `channel_id` (uuid)
    - `acted_upon_id` (uuid)
    - `acted_by_id` (uuid)
    - `action_type` (text)
    - `reason` (text)
    - `expires_at` (timestamp)
    - `metadata` (jsonb)
    - `created_at` (timestamp)

12. **notifications**
    - `id` (uuid)
    - `user_id` (uuid)
    - `notification_type` (text)
    - `title` (text)
    - `body` (text)
    - `link` (text)
    - `is_read` (bool)
    - `metadata` (jsonb)
    - `placeholder_1` (text)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

13. **pinned_messages**
    - `id` (uuid)
    - `message_type` (text)
    - `message_id` (uuid)
    - `pinned_by` (uuid)
    - `pinned_at` (timestamp)
    - `metadata` (jsonb)
    - `placeholder_1` (text)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

14. **role_permissions**
    - `id` (int8)
    - `role` (app_role)
    - `permission` (app_permission)

15. **slash_commands**
    - `id` (uuid)
    - `command` (text)
    - `description` (text)
    - `permissions` (jsonb)
    - `metadata` (jsonb)
    - `placeholder_1` (text)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

16. **thread_summaries**
    - `id` (uuid)
    - `channel_id` (uuid)
    - `parent_message_id` (uuid)
    - `summary_text` (text)
    - `pinned` (bool)
    - `metadata` (jsonb)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

17. **user_roles**
    - `id` (int8)
    - `user_id` (uuid)
    - `role` (app_role)

18. **users**
    - `id` (uuid)
    - `email` (text)
    - `username` (text)
    - `display_name` (text)
    - `phone_number` (text)
    - `avatar_url` (text)
    - `description` (text)
    - `status` (text)
    - `faction` (text)
    - `last_seen` (timestamp)
    - `is_bot` (bool)
    - `preferences` (jsonb)
    - `ai_persona` (jsonb)
    - `gamification` (jsonb)
    - `metadata` (jsonb)
    - `placeholder_col_1` (text)
    - `placeholder_col_2` (jsonb)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

19. **workspace_members**
    - `id` (uuid)
    - `workspace_id` (uuid)
    - `user_id` (uuid)
    - `role` (text)
    - `permissions` (jsonb)
    - `metadata` (jsonb)
    - `placeholder_1` (text)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

20. **workspaces**
    - `id` (uuid)
    - `name` (text)
    - `owner_id` (uuid)
    - `workspace_type` (text)
    - `metadata` (jsonb)
    - `placeholder_1` (text)
    - `placeholder_2` (jsonb)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

# Supabase Policies

## Schema: `public`

### Table: `ai_documents`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete your own ai_docs*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert your own ai_docs*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select ai_documents if owner*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update your own ai_docs*
    - **Applied to:** authenticated role

---

### Table: `call_sessions`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete call_sessions open*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert call_sessions*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select call_sessions*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update call_sessions open*
    - **Applied to:** authenticated role

---

### Table: `channel_members`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete channel membership if self*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert channel membership*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all channel_members*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update channel membership if self*
    - **Applied to:** authenticated role

---

### Table: `channels`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete channel if creator*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert channel*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all channels*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update channel if creator*
    - **Applied to:** authenticated role

---

### Table: `custom_emojis`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete custom_emojis open*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert custom_emojis*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all custom_emojis*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update custom_emojis open*
    - **Applied to:** authenticated role

---

### Table: `direct_messages`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete own DM*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert DM if user is sender*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select direct messages open*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update own DM*
    - **Applied to:** authenticated role

---

### Table: `dm_room_members`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete dm_room_members if self*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert dm_room_members*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all dm_room_members*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update dm_room_members if self*
    - **Applied to:** authenticated role

---

### Table: `dm_rooms`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete dm_room open*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert dm_room*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all dm_rooms*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update dm_room open*
    - **Applied to:** authenticated role

---

### Table: `message_reactions`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete own reaction*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert reaction*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all message_reactions*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update own reaction*
    - **Applied to:** authenticated role

---

### Table: `messages`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete own message*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert message if user is sender*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all channel messages*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update own message*
    - **Applied to:** authenticated role

---

### Table: `moderation_actions`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete moderation actions open*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert moderation actions*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select all moderation_actions*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update moderation actions open*
    - **Applied to:** authenticated role

---

### Table: `notifications`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete notifications if user is recipient*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert notifications*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select notifications if user is recipient*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update notifications if user is recipient*
    - **Applied to:** authenticated role

---

### Table: `pinned_messages`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete pinned_messages if pinned_by self*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert pinned_messages*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select pinned_messages all*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update pinned_messages if pinned_by self*
    - **Applied to:** authenticated role

---

### Table: `role_permissions`

- **Disable RLS**
- **Create Policy**
  - *No policies created yet*

---

### Table: `slash_commands`

- **Disable RLS**
- **Create Policy**
  - **ALL**
    - *Manage slash_commands*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select slash_commands*
    - **Applied to:** authenticated role

---

### Table: `thread_summaries`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete thread_summaries open*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert thread_summaries*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Select thread_summaries*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update thread_summaries open*
    - **Applied to:** authenticated role

---

### Table: `user_roles`

- **Disable RLS**
- **Create Policy**
  - **SELECT**
    - *Allow individual read access*
    - **Applied to:** public role

---

### Table: `users`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete self*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert your own user row*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Public read of all users*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update self*
    - **Applied to:** authenticated role

---

### Table: `workspace_members`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete your own membership*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert membership*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Public read of workspace_members*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update your own membership*
    - **Applied to:** authenticated role

---

### Table: `workspaces`

- **Disable RLS**
- **Create Policy**
  - **DELETE**
    - *Delete if workspace owner*
    - **Applied to:** authenticated role
  - **INSERT**
    - *Insert workspace*
    - **Applied to:** authenticated role
  - **SELECT**
    - *Public read of all workspaces*
    - **Applied to:** authenticated role
  - **UPDATE**
    - *Update if workspace owner*
    - **Applied to:** authenticated role

---

*Last Updated: January 11, 2025*

Below is an **all-in-one** reference for creating **every** table (and placeholder columns) we’ve discussed, **plus** an example command for creating a Supabase Storage bucket for our Star Wars emojis. This ensures the schema (and at least one bucket) are fully set up. If you run these in your Supabase SQL editor (or via psql connected to your Postgres instance), you’ll have **all** the structures we’ve outlined.

> **Note**: Adjust table references (especially for foreign keys) if you use a different schema than `public`. The commands below assume everything is in the default `public` schema.

---

## **1. (Optional) Enable `uuid-ossp` Extension**

If you want Postgres to auto-generate UUIDs with `uuid_generate_v4()`, enable the extension first:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Alternatively, if you generate UUIDs on the application side, you can omit this.

---

## **2. `users` Table**

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT UNIQUE NOT NULL,
  username            TEXT UNIQUE NOT NULL,
  display_name        TEXT,
  phone_number        TEXT,
  avatar_url          TEXT,
  description         TEXT,
  status              TEXT,           -- e.g. ONLINE, OFFLINE, DND
  faction             TEXT,           -- e.g. Jedi, Sith, etc.
  last_seen           TIMESTAMP,
  preferences         JSONB,          -- user-level preferences
  ai_persona          JSONB,          -- store personal AI config
  gamification        JSONB,          -- xp, badges, ranks
  metadata            JSONB,          -- fallback JSON
  placeholder_col_1   TEXT,           -- spare textual column
  placeholder_col_2   JSONB,          -- spare JSON column
  created_at          TIMESTAMP DEFAULT now(),
  updated_at          TIMESTAMP DEFAULT now()
);
```

> Add a column `is_bot BOOLEAN DEFAULT FALSE` here if you plan to unify AI/bot accounts in this table.

---

## **3. `workspaces` and `workspace_members`**

```sql
CREATE TABLE IF NOT EXISTS public.workspaces (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                   TEXT NOT NULL,
  owner_id               UUID NOT NULL REFERENCES public.users (id),
  workspace_type         TEXT,            -- 'public', 'private', etc.
  metadata               JSONB,
  placeholder_column_1   TEXT,
  placeholder_column_2   JSONB,
  created_at             TIMESTAMP DEFAULT now(),
  updated_at             TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id         UUID NOT NULL REFERENCES public.workspaces (id),
  user_id              UUID NOT NULL REFERENCES public.users (id),
  role                 TEXT,             -- 'owner', 'admin', 'member'
  permissions          JSONB,
  metadata             JSONB,
  placeholder_column_1 TEXT,
  created_at           TIMESTAMP DEFAULT now(),
  updated_at           TIMESTAMP DEFAULT now()
);
```

---

## **4. `channels` and `channel_members`**

```sql
CREATE TABLE IF NOT EXISTS public.channels (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id           UUID NOT NULL REFERENCES public.workspaces (id),
  slug                   TEXT NOT NULL,
  name                   TEXT,
  description            TEXT,
  is_private             BOOLEAN DEFAULT false,
  metadata               JSONB,
  created_by             UUID NOT NULL REFERENCES public.users (id),
  placeholder_column_1   TEXT,
  placeholder_column_2   JSONB,
  created_at             TIMESTAMP DEFAULT now(),
  updated_at             TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.channel_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id    UUID NOT NULL REFERENCES public.channels (id),
  user_id       UUID NOT NULL REFERENCES public.users (id),
  role          TEXT,      -- 'member', 'moderator', 'admin'
  metadata      JSONB,
  placeholder_1 TEXT,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);
```

---

## **5. `messages` (Channel Messages)**

```sql
CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id       UUID NOT NULL REFERENCES public.channels (id),
  user_id          UUID NOT NULL REFERENCES public.users (id),  -- sender
  parent_id        UUID,    -- for threaded replies (references messages.id if needed)
  message_text     TEXT,
  attachments      JSONB,
  mentions         JSONB,   -- e.g. ["user123", "ai_vader"]
  metadata         JSONB,   -- ephemeral flags, pinned, summary, etc.
  placeholder_1    TEXT,
  placeholder_2    JSONB,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);
```

---

## **6. Direct Messages (Two Approaches)**

### **6.A Simple Approach: `direct_messages`**

```sql
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id       UUID NOT NULL REFERENCES public.users (id),
  recipient_id    UUID NOT NULL REFERENCES public.users (id),
  parent_id       UUID,          -- for threading DMs if desired
  message_text    TEXT,
  attachments     JSONB,
  mentions        JSONB,
  metadata        JSONB,
  placeholder_1   TEXT,
  created_at      TIMESTAMP DEFAULT now(),
  updated_at      TIMESTAMP DEFAULT now()
);
```

### **6.B Group DMs Approach (Optional)**

If you want group DMs, do:

- `dm_rooms`  
- `dm_room_members`  
- `direct_messages (with dm_room_id)`

*(You can omit the simpler approach in that case.)*

```sql
-- Example group DM structure:
CREATE TABLE IF NOT EXISTS public.dm_rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_name   TEXT,
  is_group    BOOLEAN DEFAULT false,
  metadata    JSONB,
  placeholder_1 TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dm_room_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_room_id  UUID NOT NULL REFERENCES public.dm_rooms (id),
  user_id     UUID NOT NULL REFERENCES public.users (id),
  role        TEXT,  -- 'member', 'owner'
  metadata    JSONB,
  placeholder_1 TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

-- direct_messages referencing dm_rooms:
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_room_id   UUID NOT NULL REFERENCES public.dm_rooms (id),
  sender_id    UUID NOT NULL REFERENCES public.users (id),
  parent_id    UUID,
  message_text TEXT,
  attachments  JSONB,
  mentions     JSONB,
  metadata     JSONB,
  placeholder_1 TEXT,
  created_at   TIMESTAMP DEFAULT now(),
  updated_at   TIMESTAMP DEFAULT now()
);
```

*(Pick only one DM setup—don’t mix both unless you specifically need both single direct messages **and** group rooms.)*

---

## **7. Notifications, Pinned Messages, Reactions**

### **7.1 `notifications`**

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES public.users (id),
  notification_type  TEXT,    -- 'mention', 'dm', 'ai_summary', etc.
  title              TEXT,
  body               TEXT,
  link               TEXT,    -- URL or route to relevant context
  is_read            BOOLEAN DEFAULT false,
  metadata           JSONB,
  placeholder_1      TEXT,
  created_at         TIMESTAMP DEFAULT now(),
  updated_at         TIMESTAMP DEFAULT now()
);
```

### **7.2 `pinned_messages`**

```sql
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_type    TEXT,      -- 'channel' or 'direct'
  message_id      UUID NOT NULL,  -- references messages.id or direct_messages.id
  pinned_by       UUID NOT NULL REFERENCES public.users (id),
  pinned_at       TIMESTAMP DEFAULT now(),
  metadata        JSONB,
  placeholder_1   TEXT,
  created_at      TIMESTAMP DEFAULT now(),
  updated_at      TIMESTAMP DEFAULT now()
);
```

### **7.3 `message_reactions`**

```sql
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_type     TEXT,                 -- 'channel' or 'direct'
  message_id       UUID NOT NULL,        -- references messages/direct_messages
  user_id          UUID NOT NULL REFERENCES public.users (id),
  emoji            TEXT,                 -- e.g. ':yoda:', '❤️'
  metadata         JSONB,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);
```

*(We often store the actual reference in `metadata` if it’s a custom emoji. You may also add a foreign key to `custom_emojis` if you want to enforce a match.)*

---

## **8. (Optional) Slash Commands**

```sql
CREATE TABLE IF NOT EXISTS public.slash_commands (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  command      TEXT NOT NULL,        -- e.g. '/poll', '/giphy'
  description  TEXT,
  metadata     JSONB,                -- usage instructions, script references
  placeholder_1 TEXT,
  created_at   TIMESTAMP DEFAULT now(),
  updated_at   TIMESTAMP DEFAULT now()
);
```

---

## **9. (Optional) Call Sessions (Voice/Video)**

```sql
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_type      TEXT,    -- 'user_to_user', 'user_to_ai', 'group_call', 'voice_channel'
  channel_id     UUID,    -- references public.channels(id) if relevant
  dm_room_id     UUID,    -- references dm_rooms(id) if relevant
  initiator_id   UUID NOT NULL REFERENCES public.users (id),
  participants   JSONB,   -- e.g. ["user1", "user2", "ai_vader"]
  started_at     TIMESTAMP DEFAULT now(),
  ended_at       TIMESTAMP,
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);
```

---

## **10. (Optional) AI Suggestions Log**

If you want to store in-line suggestions:

```sql
CREATE TABLE IF NOT EXISTS public.ai_suggestions_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users (id),
  input_text     TEXT,
  suggestion     TEXT,
  accepted       BOOLEAN DEFAULT false,
  metadata       JSONB,
  created_at     TIMESTAMP DEFAULT now()
);
```

---

## **11. (Optional) `custom_emojis`**

```sql
CREATE TABLE IF NOT EXISTS public.custom_emojis (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji_name     TEXT UNIQUE NOT NULL,  -- e.g. 'yoda', 'vader_helmet'
  image_url      TEXT NOT NULL,         -- points to Supabase Storage
  metadata       JSONB,
  placeholder_1  TEXT,
  created_at     TIMESTAMP DEFAULT now(),
  updated_at     TIMESTAMP DEFAULT now()
);
```

*(You’ll store a row here for each Star Wars emoji—like “yoda,” “vader,” etc.)*

---

## **12. Creating a Supabase Storage Bucket**

In Supabase, you typically create a **bucket** to store your files (e.g., Star Wars emojis). You can do this via the [Supabase CLI](https://supabase.com/docs/guides/cli) or the **Project Settings** → **Storage** section in the dashboard.

**Via CLI** (example):

```bash
supabase storage buckets create "star-wars-emojis" \
  --public
```

> The `--public` flag means objects can be accessed via a public URL without an auth token, so you can directly link to them (e.g., `https://<yourproject>.supabase.co/storage/v1/object/public/star-wars-emojis/yoda.png`).

Alternatively, you can do the same in the Supabase **UI**:

1. Go to **Storage** in the left-hand panel.  
2. Click **New Bucket**.  
3. Name it `star-wars-emojis`.  
4. (Optional) Mark it as **Public**.  
5. Click **Create**.  

Then you can upload your `.png` or `.gif` files (Yoda, Vader helmet, etc.) inside that bucket.