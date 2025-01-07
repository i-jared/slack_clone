-- Update existing channels to Star Wars themed names
UPDATE public.channels
SET slug = 'rebel-alliance'
WHERE slug = 'public';

UPDATE public.channels
SET slug = 'imperial-command'
WHERE slug = 'random';

-- Insert new channels
INSERT INTO public.channels (slug, created_by)
SELECT 'cantina', created_by
FROM public.channels
WHERE slug = 'rebel-alliance'
LIMIT 1;

INSERT INTO public.channels (slug, created_by)
SELECT 'jedi-council', created_by
FROM public.channels
WHERE slug = 'rebel-alliance'
LIMIT 1; 