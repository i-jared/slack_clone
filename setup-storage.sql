-- Enable the storage extension if not already enabled
create extension if not exists "storage" schema "extensions";

-- Create storage schema if it doesn't exist
create schema if not exists storage;

-- Create storage.buckets table if it doesn't exist
create table if not exists storage.buckets (
    id text not null primary key,
    name text not null,
    owner uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    public boolean default false
);

-- Create storage.objects table if it doesn't exist
create table if not exists storage.objects (
    id uuid not null primary key default uuid_generate_v4(),
    bucket_id text not null references storage.buckets(id),
    name text not null,
    owner uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_accessed_at timestamptz default now(),
    metadata jsonb default '{}'::jsonb,
    path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Create the message_attachments bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('message_attachments', 'message_attachments', true)
on conflict (id) do update set public = true;

-- Enable RLS
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;

-- Clean up existing policies
drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Allow authenticated users to upload files" on storage.objects;
drop policy if exists "Allow users to update their own files" on storage.objects;
drop policy if exists "Allow users to delete their own files" on storage.objects;

-- Create bucket policies
create policy "Allow public read access"
on storage.objects for select
using ( bucket_id = 'message_attachments' );

create policy "Allow authenticated users to upload files"
on storage.objects for insert
with check (
    bucket_id = 'message_attachments'
    and auth.role() = 'authenticated'
);

create policy "Allow users to update their own files"
on storage.objects for update
using (
    bucket_id = 'message_attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Allow users to delete their own files"
on storage.objects for delete
using (
    bucket_id = 'message_attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
); 