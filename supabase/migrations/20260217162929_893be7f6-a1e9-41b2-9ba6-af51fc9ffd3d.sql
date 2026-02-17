
-- Tabela de carregamentos de rota (estoque em rota por entregador)
CREATE TABLE public.carregamentos_rota (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entregador_id uuid NOT NULL REFERENCES public.entregadores(id),
  rota_definida_id uuid REFERENCES public.rotas_definidas(id),
  data_saida timestamp with time zone NOT NULL DEFAULT now(),
  data_retorno timestamp with time zone,
  status text NOT NULL DEFAULT 'em_rota',
  observacoes text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Itens carregados na rota
CREATE TABLE public.carregamento_rota_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carregamento_id uuid NOT NULL REFERENCES public.carregamentos_rota(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  quantidade_saida integer NOT NULL DEFAULT 0,
  quantidade_retorno integer,
  quantidade_vendida integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carregamentos_rota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carregamento_rota_itens ENABLE ROW LEVEL SECURITY;

-- RLS for carregamentos_rota
CREATE POLICY "Staff can manage carregamentos_rota" ON public.carregamentos_rota
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view carregamentos_rota" ON public.carregamentos_rota
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Entregadores can view own carregamentos" ON public.carregamentos_rota
  FOR SELECT USING (has_role(auth.uid(), 'entregador'::app_role) AND entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid()));

-- RLS for carregamento_rota_itens
CREATE POLICY "Staff can manage carregamento_rota_itens" ON public.carregamento_rota_itens
  FOR ALL USING (carregamento_id IN (SELECT id FROM carregamentos_rota WHERE has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role)));

CREATE POLICY "Staff can view carregamento_rota_itens" ON public.carregamento_rota_itens
  FOR SELECT USING (carregamento_id IN (SELECT id FROM carregamentos_rota WHERE has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role)));

CREATE POLICY "Entregadores can view own carregamento_itens" ON public.carregamento_rota_itens
  FOR SELECT USING (carregamento_id IN (SELECT id FROM carregamentos_rota WHERE entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())));

-- Triggers
CREATE TRIGGER update_carregamentos_rota_updated_at
  BEFORE UPDATE ON public.carregamentos_rota
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
