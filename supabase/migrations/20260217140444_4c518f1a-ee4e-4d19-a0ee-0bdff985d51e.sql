
-- Add columns for gas station workflow
ALTER TABLE public.abastecimentos
  ADD COLUMN IF NOT EXISTS posto text,
  ADD COLUMN IF NOT EXISTS nota_fiscal text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS acerto_data date;
