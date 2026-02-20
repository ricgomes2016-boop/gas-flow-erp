
-- Solicitações entre contador e empresa
CREATE TABLE public.solicitacoes_contador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'documento', -- documento, informacao, revisao, outro
  prioridade TEXT NOT NULL DEFAULT 'normal', -- baixa, normal, alta, urgente
  status TEXT NOT NULL DEFAULT 'aberta', -- aberta, em_andamento, respondida, concluida, cancelada
  solicitante_id UUID NOT NULL,
  solicitante_tipo TEXT NOT NULL DEFAULT 'contador', -- contador, empresa
  resposta TEXT,
  respondido_por UUID,
  respondido_em TIMESTAMPTZ,
  prazo TIMESTAMPTZ,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_contador ENABLE ROW LEVEL SECURITY;

-- Contador pode ver e criar solicitações
CREATE POLICY "Contador can view solicitacoes"
ON public.solicitacoes_contador FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Contador can insert solicitacoes"
ON public.solicitacoes_contador FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Contador can update solicitacoes"
ON public.solicitacoes_contador FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'contador'::app_role));

-- Staff pode ver e responder
CREATE POLICY "Staff can view solicitacoes"
ON public.solicitacoes_contador FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "Staff can update solicitacoes"
ON public.solicitacoes_contador FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "Staff can insert solicitacoes"
ON public.solicitacoes_contador FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

-- Comunicados da contabilidade
CREATE TABLE public.comunicados_contador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'aviso', -- aviso, alerta, informativo, regulatorio
  importante BOOLEAN NOT NULL DEFAULT false,
  lido BOOLEAN NOT NULL DEFAULT false,
  autor_id UUID NOT NULL,
  autor_nome TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comunicados_contador ENABLE ROW LEVEL SECURITY;

-- Todos com acesso ao portal podem ver
CREATE POLICY "Contador can view comunicados"
ON public.comunicados_contador FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Contador can insert comunicados"
ON public.comunicados_contador FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Contador can update comunicados"
ON public.comunicados_contador FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Staff can view comunicados"
ON public.comunicados_contador FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "Staff can insert comunicados"
ON public.comunicados_contador FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "Staff can update comunicados"
ON public.comunicados_contador FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

-- Triggers updated_at
CREATE TRIGGER update_solicitacoes_contador_updated_at
BEFORE UPDATE ON public.solicitacoes_contador
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comunicados_contador_updated_at
BEFORE UPDATE ON public.comunicados_contador
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.solicitacoes_contador;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comunicados_contador;
