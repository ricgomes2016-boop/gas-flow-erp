-- Add optional entregador_id to horarios_funcionario so we can schedule both
ALTER TABLE public.horarios_funcionario
  ALTER COLUMN funcionario_id DROP NOT NULL;

ALTER TABLE public.horarios_funcionario
  ADD COLUMN entregador_id uuid REFERENCES public.entregadores(id);

-- Add constraint: at least one must be set
ALTER TABLE public.horarios_funcionario
  ADD CONSTRAINT chk_funcionario_ou_entregador
  CHECK (funcionario_id IS NOT NULL OR entregador_id IS NOT NULL);