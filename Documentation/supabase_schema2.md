# Supabase Schema Documentation

## Overview
This document provides a comprehensive overview of the database schema for the Slack Clone application. The database is built on PostgreSQL and uses Supabase for management and real-time features.

## Tables Overview

The database consists of 20 main tables:
1. users
2. workspaces
3. workspace_members
4. channels
5. channel_members
6. messages
7. direct_messages
8. dm_rooms
9. dm_room_members
10. message_reactions
11. pinned_messages
12. thread_summaries
13. notifications
14. moderation_actions
15. call_sessions
16. custom_emojis
17. slash_commands
18. ai_documents
19. user_roles
20. role_permissions

## Foreign Key Relationships

### Workspace and Channel Relationships
- workspace_members.workspace_id -> workspaces.id (CASCADE)
- workspace_members.user_id -> users.id (CASCADE)
- channels.workspace_id -> workspaces.id (CASCADE)
- channels.created_by -> users.id (SET NULL)
- channel_members.channel_id -> channels.id (CASCADE)
- channel_members.user_id -> users.id (CASCADE)

### DM Room Relationships
- dm_rooms.member1_id -> users.id (CASCADE)
- dm_rooms.member2_id -> users.id (CASCADE)

## Indexes

### Workspace and Channel Indexes
- workspace_members_workspace_id_idx ON workspace_members(workspace_id)
- workspace_members_user_id_idx ON workspace_members(user_id)
- channels_workspace_id_idx ON channels(workspace_id)
- channel_members_channel_id_idx ON channel_members(channel_id)
- channel_members_user_id_idx ON channel_members(user_id)

### DM Room Indexes
- dm_rooms_member1_id_idx ON dm_rooms(member1_id)
- dm_rooms_member2_id_idx ON dm_rooms(member2_id)

## Detailed Table Structures

### 1. Users Table
Primary table for user information
```sql
Table: users
- id (uuid, primary key)
- email (text, unique)
- username (text, unique)
- display_name (text)
- phone_number (text)
- avatar_url (text)
- description (text)
- status (text)
- faction (text)
- last_seen (timestamp)
- is_bot (boolean, default: false)
- preferences (jsonb)
- ai_persona (jsonb)
- gamification (jsonb)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. Workspaces Table
Represents different workspaces/organizations
```sql
Table: workspaces
- id (uuid, primary key)
- name (text)
- owner_id (uuid, references users)
- workspace_type (text, default: 'standard')
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. Workspace Members Table
Links users to workspaces with roles
```sql
Table: workspace_members
- id (uuid, primary key)
- workspace_id (uuid, references workspaces ON DELETE CASCADE)
- user_id (uuid, references users ON DELETE CASCADE)
- role (text) -- ['owner', 'admin', 'member', 'guest']
- permissions (jsonb)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. Channels Table
Represents channels within workspaces
```sql
Table: channels
- id (uuid, primary key)
- name (text)
- slug (text)
- workspace_id (uuid, references workspaces ON DELETE CASCADE)
- created_by (uuid, references users ON DELETE SET NULL)
- description (text)
- is_private (boolean, default: false)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5. Channel Members Table
Links users to channels with roles
```sql
Table: channel_members
- id (uuid, primary key)
- channel_id (uuid, references channels ON DELETE CASCADE)
- user_id (uuid, references users ON DELETE CASCADE)
- role (text) -- ['member', 'moderator', 'admin']
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 6. Messages Table
Stores channel messages
```sql
Table: messages
- id (uuid, primary key)
- channel_id (uuid, references channels)
- user_id (uuid, references users)
- workspace_id (uuid, references workspaces)
- message_text (text)
- parent_id (uuid)
- thread_id (uuid)
- edited_at (timestamp)
- edited_by (uuid)
- attachments (jsonb)
- mentions (jsonb)
- metadata (jsonb)
- is_pinned (boolean)
- reactions (jsonb)
- reply_count (integer)
- is_announcement (boolean)
- is_ai_generated (boolean)
- ai_model (text)
- ai_prompt (text)
- ai_response_metadata (jsonb)
- read_by (jsonb)
- delivery_status (text)
- scheduled_for (timestamp)
- expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### 7. Direct Messages Table
Stores private messages between users
```sql
Table: direct_messages
- id (uuid, primary key)
- dm_room_id (uuid, references dm_rooms)
- sender_id (uuid, references users)
- workspace_id (uuid, references workspaces)
- parent_id (uuid)
- message_text (text)
- attachments (jsonb)
- mentions (jsonb)
- metadata (jsonb)
- thread_id (uuid)
- edited_at (timestamp)
- edited_by (uuid)
- is_pinned (boolean)
- reactions (jsonb)
- reply_count (integer)
- is_announcement (boolean)
- is_ai_generated (boolean)
- ai_model (text)
- ai_prompt (text)
- ai_response_metadata (jsonb)
- read_by (jsonb)
- delivery_status (text)
- scheduled_for (timestamp)
- expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### 8. DM Rooms Table
Represents direct message conversations between two users
```sql
Table: dm_rooms
- id (uuid, primary key)
- member1_id (uuid, references users ON DELETE CASCADE)
- member2_id (uuid, references users ON DELETE CASCADE)
- created_at (timestamp)
- updated_at (timestamp)
```

### 9. DM Room Members Table
Links users to DM rooms
```sql
Table: dm_room_members
- id (uuid, primary key)
- dm_room_id (uuid, references dm_rooms)
- user_id (uuid, references users)
- role (text) -- ['admin', 'member']
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 10. Message Reactions Table
Stores reactions to messages
```sql
Table: message_reactions
- id (uuid, primary key)
- message_type (text)
- message_id (uuid)
- user_id (uuid)
- workspace_id (uuid, references workspaces)
- emoji (text)
- reaction_type (text, default: 'emoji')
- custom_emoji_id (uuid)
- skin_tone (text)
- reaction_score (integer, default: 1)
- is_ai_generated (boolean, default: false)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 11. Pinned Messages Table
Tracks pinned messages
```sql
Table: pinned_messages
- id (uuid, primary key)
- message_type (text)
- message_id (uuid)
- pinned_by (uuid)
- pinned_at (timestamp)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 12. Thread Summaries Table
Stores summaries of message threads
```sql
Table: thread_summaries
- id (uuid, primary key)
- channel_id (uuid)
- parent_message_id (uuid)
- summary_text (text)
- pinned (boolean, default: false)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 13. Notifications Table
Manages user notifications
```sql
Table: notifications
- id (uuid, primary key)
- user_id (uuid)
- notification_type (text)
- title (text)
- body (text)
- link (text)
- is_read (boolean, default: false)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 14. Moderation Actions Table
Tracks moderation activities
```sql
Table: moderation_actions
- id (uuid, primary key)
- workspace_id (uuid)
- channel_id (uuid)
- acted_upon_id (uuid)
- acted_by_id (uuid)
- action_type (text)
- reason (text)
- expires_at (timestamp)
- metadata (jsonb)
- created_at (timestamp)
```

### 15. Call Sessions Table
Manages voice/video calls
```sql
Table: call_sessions
- id (uuid, primary key)
- call_type (text, default: 'user_to_user')
- channel_id (uuid)
- dm_room_id (uuid)
- initiator_id (uuid)
- participants (jsonb)
- started_at (timestamp)
- ended_at (timestamp)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 16. Custom Emojis Table
Stores custom emoji information
```sql
Table: custom_emojis
- id (uuid, primary key)
- emoji_name (text, unique)
- image_url (text)
- is_global (boolean, default: true)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 17. Slash Commands Table
Defines available slash commands
```sql
Table: slash_commands
- id (uuid, primary key)
- command (text)
- description (text)
- permissions (jsonb)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 18. AI Documents Table
Stores AI-related documents
```sql
Table: ai_documents
- id (uuid, primary key)
- owner_user_id (uuid)
- title (text)
- description (text)
- source_type (text)
- content_url (text)
- embedding_refs (jsonb)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### 19. User Roles Table
Manages user roles
```sql
Table: user_roles
- id (bigint, primary key)
- user_id (uuid, references users)
- role (app_role)
```

### 20. Role Permissions Table
Defines permissions for roles
```sql
Table: role_permissions
- id (bigint, primary key)
- role (app_role)
- permission (app_permission)
```

## Row Level Security (RLS) Policies

### Users Table Policies
- Public read of all users (authenticated)
- Insert your own user row (authenticated)
- Update self (authenticated)
- Delete self (authenticated)
- Allow signup insert (anon, authenticated)

### Workspaces Table Policies
- Public read of all workspaces (authenticated)
- Insert workspace (authenticated)
- Update if workspace owner (authenticated)
- Delete if workspace owner (authenticated)

### Workspace Members Table Policies
- View your workspace memberships (authenticated)
- Join workspace if invited (authenticated)
- Update own role if workspace admin (authenticated)
- Delete own membership (authenticated)

### Channels Table Policies
- View channels in your workspaces (authenticated)
- Create channel if workspace member (authenticated)
- Update if channel admin (authenticated)
- Delete if channel admin (authenticated)

### Channel Members Table Policies
- View your channel memberships (authenticated)
- Join channel if workspace member (authenticated)
- Update own role if channel admin (authenticated)
- Delete own membership (authenticated)

### Messages Table Policies
- Select all channel messages (authenticated)
- Insert message if user is sender (authenticated)
- Update own message (authenticated)
- Delete own message (authenticated)

### DM Rooms Table Policies
- View DM rooms where you are a member (authenticated)
- Create DM room if you are a member (authenticated)
- No update policy (immutable)
- No delete policy (permanent)

### Direct Messages Table Policies
- Select direct messages if in DM room (authenticated)
- Insert DM if user is sender (authenticated)
- Update own DM (authenticated)
- Delete own DM (authenticated)

## Indexes
Key indexes include:
- Primary key indexes on all tables
- Foreign key indexes for relationships
- Specialized indexes for:
  - Workspace members (workspace_id, user_id)
  - Channel members (channel_id, user_id)
  - DM rooms (member1_id, member2_id)
  - Messages (created_at, thread_id, user_id)
  - Direct messages (created_at, dm_room_id, sender_id)

## Constraints
Notable constraints include:
- Foreign key relationships between tables:
  - workspace_members.workspace_id -> workspaces.id (CASCADE)
  - workspace_members.user_id -> users.id (CASCADE)
  - channels.workspace_id -> workspaces.id (CASCADE)
  - channels.created_by -> users.id (SET NULL)
  - channel_members.channel_id -> channels.id (CASCADE)
  - channel_members.user_id -> users.id (CASCADE)
  - dm_rooms.member1_id -> users.id (CASCADE)
  - dm_rooms.member2_id -> users.id (CASCADE)
- Unique constraints on:
  - User email and username
  - Channel member combinations
  - DM room member combinations
  - Custom emoji names
- Role constraints:
  - Workspace member roles: ['owner', 'admin', 'member', 'guest']
  - Channel member roles: ['member', 'moderator', 'admin']
  - DM room member roles: ['admin', 'member']

## Real-time Features
The following tables are configured for real-time updates:
- messages
- direct_messages
- notifications
- user_status
- channel_members
- workspace_members
- dm_rooms

## Security Features
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Authenticated user policies
- Workspace-level permissions
- Channel-level permissions
