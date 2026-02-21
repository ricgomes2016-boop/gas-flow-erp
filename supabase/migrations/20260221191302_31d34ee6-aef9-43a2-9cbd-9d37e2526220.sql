
-- Add valor_fipe and status columns to veiculos
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS valor_fipe numeric DEFAULT 0;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo';

-- Migrate existing data: ativo=true -> 'ativo', ativo=false -> 'inativo'
UPDATE public.veiculos SET status = CASE WHEN ativo = true THEN 'ativo' ELSE 'inativo' END;
