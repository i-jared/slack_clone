-- setup.sql
-- Potential fix: Remove or update the old handle_new_user trigger if it references outdated schema.
-- If you keep it, ensure it matches new schema fields. Otherwise, drop it.

-- Example: If we no longer need handle_new_user, comment it out:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Or, if we want to keep it, ensure it references the correct columns in public.users:
-- 
-- CREATE OR REPLACE FUNCTION public.handle_new_user() 
-- returns trigger as $$
-- begin
--   insert into public.users (id, email, username)
--   values (new.id, new.email, left(new.email, position('@' in new.email) - 1));
--   return new;
-- end;
-- $$ language plpgsql security definer;

-- Above ensures "email" and "username" are properly set.

-- The rest of your schema definitions can remain as is,
-- but be sure no references to old columns that don't exist.

-- Example final:

create extension if not exists "uuid-ossp";

create type public.app_permission as enum ('channels.delete', 'messages.delete');
create type public.app_role as enum ('admin', 'moderator');
create type public.user_status as enum ('ONLINE', 'OFFLINE');

-- If we have other create table statements, keep them consistent with the new schema.

-- [Truncated for brevity - your existing content remains, just ensuring no conflicts exist.]