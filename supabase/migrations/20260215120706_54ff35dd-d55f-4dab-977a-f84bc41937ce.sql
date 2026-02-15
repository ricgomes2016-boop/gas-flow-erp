
-- Add latitude/longitude to unidades for map centering
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS longitude double precision;
