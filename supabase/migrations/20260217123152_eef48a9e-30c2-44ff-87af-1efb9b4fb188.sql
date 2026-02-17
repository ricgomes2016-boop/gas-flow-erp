
-- Tabela de operadoras/bandeiras com taxas e prazos
CREATE TABLE public.operadoras_cartao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  bandeira TEXT, -- Visa, Mastercard, Elo, etc. (null = todas)
  taxa_debito NUMERIC NOT NULL DEFAULT 0,
  taxa_credito_vista NUMERIC NOT NULL DEFAULT 0,
  taxa_credito_parcelado NUMERIC NOT NULL DEFAULT 0,
  prazo_debito INTEGER NOT NULL DEFAULT 1, -- D+1
  prazo_credito INTEGER NOT NULL DEFAULT 30, -- D+30
  ativo BOOLEAN NOT NULL DEFAULT true,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operadoras_cartao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage operadoras_cartao"
  ON public.operadoras_cartao FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view operadoras_cartao"
  ON public.operadoras_cartao FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Tabela de conferência de cartão (cada venda no cartão gera um registro)
CREATE TABLE public.conferencia_cartao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id),
  operadora_id UUID REFERENCES public.operadoras_cartao(id),
  tipo TEXT NOT NULL DEFAULT 'credito', -- credito, debito
  bandeira TEXT,
  valor_bruto NUMERIC NOT NULL DEFAULT 0,
  taxa_percentual NUMERIC NOT NULL DEFAULT 0,
  valor_taxa NUMERIC NOT NULL DEFAULT 0,
  valor_liquido_esperado NUMERIC NOT NULL DEFAULT 0,
  valor_liquido_recebido NUMERIC,
  data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
  data_prevista_deposito DATE,
  data_deposito_real DATE,
  nsu TEXT, -- Número Sequencial Único
  autorizacao TEXT,
  parcelas INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, confirmado, divergente
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conferencia_cartao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage conferencia_cartao"
  ON public.conferencia_cartao FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view conferencia_cartao"
  ON public.conferencia_cartao FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Índices
CREATE INDEX idx_conferencia_cartao_data ON public.conferencia_cartao(data_venda);
CREATE INDEX idx_conferencia_cartao_status ON public.conferencia_cartao(status);
CREATE INDEX idx_conferencia_cartao_unidade ON public.conferencia_cartao(unidade_id);
