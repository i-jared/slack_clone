-- Function to automatically set users to offline if they haven't been seen recently
CREATE OR REPLACE FUNCTION public.auto_set_offline() 
RETURNS trigger AS $$
BEGIN
  UPDATE users 
  SET status = 'OFFLINE'
  WHERE updated_at < NOW() - INTERVAL '5 minutes'
    AND status = 'ONLINE';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function periodically
CREATE OR REPLACE TRIGGER auto_set_offline_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.status = 'ONLINE')
  EXECUTE FUNCTION public.auto_set_offline();

-- Update all existing stale users to offline
UPDATE users 
SET status = 'OFFLINE'
WHERE updated_at < NOW() - INTERVAL '5 minutes'
  AND status = 'ONLINE'; 