# Database Changes - Direct Messages

## Reset and Migration (2024-01-12)

### Changes Made
1. Reset the database to ensure proper application of all migrations
2. Confirmed structure of `direct_messages` table:
   - `id` (UUID, Primary Key)
   - `content` (TEXT, NOT NULL)
   - `dm_room_id` (UUID, Foreign Key to dm_rooms)
   - `sender_id` (UUID, Foreign Key to users)
   - `created_at` (TIMESTAMP WITH TIME ZONE)
   - `updated_at` (TIMESTAMP WITH TIME ZONE)

### Indexes Added
- `direct_messages_dm_room_id_idx` on `dm_room_id`
- `direct_messages_sender_id_idx` on `sender_id`
- `direct_messages_created_at_idx` on `created_at`

### Security
- Row Level Security (RLS) enabled
- Policies added:
  1. "Users can view messages in their DM rooms"
  2. "Users can insert messages in their DM rooms"

### Next Steps
1. Restart the Next.js server to ensure it recognizes the updated schema
2. Test DM functionality by:
   - Creating a new DM room
   - Sending messages
   - Verifying message display 