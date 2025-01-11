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