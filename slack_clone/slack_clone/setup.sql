CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.app_permission AS ENUM ('channels.delete', 'messages.delete');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');
CREATE TYPE public.user_status AS ENUM ('ONLINE', 'OFFLINE');

-- USERS TABLE
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       text,
  username    text,
  status      public.user_status DEFAULT 'OFFLINE',
  avatar_url  text,
  updated_at  timestamptz DEFAULT timezone('utc'::text, now()),
  created_at  timestamptz DEFAULT timezone('utc'::text, now())
);

-- WORKSPACES TABLE
DROP TABLE IF EXISTS public.workspaces CASCADE;
CREATE TABLE public.workspaces (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  owner_id    uuid NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- WORKSPACE MEMBERS
DROP TABLE IF EXISTS public.workspace_members CASCADE;
CREATE TABLE public.workspace_members (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   uuid NOT NULL,
  user_id        uuid NOT NULL,
  role           text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Ensure FK referencing workspaces.id
ALTER TABLE public.workspace_members
  ADD CONSTRAINT workspace_members_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES public.workspaces (id)
  ON DELETE CASCADE;

ALTER TABLE public.workspace_members
  ADD CONSTRAINT workspace_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id)
  ON DELETE CASCADE;

-- CHANNELS
DROP TABLE IF EXISTS public.channels CASCADE;
CREATE TABLE public.channels (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text,
  workspace_id uuid NOT NULL,
  is_private  boolean DEFAULT false,
  description text,
  created_by  uuid NOT NULL REFERENCES public.users (id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- channel_members
DROP TABLE IF EXISTS public.channel_members CASCADE;
CREATE TABLE public.channel_members (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id  uuid NOT NULL,
  user_id     uuid NOT NULL,
  role        text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.channel_members
  ADD CONSTRAINT channel_members_channel_id_fkey
  FOREIGN KEY (channel_id) REFERENCES public.channels (id) ON DELETE CASCADE;

ALTER TABLE public.channel_members
  ADD CONSTRAINT channel_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

-- MESSAGES
DROP TABLE IF EXISTS public.messages CASCADE;
CREATE TABLE public.messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id  uuid NOT NULL REFERENCES public.channels (id),
  user_id     uuid NOT NULL REFERENCES public.users (id),
  message_text text,
  parent_id   uuid,
  thread_id   uuid,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- DM ROOMS
DROP TABLE IF EXISTS public.dm_rooms CASCADE;
CREATE TABLE public.dm_rooms (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_name    text,
  is_group     boolean DEFAULT false,
  metadata     jsonb,
  placeholder_1 text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- DM ROOM MEMBERS
DROP TABLE IF EXISTS public.dm_room_members CASCADE;
CREATE TABLE public.dm_room_members (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_room_id   uuid NOT NULL,
  user_id      uuid NOT NULL,
  role         text,
  metadata     jsonb,
  placeholder_1 text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.dm_room_members
  ADD CONSTRAINT dm_room_members_room_id_fkey
  FOREIGN KEY (dm_room_id) REFERENCES public.dm_rooms (id) ON DELETE CASCADE;

ALTER TABLE public.dm_room_members
  ADD CONSTRAINT dm_room_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

-- DIRECT MESSAGES
DROP TABLE IF EXISTS public.direct_messages CASCADE;
CREATE TABLE public.direct_messages (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_room_id   uuid NOT NULL REFERENCES public.dm_rooms (id),
  sender_id    uuid NOT NULL REFERENCES public.users (id),
  message_text text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Basic wide open read, restricted writes
CREATE POLICY "Public read on users" ON public.users
FOR SELECT TO public
USING (true);

CREATE POLICY "User can update own user row" ON public.users
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Public read on workspaces" ON public.workspaces
FOR SELECT TO public
USING (true);

CREATE POLICY "Insert workspace" ON public.workspaces
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update workspace if owner" ON public.workspaces
FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Public read on channels" ON public.channels
FOR SELECT TO public
USING (true);

CREATE POLICY "Insert channel" ON public.channels
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update channel if creator" ON public.channels
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Public read channel_members" ON public.channel_members
FOR SELECT TO public
USING (true);

CREATE POLICY "Insert channel_members" ON public.channel_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update channel_members if self" ON public.channel_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- messages
CREATE POLICY "Public read messages" ON public.messages
FOR SELECT TO public
USING (true);

CREATE POLICY "Insert messages if user is sender" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own message" ON public.messages
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- direct_messages
CREATE POLICY "Public read direct_messages" ON public.direct_messages
FOR SELECT TO public
USING (true);

CREATE POLICY "Insert direct_messages" ON public.direct_messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

-- workspace_members
CREATE POLICY "Public read workspace_members" ON public.workspace_members
FOR SELECT TO public
USING (true);

CREATE POLICY "Insert workspace_members" ON public.workspace_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Possibly you want more secure RLS, but this is enough for dev.

-- handle_new_user function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert a row in public.users with the same ID
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();