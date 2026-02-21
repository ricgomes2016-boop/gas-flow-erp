
-- 1. Adicionar campos de parcelamento em contas_pagar
ALTER TABLE public.contas_pagar
  ADD COLUMN IF NOT EXISTS parcela_numero INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parcela_total INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grupo_parcela_id UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT NULL; -- 'manual', 'emprestimo', 'cartao_credito'

-- 2. Tabela de empréstimos
CREATE TABLE public.emprestimos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  valor_total NUMERIC NOT NULL,
  taxa_juros NUMERIC NOT NULL DEFAULT 0,
  num_parcelas INT NOT NULL DEFAULT 1,
  tipo_amortizacao TEXT NOT NULL DEFAULT 'price', -- 'price' ou 'sac'
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage emprestimos" ON public.emprestimos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_emprestimos_updated_at BEFORE UPDATE ON public.emprestimos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Tabela de faturas de cartão de crédito corporativo
CREATE TABLE public.faturas_cartao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cartao_nome TEXT NOT NULL,
  bandeira TEXT DEFAULT 'Visa',
  ultimos_digitos TEXT,
  mes_referencia TEXT NOT NULL, -- '2026-02'
  vencimento DATE NOT NULL,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aberta', -- 'aberta', 'paga', 'parcial'
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faturas_cartao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage faturas_cartao" ON public.faturas_cartao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_faturas_cartao_updated_at BEFORE UPDATE ON public.faturas_cartao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Itens da fatura do cartão
CREATE TABLE public.fatura_cartao_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatura_id UUID NOT NULL REFERENCES public.faturas_cartao(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  parcela_atual INT DEFAULT 1,
  parcela_total INT DEFAULT 1,
  categoria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fatura_cartao_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage fatura_itens" ON public.fatura_cartao_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX idx_contas_pagar_grupo_parcela ON public.contas_pagar(grupo_parcela_id);
CREATE INDEX idx_emprestimos_status ON public.emprestimos(status);
CREATE INDEX idx_faturas_cartao_mes ON public.faturas_cartao(mes_referencia);
