
-- Vale Gás Parceiros
CREATE TABLE public.vale_gas_parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  tipo text NOT NULL DEFAULT 'prepago' CHECK (tipo IN ('prepago', 'consignado')),
  ativo boolean NOT NULL DEFAULT true,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vale Gás Lotes
CREATE TABLE public.vale_gas_lotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.vale_gas_parceiros(id),
  quantidade integer NOT NULL,
  valor_unitario numeric NOT NULL,
  valor_total numeric NOT NULL,
  numero_inicial integer NOT NULL,
  numero_final integer NOT NULL,
  descricao text DEFAULT 'VALE GÁS',
  cliente_id uuid REFERENCES public.clientes(id),
  cliente_nome text,
  produto_id uuid REFERENCES public.produtos(id),
  produto_nome text,
  data_vencimento_pagamento date,
  status_pagamento text NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'parcial')),
  valor_pago numeric NOT NULL DEFAULT 0,
  gerar_conta_receber boolean DEFAULT false,
  observacao text,
  cancelado boolean NOT NULL DEFAULT false,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vale Gás Individual
CREATE TABLE public.vale_gas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL,
  codigo text NOT NULL,
  valor numeric NOT NULL,
  parceiro_id uuid NOT NULL REFERENCES public.vale_gas_parceiros(id),
  lote_id uuid NOT NULL REFERENCES public.vale_gas_lotes(id),
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido', 'utilizado', 'cancelado')),
  descricao text,
  cliente_id uuid REFERENCES public.clientes(id),
  cliente_nome text,
  produto_id uuid REFERENCES public.produtos(id),
  produto_nome text,
  consumidor_nome text,
  consumidor_endereco text,
  consumidor_telefone text,
  data_utilizacao timestamptz,
  entregador_id uuid REFERENCES public.entregadores(id),
  entregador_nome text,
  venda_id uuid REFERENCES public.pedidos(id),
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vale Gás Acertos
CREATE TABLE public.vale_gas_acertos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id uuid NOT NULL REFERENCES public.vale_gas_parceiros(id),
  parceiro_nome text NOT NULL,
  data_acerto timestamptz NOT NULL DEFAULT now(),
  quantidade integer NOT NULL,
  valor_total numeric NOT NULL,
  status_pagamento text NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago')),
  data_pagamento timestamptz,
  forma_pagamento text,
  observacao text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de vínculo entre acerto e vales
CREATE TABLE public.vale_gas_acerto_vales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acerto_id uuid NOT NULL REFERENCES public.vale_gas_acertos(id) ON DELETE CASCADE,
  vale_id uuid NOT NULL REFERENCES public.vale_gas(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_vale_gas_parceiro ON public.vale_gas(parceiro_id);
CREATE INDEX idx_vale_gas_status ON public.vale_gas(status);
CREATE INDEX idx_vale_gas_numero ON public.vale_gas(numero);
CREATE INDEX idx_vale_gas_codigo ON public.vale_gas(codigo);
CREATE INDEX idx_vale_gas_lote ON public.vale_gas(lote_id);
CREATE INDEX idx_vale_gas_lotes_parceiro ON public.vale_gas_lotes(parceiro_id);
CREATE INDEX idx_vale_gas_acertos_parceiro ON public.vale_gas_acertos(parceiro_id);

-- Enable RLS
ALTER TABLE public.vale_gas_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vale_gas_lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vale_gas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vale_gas_acertos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vale_gas_acerto_vales ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Staff can manage
CREATE POLICY "Staff can manage vale_gas_parceiros" ON public.vale_gas_parceiros FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view vale_gas_parceiros" ON public.vale_gas_parceiros FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage vale_gas_lotes" ON public.vale_gas_lotes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view vale_gas_lotes" ON public.vale_gas_lotes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage vale_gas" ON public.vale_gas FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view vale_gas" ON public.vale_gas FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Entregadores can view and validate vales assigned to them or available
CREATE POLICY "Entregadores can view vale_gas" ON public.vale_gas FOR SELECT
  USING (has_role(auth.uid(), 'entregador'::app_role));

CREATE POLICY "Entregadores can update vale_gas" ON public.vale_gas FOR UPDATE
  USING (has_role(auth.uid(), 'entregador'::app_role));

CREATE POLICY "Staff can manage vale_gas_acertos" ON public.vale_gas_acertos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view vale_gas_acertos" ON public.vale_gas_acertos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can manage vale_gas_acerto_vales" ON public.vale_gas_acerto_vales FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view vale_gas_acerto_vales" ON public.vale_gas_acerto_vales FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_vale_gas_parceiros_updated_at BEFORE UPDATE ON public.vale_gas_parceiros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vale_gas_lotes_updated_at BEFORE UPDATE ON public.vale_gas_lotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vale_gas_updated_at BEFORE UPDATE ON public.vale_gas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vale_gas_acertos_updated_at BEFORE UPDATE ON public.vale_gas_acertos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
