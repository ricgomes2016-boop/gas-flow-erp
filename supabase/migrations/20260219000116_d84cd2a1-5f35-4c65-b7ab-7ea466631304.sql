ALTER TABLE public.entregadores ADD COLUMN funcionario_id uuid REFERENCES public.funcionarios(id);

CREATE INDEX idx_entregadores_funcionario_id ON public.entregadores(funcionario_id);