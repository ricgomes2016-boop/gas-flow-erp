
-- Add entregador reference and no-cash-out flag to abastecimentos
ALTER TABLE public.abastecimentos
  ADD COLUMN IF NOT EXISTS entregador_id uuid REFERENCES public.entregadores(id),
  ADD COLUMN IF NOT EXISTS sem_saida_caixa boolean NOT NULL DEFAULT false;
