-- Drop existing tables if they exist
DROP TABLE IF EXISTS dm_rooms CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;

-- Recreate workspace_members table with proper foreign keys
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Add indexes for workspace_members
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- Recreate channel_members table with proper foreign keys
CREATE TABLE channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- Add indexes for channel_members
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);

-- Recreate dm_rooms table with proper structure
CREATE TABLE dm_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member1_id, member2_id)
);

-- Add indexes for dm_rooms
CREATE INDEX idx_dm_rooms_member1_id ON dm_rooms(member1_id);
CREATE INDEX idx_dm_rooms_member2_id ON dm_rooms(member2_id);

-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_rooms ENABLE ROW LEVEL SECURITY;

-- Workspace members policies
CREATE POLICY "Users can view workspace members they are part of"
    ON workspace_members FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM workspace_members wm2 
        WHERE wm2.workspace_id = workspace_members.workspace_id
    ));

-- Channel members policies
CREATE POLICY "Users can view channel members they share channels with"
    ON channel_members FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM channel_members cm2 
        WHERE cm2.channel_id = channel_members.channel_id
    ));

-- DM room policies
CREATE POLICY "Users can view their own DM rooms"
    ON dm_rooms FOR SELECT
    USING (auth.uid() IN (member1_id, member2_id));

CREATE POLICY "Users can create DM rooms with other users"
    ON dm_rooms FOR INSERT
    WITH CHECK (auth.uid() IN (member1_id, member2_id));
