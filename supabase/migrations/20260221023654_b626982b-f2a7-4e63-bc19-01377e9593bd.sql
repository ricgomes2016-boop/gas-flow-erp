
-- 1. Contas Bancárias
CREATE TABLE public.contas_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  nome TEXT NOT NULL,
  banco TEXT NOT NULL,
  agencia TEXT,
  conta TEXT,
  tipo TEXT NOT NULL DEFAULT 'corrente',
  saldo_inicial NUMERIC NOT NULL DEFAULT 0,
  saldo_atual NUMERIC NOT NULL DEFAULT 0,
  chave_pix TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestor gerencia contas bancárias"
ON public.contas_bancarias FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Financeiro visualiza contas bancárias"
ON public.contas_bancarias FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'financeiro') OR public.has_role(auth.uid(), 'operacional'));

CREATE TRIGGER update_contas_bancarias_updated_at
BEFORE UPDATE ON public.contas_bancarias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Transferências entre contas
CREATE TABLE public.transferencias_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conta_origem_id UUID NOT NULL REFERENCES public.contas_bancarias(id),
  conta_destino_id UUID NOT NULL REFERENCES public.contas_bancarias(id),
  valor NUMERIC NOT NULL,
  descricao TEXT,
  data_transferencia DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'confirmada',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transferencias_bancarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestor gerencia transferências"
ON public.transferencias_bancarias FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Financeiro visualiza transferências"
ON public.transferencias_bancarias FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_transferencias_updated_at
BEFORE UPDATE ON public.transferencias_bancarias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Controle de Cheques
CREATE TABLE public.cheques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  pedido_id UUID REFERENCES public.pedidos(id),
  cliente_id UUID REFERENCES public.clientes(id),
  numero_cheque TEXT NOT NULL,
  banco_emitente TEXT NOT NULL,
  agencia TEXT,
  conta TEXT,
  valor NUMERIC NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_compensacao DATE,
  status TEXT NOT NULL DEFAULT 'em_maos',
  motivo_devolucao TEXT,
  observacoes TEXT,
  depositado_em_conta_id UUID REFERENCES public.contas_bancarias(id),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestor/financeiro gerencia cheques"
ON public.cheques FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'financeiro'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Operacional visualiza cheques"
ON public.cheques FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'operacional'));

CREATE TRIGGER update_cheques_updated_at
BEFORE UPDATE ON public.cheques
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Vendas Antecipadas
CREATE TABLE public.vendas_antecipadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  cliente_id UUID REFERENCES public.clientes(id),
  cliente_nome TEXT NOT NULL,
  valor_pago NUMERIC NOT NULL,
  valor_utilizado NUMERIC NOT NULL DEFAULT 0,
  saldo_restante NUMERIC GENERATED ALWAYS AS (valor_pago - valor_utilizado) STORED,
  forma_pagamento TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
  data_validade DATE,
  pedido_utilizacao_id UUID REFERENCES public.pedidos(id),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendas_antecipadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestor/financeiro gerencia vendas antecipadas"
ON public.vendas_antecipadas FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'financeiro'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'financeiro'));

CREATE POLICY "Operacional visualiza vendas antecipadas"
ON public.vendas_antecipadas FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'operacional'));

CREATE TRIGGER update_vendas_antecipadas_updated_at
BEFORE UPDATE ON public.vendas_antecipadas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Agendamento no pedido
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS data_agendamento TIMESTAMPTZ;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS agendado BOOLEAN NOT NULL DEFAULT false;
