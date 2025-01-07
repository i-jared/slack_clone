-- Create buckets if they don't exist
insert into storage.buckets (id, name, public)
values 
    ('message_attachments', 'message_attachments', true),
    ('avatars', 'avatars', true)
on conflict (id) do update 
set public = true,
    file_size_limit = 10485760; -- 10MB in bytes

-- Create policies for message_attachments with unique names
create policy "msg_attach_read_20240107_1701"
on storage.objects for select
using ( bucket_id = 'message_attachments' );

create policy "msg_attach_insert_20240107_1701"
on storage.objects for insert
with check (
    bucket_id = 'message_attachments'
    and auth.role() = 'authenticated'
);

create policy "msg_attach_update_20240107_1701"
on storage.objects for update
using (
    bucket_id = 'message_attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "msg_attach_delete_20240107_1701"
on storage.objects for delete
using (
    bucket_id = 'message_attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for avatars bucket with unique names
create policy "avatar_read_20240107_1701"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "avatar_insert_20240107_1701"
on storage.objects for insert
with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatar_update_20240107_1701"
on storage.objects for update
using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatar_delete_20240107_1701"
on storage.objects for delete
using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
); 