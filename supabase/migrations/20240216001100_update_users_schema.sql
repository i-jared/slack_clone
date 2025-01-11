-- Drop existing users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Create new users table with updated schema
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'OFFLINE',
  faction TEXT,
  last_seen TIMESTAMP,
  preferences JSONB,
  ai_persona JSONB,
  gamification JSONB,
  metadata JSONB,
  placeholder_col_1 TEXT,
  placeholder_col_2 JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Allow logged-in read access" 
ON public.users FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow individual insert access" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update access" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, status)
  VALUES (
    new.id,
    new.email,
    new.email,
    split_part(new.email, '@', 1),
    'ONLINE'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 