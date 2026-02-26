
-- Tabela para registrar pagamentos via maquininha PagBank (PlugPag SDK)
CREATE TABLE public.pagamentos_cartao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id),
  loja_id UUID REFERENCES public.unidades(id),
  entregador_id UUID REFERENCES public.entregadores(id),
  transaction_id TEXT NOT NULL UNIQUE,
  nsu TEXT,
  autorizacao TEXT,
  bandeira TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('debito', 'credito')),
  parcelas INTEGER NOT NULL DEFAULT 1,
  valor_bruto NUMERIC(12,2) NOT NULL,
  valor_taxa NUMERIC(12,2) DEFAULT 0,
  valor_liquido NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aguardando_maquina',
  data_prevista_liquidacao DATE,
  liquidado BOOLEAN NOT NULL DEFAULT false,
  data_liquidacao DATE,
  conta_receber_id UUID REFERENCES public.contas_receber(id),
  maquininha_serial TEXT,
  empresa_id UUID REFERENCES public.empresas(id),
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_pagamentos_cartao_pedido ON public.pagamentos_cartao(pedido_id);
CREATE INDEX idx_pagamentos_cartao_entregador ON public.pagamentos_cartao(entregador_id);
CREATE INDEX idx_pagamentos_cartao_loja ON public.pagamentos_cartao(loja_id);
CREATE INDEX idx_pagamentos_cartao_status ON public.pagamentos_cartao(status);
CREATE INDEX idx_pagamentos_cartao_liquidacao ON public.pagamentos_cartao(data_prevista_liquidacao) WHERE liquidado = false;
CREATE INDEX idx_pagamentos_cartao_empresa ON public.pagamentos_cartao(empresa_id);

-- Trigger updated_at
CREATE TRIGGER update_pagamentos_cartao_updated_at
  BEFORE UPDATE ON public.pagamentos_cartao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.pagamentos_cartao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver pagamentos da empresa"
  ON public.pagamentos_cartao FOR SELECT
  USING (
    empresa_id = public.get_user_empresa_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Service role insere pagamentos"
  ON public.pagamentos_cartao FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar pagamentos da empresa"
  ON public.pagamentos_cartao FOR UPDATE
  USING (
    empresa_id = public.get_user_empresa_id()
    OR public.has_role(auth.uid(), 'admin')
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pagamentos_cartao;

-- Audit trigger
CREATE TRIGGER audit_pagamentos_cartao
  AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos_cartao
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
