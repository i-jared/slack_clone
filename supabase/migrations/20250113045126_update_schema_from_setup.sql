-- Drop existing types if they exist
DROP TYPE IF EXISTS public.app_permission CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;

-- Create new types
CREATE TYPE public.app_permission AS ENUM ('channels.delete', 'messages.delete');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');
CREATE TYPE public.user_status AS ENUM ('ONLINE', 'OFFLINE');

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update existing tables with new constraints and relationships
ALTER TABLE public.workspace_members
    DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_fkey,
    DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey,
    ADD CONSTRAINT workspace_members_workspace_id_fkey 
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    ADD CONSTRAINT workspace_members_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.channel_members
    DROP CONSTRAINT IF EXISTS channel_members_channel_id_fkey,
    DROP CONSTRAINT IF EXISTS channel_members_user_id_fkey,
    ADD CONSTRAINT channel_members_channel_id_fkey
        FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    ADD CONSTRAINT channel_members_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public.channels
    DROP CONSTRAINT IF EXISTS channels_workspace_id_fkey,
    DROP CONSTRAINT IF EXISTS channels_created_by_fkey,
    ADD CONSTRAINT channels_workspace_id_fkey
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    ADD CONSTRAINT channels_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS workspace_members_workspace_id_idx ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS channel_members_user_id_idx ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS channel_members_channel_id_idx ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS channels_workspace_id_idx ON channels(workspace_id);

-- Enable RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
