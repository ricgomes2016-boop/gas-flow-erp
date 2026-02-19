
-- =============================================
-- 1. CHAMADAS RECEBIDAS (Caller ID / GoTo)
-- =============================================
CREATE TABLE public.chamadas_recebidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telefone TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id),
  cliente_nome TEXT,
  tipo TEXT NOT NULL DEFAULT 'telefone' CHECK (tipo IN ('telefone', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'recebida' CHECK (status IN ('recebida', 'atendida', 'perdida', 'retornar')),
  atendente_id UUID,
  duracao_segundos INTEGER,
  observacoes TEXT,
  pedido_gerado_id UUID REFERENCES public.pedidos(id),
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chamadas_recebidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chamadas_select" ON public.chamadas_recebidas FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "chamadas_insert" ON public.chamadas_recebidas FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "chamadas_update" ON public.chamadas_recebidas FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE INDEX idx_chamadas_telefone ON public.chamadas_recebidas(telefone);
CREATE INDEX idx_chamadas_cliente ON public.chamadas_recebidas(cliente_id);
CREATE INDEX idx_chamadas_created ON public.chamadas_recebidas(created_at DESC);

CREATE TRIGGER update_chamadas_updated_at BEFORE UPDATE ON public.chamadas_recebidas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. DEVOLUÇÕES E TROCAS
-- =============================================
CREATE TABLE public.devolucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id),
  cliente_id UUID REFERENCES public.clientes(id),
  cliente_nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'devolucao' CHECK (tipo IN ('devolucao', 'troca', 'estorno')),
  motivo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'recusada', 'concluida')),
  valor_total NUMERIC NOT NULL DEFAULT 0,
  aprovado_por UUID,
  data_aprovacao TIMESTAMPTZ,
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.devolucao_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devolucao_id UUID NOT NULL REFERENCES public.devolucoes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  motivo_item TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.devolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devolucao_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devolucoes_select" ON public.devolucoes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "devolucoes_insert" ON public.devolucoes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "devolucoes_update" ON public.devolucoes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "devolucao_itens_select" ON public.devolucao_itens FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "devolucao_itens_insert" ON public.devolucao_itens FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE TRIGGER update_devolucoes_updated_at BEFORE UPDATE ON public.devolucoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. CONTRATOS RECORRENTES / ASSINATURAS
-- =============================================
CREATE TABLE public.contratos_recorrentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  cliente_nome TEXT NOT NULL,
  produto_id UUID REFERENCES public.produtos(id),
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  frequencia TEXT NOT NULL DEFAULT 'semanal' CHECK (frequencia IN ('semanal', 'quinzenal', 'mensal', 'bimestral')),
  dia_preferencial INTEGER,
  turno_preferencial TEXT CHECK (turno_preferencial IN ('manha', 'tarde', 'noite')),
  proxima_entrega DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'cancelado', 'encerrado')),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  entregas_realizadas INTEGER NOT NULL DEFAULT 0,
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contratos_recorrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contratos_select" ON public.contratos_recorrentes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "contratos_insert" ON public.contratos_recorrentes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "contratos_update" ON public.contratos_recorrentes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "contratos_delete" ON public.contratos_recorrentes FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE INDEX idx_contratos_cliente ON public.contratos_recorrentes(cliente_id);
CREATE INDEX idx_contratos_proxima ON public.contratos_recorrentes(proxima_entrega);
CREATE INDEX idx_contratos_status ON public.contratos_recorrentes(status);

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos_recorrentes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chamadas (caller ID popup)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamadas_recebidas;
