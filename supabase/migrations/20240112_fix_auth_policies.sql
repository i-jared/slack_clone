-- Drop existing policies
DROP POLICY IF EXISTS "Delete self" ON public.users;
DROP POLICY IF EXISTS "Insert your own user row" ON public.users;
DROP POLICY IF EXISTS "Public read of all users" ON public.users;
DROP POLICY IF EXISTS "Update self" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all users
CREATE POLICY "Public read of all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own rows
CREATE POLICY "Update self"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own rows
CREATE POLICY "Delete self"
ON public.users FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Allow new user creation during signup
CREATE POLICY "Allow signup insert"
ON public.users FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to insert their own row
CREATE POLICY "Insert authenticated user"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create trigger to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'OFFLINE'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 