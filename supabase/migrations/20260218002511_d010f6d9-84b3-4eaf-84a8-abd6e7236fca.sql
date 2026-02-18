
CREATE TABLE public.terminais_cartao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  numero_serie TEXT,
  modelo TEXT,
  operadora TEXT NOT NULL DEFAULT 'PagSeguro',
  status TEXT NOT NULL DEFAULT 'ativo',
  unidade_id UUID REFERENCES public.unidades(id),
  entregador_id UUID REFERENCES public.entregadores(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.terminais_cartao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage terminais_cartao"
ON public.terminais_cartao FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Staff can view terminais_cartao"
ON public.terminais_cartao FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE TRIGGER update_terminais_cartao_updated_at
BEFORE UPDATE ON public.terminais_cartao
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
