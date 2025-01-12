# Supabase Schema Documentation

## Core Tables

### Users Table
- Primary key: `id` (UUID)
- Unique constraints:
  - `email` (TEXT)
  - `username` (TEXT)
- Required fields:
  - `id` (UUID)
  - `email` (TEXT)
  - `username` (TEXT)
- Optional fields:
  - `display_name` (TEXT)
  - `phone_number` (TEXT)
  - `avatar_url` (TEXT)
  - `description` (TEXT)
  - `status` (TEXT)
  - `faction` (TEXT)
  - `last_seen` (TIMESTAMP)
  - `is_bot` (BOOLEAN)
  - `preferences` (JSONB)
  - `ai_persona` (JSONB)
  - `gamification` (JSONB)
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- RLS Policies:
  - "Allow signup insert": Allows anon users during signup and authenticated users to insert their own row
  - "Allow authenticated read": Allows authenticated users to read all users
  - "Allow individual update": Allows users to update their own data
  - "Delete self": Allows users to delete their own data

### DM Rooms Table
- Primary key: `id` (UUID)
- Required fields:
  - `room_name` (TEXT)
  - `is_group` (BOOLEAN DEFAULT false)
  - `metadata` (JSONB)
  - `workspace_id` (UUID)
- Optional fields:
  - `placeholder_1` (TEXT)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
- RLS Policies:
  - "Select all dm_rooms": Allows authenticated users to read all DM rooms
  - "Insert dm_room": Allows authenticated users to create new DM rooms
  - "Update dm_room open": Allows authenticated users to update any DM room
  - "Delete dm_room open": Allows authenticated users to delete any DM room

### DM Room Members Table
- Primary key: `id` (UUID)
- Required fields:
  - `dm_room_id` (UUID NOT NULL)
  - `user_id` (UUID NOT NULL)
  - `role` (TEXT)
  - `metadata` (JSONB)
- Optional fields:
  - `placeholder_1` (TEXT)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `dm_room_id` references `dm_rooms(id)` ON DELETE CASCADE
  - `user_id` references `users(id)` ON DELETE CASCADE
- RLS Policies:
  - "Select all dm_room_members": Allows authenticated users to read all DM room members
  - "Insert dm_room_members": Allows authenticated users to add any member to a DM room
  - "Update dm_room_members if self": Allows users to update their own membership
  - "Delete dm_room_members if self": Allows users to remove themselves from a room

### Direct Messages Table
- Primary key: `id` (UUID)
- Required fields:
  - `dm_room_id` (UUID NOT NULL)
  - `sender_id` (UUID NOT NULL)
  - `workspace_id` (UUID NOT NULL)
  - `message_text` (TEXT)
- Optional fields:
  - `parent_id` (UUID) - for threaded replies
  - `thread_id` (UUID)
  - `edited_at` (TIMESTAMP)
  - `edited_by` (UUID)
  - `attachments` (JSONB)
  - `mentions` (JSONB)
  - `metadata` (JSONB)
  - `is_pinned` (BOOLEAN DEFAULT false)
  - `reactions` (JSONB DEFAULT '{}')
  - `reply_count` (INTEGER DEFAULT 0)
  - `is_announcement` (BOOLEAN DEFAULT false)
  - `is_ai_generated` (BOOLEAN DEFAULT false)
  - `ai_model` (TEXT)
  - `ai_prompt` (TEXT)
  - `ai_response_metadata` (JSONB)
  - `read_by` (JSONB DEFAULT '{}')
  - `delivery_status` (TEXT DEFAULT 'sent')
  - `scheduled_for` (TIMESTAMP)
  - `expires_at` (TIMESTAMP)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `dm_room_id` references `dm_rooms(id)` ON DELETE CASCADE
  - `sender_id` references `users(id)` ON DELETE CASCADE
- Indexes:
  - `direct_messages_created_at_idx` on `created_at`
  - `direct_messages_dm_room_id_idx` on `dm_room_id`
  - `direct_messages_sender_id_idx` on `sender_id`
  - `idx_direct_messages_thread_id` on `thread_id`
  - `idx_direct_messages_workspace_id` on `workspace_id`
- RLS Policies:
  - "Select direct messages open": Allows authenticated users to read all direct messages
  - "Insert DM if user is sender": Allows users to send messages as themselves
  - "Update own DM": Allows users to update their own messages
  - "Delete own DM": Allows users to delete their own messages
  - "Users can insert messages in their DM rooms": Allows users to send messages in rooms they're members of
  - "Users can view messages in their DM rooms": Allows users to view messages in rooms they're members of

### Channels Table
- Primary key: `id` (UUID)
- Required fields:
  - `name` (TEXT)
  - `slug` (TEXT)
  - `workspace_id` (UUID)
  - `created_by` (UUID)
- Optional fields:
  - `description` (TEXT)
  - `is_private` (BOOLEAN DEFAULT false)
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `created_by` references `users(id)` ON DELETE CASCADE
- RLS Policies:
  - "Select all channels": Allows authenticated users to read all channels
  - "Insert channel": Allows authenticated users to create channels
  - "Update channel if creator": Allows creator to update channel
  - "Delete channel if creator": Allows creator to delete channel

### Channel Members Table
- Primary key: `id` (UUID)
- Required fields:
  - `channel_id` (UUID)
  - `user_id` (UUID)
  - `role` (TEXT)
- Optional fields:
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `channel_id` references `channels(id)` ON DELETE CASCADE
  - `user_id` references `users(id)` ON DELETE CASCADE
- RLS Policies:
  - "Select all channel_members": Allows authenticated users to read all channel members
  - "Insert channel membership": Allows authenticated users to join channels
  - "Update channel membership if self": Allows users to update their own membership
  - "Delete channel membership if self": Allows users to leave channels

### Messages Table
- Primary key: `id` (UUID)
- Required fields:
  - `channel_id` (UUID)
  - `user_id` (UUID)
  - `workspace_id` (UUID)
  - `message_text` (TEXT)
- Optional fields:
  - `parent_id` (UUID)
  - `thread_id` (UUID)
  - `edited_at` (TIMESTAMP)
  - `edited_by` (UUID)
  - `attachments` (JSONB)
  - `mentions` (JSONB)
  - `metadata` (JSONB)
  - `is_pinned` (BOOLEAN DEFAULT false)
  - `reactions` (JSONB DEFAULT '{}')
  - `reply_count` (INTEGER DEFAULT 0)
  - `is_announcement` (BOOLEAN DEFAULT false)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `channel_id` references `channels(id)` ON DELETE CASCADE
  - `user_id` references `users(id)` ON DELETE CASCADE
- Indexes:
  - `idx_messages_created_at` on `created_at`
  - `idx_messages_thread_id` on `thread_id`
  - `idx_messages_user_id` on `user_id`
  - `idx_messages_workspace_id` on `workspace_id`
- RLS Policies:
  - "Select all channel messages": Allows authenticated users to read all messages
  - "Insert message if user is sender": Allows users to send messages as themselves
  - "Update own message": Allows users to update their own messages
  - "Delete own message": Allows users to delete their own messages

### Message Reactions Table
- Primary key: `id` (UUID)
- Required fields:
  - `message_id` (UUID)
  - `user_id` (UUID)
  - `workspace_id` (UUID)
  - `emoji` (TEXT)
- Optional fields:
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `message_id` references `messages(id)` ON DELETE CASCADE
  - `user_id` references `users(id)` ON DELETE CASCADE
- Indexes:
  - `idx_message_reactions_message_id` on `message_id`
  - `idx_message_reactions_user_id` on `user_id`
  - `idx_message_reactions_workspace_id` on `workspace_id`
- RLS Policies:
  - "Select all message_reactions": Allows authenticated users to read all reactions
  - "Insert reaction": Allows authenticated users to add reactions
  - "Update own reaction": Allows users to update their own reactions
  - "Delete own reaction": Allows users to delete their own reactions

### Workspaces Table
- Primary key: `id` (UUID)
- Required fields:
  - `name` (TEXT)
  - `owner_id` (UUID)
  - `workspace_type` (TEXT)
- Optional fields:
  - `description` (TEXT)
  - `logo_url` (TEXT)
  - `domain` (TEXT)
  - `settings` (JSONB)
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `owner_id` references `users(id)` ON DELETE CASCADE
- RLS Policies:
  - "Public read of all workspaces": Allows authenticated users to read all workspaces
  - "Insert workspace": Allows authenticated users to create workspaces
  - "Update if workspace owner": Allows owner to update workspace
  - "Delete if workspace owner": Allows owner to delete workspace

### Workspace Members Table
- Primary key: `id` (UUID)
- Required fields:
  - `workspace_id` (UUID)
  - `user_id` (UUID)
  - `role` (TEXT)
- Optional fields:
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `user_id` references `users(id)` ON DELETE CASCADE
- RLS Policies:
  - "Public read of workspace_members": Allows authenticated users to read all workspace members
  - "Insert membership": Allows authenticated users to join workspaces
  - "Update your own membership": Allows users to update their own membership
  - "Delete your own membership": Allows users to leave workspaces

### Additional Features

#### Thread Summaries
- Primary key: `id` (UUID)
- Required fields:
  - `thread_id` (UUID)
  - `summary_text` (TEXT)
  - `workspace_id` (UUID)
- Optional fields:
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `thread_id` references `messages(id)` ON DELETE CASCADE
- RLS Policies: Open CRUD for authenticated users

#### Pinned Messages
- Primary key: `id` (UUID)
- Required fields:
  - `message_id` (UUID)
  - `pinned_by` (UUID)
  - `workspace_id` (UUID)
- Optional fields:
  - `pin_location` (TEXT)
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `message_id` references `messages(id)` ON DELETE CASCADE
  - `pinned_by` references `users(id)` ON DELETE CASCADE
- RLS Policies:
  - Read: Open to authenticated users
  - Write: Limited to the user who pinned the message

#### Notifications
- Primary key: `id` (UUID)
- Required fields:
  - `user_id` (UUID)
  - `type` (TEXT)
  - `title` (TEXT)
  - `content` (TEXT)
- Optional fields:
  - `metadata` (JSONB)
  - `read_at` (TIMESTAMP)
  - `action_url` (TEXT)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `user_id` references `users(id)` ON DELETE CASCADE
- RLS Policies: Limited to recipient user

#### Custom Emojis
- Primary key: `id` (UUID)
- Required fields:
  - `name` (TEXT)
  - `url` (TEXT)
  - `workspace_id` (UUID)
- Optional fields:
  - `created_by` (UUID)
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `created_by` references `users(id)` ON DELETE CASCADE
- RLS Policies: Open CRUD for authenticated users

#### Call Sessions
- Primary key: `id` (UUID)
- Required fields:
  - `initiator_id` (UUID)
  - `room_id` (TEXT)
  - `workspace_id` (UUID)
- Optional fields:
  - `status` (TEXT)
  - `metadata` (JSONB)
  - `ended_at` (TIMESTAMP)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `initiator_id` references `users(id)` ON DELETE CASCADE
- RLS Policies: Open CRUD for authenticated users

#### AI Documents
- Primary key: `id` (UUID)
- Required fields:
  - `owner_user_id` (UUID)
  - `title` (TEXT)
  - `content` (TEXT)
  - `workspace_id` (UUID)
- Optional fields:
  - `metadata` (JSONB)
  - `embedding` (vector)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
  - `owner_user_id` references `users(id)` ON DELETE CASCADE
- RLS Policies: Limited to owner user

#### Slash Commands
- Primary key: `id` (UUID)
- Required fields:
  - `command` (TEXT)
  - `description` (TEXT)
  - `workspace_id` (UUID)
- Optional fields:
  - `handler` (TEXT)
  - `metadata` (JSONB)
- Timestamps:
  - `created_at` (TIMESTAMP DEFAULT now())
  - `updated_at` (TIMESTAMP DEFAULT now())
- Foreign Keys:
  - `workspace_id` references `workspaces(id)` ON DELETE CASCADE
- RLS Policies: Open management for authenticated users

## Security and Access Control

### Row Level Security (RLS)
- All tables have RLS enabled
- Most read operations are open to authenticated users
- Write operations are typically restricted to the owner/creator
- DM room member management is open to facilitate room creation

### Roles and Permissions
- `anon`: Unauthenticated access
- `authenticated`: Basic user access
- `service_role`: Administrative access
- Custom roles can be defined through the `user_roles` and `role_permissions` tables

## Database Functions

### User Management
- `handle_new_user()`: Trigger function for new user creation
- `create_user(email text)`: Function to create new users
- `authorize(requested_permission app_permission)`: Permission checking function

## Indexes and Performance
- Created_at indexes on message tables for chronological access
- Foreign key indexes for relationship lookups
- Thread indexes for conversation threading
- Workspace indexes for multi-tenant isolation

## Best Practices

### Creating a DM Room
1. Generate a UUID for the new room
2. Insert the room into `dm_rooms`
3. Add all participating members to `dm_room_members`
4. Navigate to the room using the generated UUID

### Sending Messages
1. Ensure the sender is a member of the target room/channel
2. Create the message with appropriate metadata
3. Update any thread/parent message counts if needed
4. Handle any mentions or notifications

### Security Considerations
- All tables have RLS enabled
- Most read operations are open to authenticated users
- Write operations are typically restricted to the owner/creator
- Consider additional checks for group management
- Use appropriate roles and permissions for access control

## Recent Changes
1. Updated DM room member policies to allow member addition
2. Added workspace support to messages
3. Enhanced message schema with additional features
4. Implemented thread support in messages
5. Added support for AI-generated content

## Pending Considerations
1. Consider adding workspace-level permissions
2. Evaluate need for additional room types
3. Consider implementing message retention policies
4. Evaluate need for additional message metadata
5. Consider implementing rate limiting at the database level

## Deployment Information

### Local Development Setup
```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
```

### Migration Status
Current migration state shows a difference between local and remote migrations:

Local Migrations:
- 20240112000000 (Initial Schema)
- 20240112000001 (Fix Auth Policies)
- 20240112000002 (Update Message Schemas)
- 20240112000003 (Add Workspace Foreign Key)
- 20240112000004 (Update DM Room Members Policy)
- 20240112000005 (Update All Policies)

Remote Migrations:
- 20240112
- 20250109005123 (Update Logs Schema)
- 20250109005124 (Update Message Schemas)
- 20250112061200 (Add Workspace Foreign Key)

### Service Status
The following services are currently stopped in local development:
- supabase_imgproxy_slack-clone
- supabase_edge_runtime_slack-clone
- supabase_analytics_slack-clone
- supabase_vector_slack-clone
- supabase_pooler_slack-clone

These services are optional for local development and don't affect core functionality.

### Development Notes
1. Local development uses JWT-based authentication with separate anon and service role keys
2. S3-compatible storage is available locally for file uploads
3. GraphQL endpoint is available for alternative API access
4. Migration discrepancies between local and remote should be resolved before deployment
5. Core services (Auth, Database, API) are running and available for development

## Next Steps
1. Resolve migration discrepancies between local and remote
2. Consider enabling additional services if needed (analytics, vector, etc.)
3. Ensure all RLS policies are properly tested in local environment
4. Document any environment-specific configurations
5. Set up continuous deployment pipeline
