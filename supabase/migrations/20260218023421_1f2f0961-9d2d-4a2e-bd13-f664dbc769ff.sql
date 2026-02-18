
-- Tabela de controle de férias
CREATE TABLE public.ferias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades(id),
  periodo_aquisitivo_inicio DATE NOT NULL,
  periodo_aquisitivo_fim DATE NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  dias_direito INTEGER NOT NULL DEFAULT 30,
  dias_gozados INTEGER NOT NULL DEFAULT 0,
  dias_vendidos INTEGER NOT NULL DEFAULT 0,
  valor_ferias NUMERIC DEFAULT 0,
  valor_abono NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ferias ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can manage ferias"
  ON public.ferias FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Staff can view ferias"
  ON public.ferias FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_ferias_updated_at
  BEFORE UPDATE ON public.ferias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
