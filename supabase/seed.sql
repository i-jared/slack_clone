-- Insert role permissions
INSERT INTO public.role_permissions (role, permission)
VALUES
    ('admin', 'channels.delete'),
    ('admin', 'messages.delete'),
    ('moderator', 'messages.delete');

DO $$
DECLARE
    user_id uuid;
    general_channel_id uuid;
    random_channel_id uuid;
    workspace_id uuid;
BEGIN
    -- Create admin user
    user_id := public.create_user('supabot+supaadmin@example.com');
    
    -- Create a default workspace
    workspace_id := gen_random_uuid();
    INSERT INTO public.workspaces (id, name, owner_id)
    VALUES (workspace_id, 'Default Workspace', user_id);
    
    -- Add workspace member
    INSERT INTO public.workspace_members (id, workspace_id, user_id, role)
    VALUES (gen_random_uuid(), workspace_id, user_id, 'admin');
    
    -- Create general channel
    general_channel_id := gen_random_uuid();
    INSERT INTO public.channels (id, workspace_id, slug, name, created_by)
    VALUES (general_channel_id, workspace_id, 'general', 'General', user_id);
    
    -- Create random channel
    random_channel_id := gen_random_uuid();
    INSERT INTO public.channels (id, workspace_id, slug, name, created_by)
    VALUES (random_channel_id, workspace_id, 'random', 'Random', user_id);
    
    -- Add channel members
    INSERT INTO public.channel_members (id, channel_id, user_id, role)
    VALUES 
        (gen_random_uuid(), general_channel_id, user_id, 'admin'),
        (gen_random_uuid(), random_channel_id, user_id, 'admin');
    
    -- Insert some messages
    INSERT INTO public.messages (id, workspace_id, channel_id, user_id, message_text)
    VALUES 
        (gen_random_uuid(), workspace_id, general_channel_id, user_id, 'Hello World 👋'),
        (gen_random_uuid(), workspace_id, random_channel_id, user_id, 'Welcome to Talk2D2!');
END $$;
  
