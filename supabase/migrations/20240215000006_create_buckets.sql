-- Create necessary storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', false),
  ('message_attachments', 'message_attachments', false)
ON CONFLICT (id) DO NOTHING; 