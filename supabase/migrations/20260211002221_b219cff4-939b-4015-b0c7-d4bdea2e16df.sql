
-- Tabela de Contas a Pagar
CREATE TABLE public.contas_pagar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  categoria TEXT,
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contas_pagar"
  ON public.contas_pagar FOR SELECT USING (true);

CREATE POLICY "Staff can manage contas_pagar"
  ON public.contas_pagar FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_contas_pagar_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de Contas a Receber
CREATE TABLE public.contas_receber (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  forma_pagamento TEXT,
  pedido_id UUID REFERENCES public.pedidos(id),
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contas_receber"
  ON public.contas_receber FOR SELECT USING (true);

CREATE POLICY "Staff can manage contas_receber"
  ON public.contas_receber FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

CREATE TRIGGER update_contas_receber_updated_at
  BEFORE UPDATE ON public.contas_receber
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de Movimentações de Caixa (para Caixa do Dia, Fluxo de Caixa, Despesas)
CREATE TABLE public.movimentacoes_caixa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT,
  status TEXT NOT NULL DEFAULT 'aprovada',
  responsavel TEXT,
  solicitante TEXT,
  urgencia TEXT DEFAULT 'media',
  pedido_id UUID REFERENCES public.pedidos(id),
  unidade_id UUID REFERENCES public.unidades(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.movimentacoes_caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view movimentacoes_caixa"
  ON public.movimentacoes_caixa FOR SELECT USING (true);

CREATE POLICY "Staff can manage movimentacoes_caixa"
  ON public.movimentacoes_caixa FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro') OR has_role(auth.uid(), 'operacional'));
  
CREATE TRIGGER update_movimentacoes_caixa_updated_at
  BEFORE UPDATE ON public.movimentacoes_caixa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
