
-- Add chave_pix column to unidades table
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS chave_pix text;
