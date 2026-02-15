
-- Tabela para sessões de caixa (abertura/fechamento)
CREATE TABLE public.caixa_sessoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_abertura NUMERIC NOT NULL DEFAULT 0,
  valor_fechamento NUMERIC,
  diferenca NUMERIC,
  observacoes_abertura TEXT,
  observacoes_fechamento TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  usuario_abertura_id UUID NOT NULL,
  usuario_fechamento_id UUID,
  aberto_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fechado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.caixa_sessoes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view caixa_sessoes"
ON public.caixa_sessoes FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gestor'::app_role) OR 
  has_role(auth.uid(), 'financeiro'::app_role) OR 
  has_role(auth.uid(), 'operacional'::app_role)
);

CREATE POLICY "Staff can manage caixa_sessoes"
ON public.caixa_sessoes FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gestor'::app_role) OR 
  has_role(auth.uid(), 'financeiro'::app_role) OR 
  has_role(auth.uid(), 'operacional'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_caixa_sessoes_updated_at
BEFORE UPDATE ON public.caixa_sessoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
