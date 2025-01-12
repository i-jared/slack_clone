-- Add foreign key constraint to channels table
ALTER TABLE public.channels 
ADD CONSTRAINT channels_workspace_id_fkey 
FOREIGN KEY (workspace_id) 
REFERENCES public.workspaces(id)
ON DELETE CASCADE; 