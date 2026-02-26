-- Add operadora_id FK to terminais_cartao for proper linking
ALTER TABLE public.terminais_cartao 
ADD COLUMN operadora_id UUID REFERENCES public.operadoras_cartao(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_terminais_cartao_operadora_id ON public.terminais_cartao(operadora_id);
