-- Add conta_bancaria_id to extrato_bancario
ALTER TABLE public.extrato_bancario 
ADD COLUMN conta_bancaria_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;

CREATE INDEX idx_extrato_bancario_conta_id ON public.extrato_bancario(conta_bancaria_id);
