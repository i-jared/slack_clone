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