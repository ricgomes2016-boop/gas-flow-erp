
-- Tabela de rotas definidas (templates de rotas com bairros)
CREATE TABLE public.rotas_definidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  bairros TEXT[] NOT NULL DEFAULT '{}',
  distancia_km NUMERIC DEFAULT 0,
  tempo_estimado TEXT,
  ativo BOOLEAN DEFAULT true,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rotas_definidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rotas_definidas"
ON public.rotas_definidas FOR SELECT USING (true);

CREATE POLICY "Staff can manage rotas_definidas"
ON public.rotas_definidas FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE TRIGGER update_rotas_definidas_updated_at
BEFORE UPDATE ON public.rotas_definidas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de escalas de entregadores (integrada com horários RH)
CREATE TABLE public.escalas_entregador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entregador_id UUID NOT NULL REFERENCES public.entregadores(id),
  rota_definida_id UUID REFERENCES public.rotas_definidas(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  turno_inicio TIME NOT NULL DEFAULT '08:00',
  turno_fim TIME NOT NULL DEFAULT '18:00',
  status TEXT NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entregador_id, data)
);

ALTER TABLE public.escalas_entregador ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view escalas_entregador"
ON public.escalas_entregador FOR SELECT USING (true);

CREATE POLICY "Staff can manage escalas_entregador"
ON public.escalas_entregador FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Entregadores can view and update own escalas"
ON public.escalas_entregador FOR UPDATE
USING (entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid()));

CREATE TRIGGER update_escalas_entregador_updated_at
BEFORE UPDATE ON public.escalas_entregador
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
