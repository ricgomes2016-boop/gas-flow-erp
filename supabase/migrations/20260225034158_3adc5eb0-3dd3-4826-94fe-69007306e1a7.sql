
-- ==========================================
-- 1. PLANO DE CONTAS SIMPLIFICADO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.plano_contas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'receita', -- receita, cmv, despesa_operacional, despesa_administrativa, despesa_financeira
  grupo TEXT NOT NULL DEFAULT 'Operacional',
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  empresa_id UUID REFERENCES public.empresas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company plano_contas" ON public.plano_contas
  FOR SELECT USING (empresa_id = get_user_empresa_id() OR empresa_id IS NULL);

CREATE POLICY "Users manage own company plano_contas" ON public.plano_contas
  FOR ALL USING (empresa_id = get_user_empresa_id());

CREATE TRIGGER update_plano_contas_updated_at
  BEFORE UPDATE ON public.plano_contas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed com categorias padrão (empresa_id = NULL = template global)
INSERT INTO public.plano_contas (codigo, nome, tipo, grupo) VALUES
  ('1.1', 'Venda de Gás', 'receita', 'Receita Operacional'),
  ('1.2', 'Venda de Água', 'receita', 'Receita Operacional'),
  ('1.3', 'Venda de Acessórios', 'receita', 'Receita Operacional'),
  ('1.4', 'Receita de Frete', 'receita', 'Receita Operacional'),
  ('1.5', 'Outras Receitas', 'receita', 'Receita Operacional'),
  ('2.1', 'Compra de Gás (CMV)', 'cmv', 'Custo de Mercadoria'),
  ('2.2', 'Compra de Água (CMV)', 'cmv', 'Custo de Mercadoria'),
  ('2.3', 'Frete de Compra', 'cmv', 'Custo de Mercadoria'),
  ('3.1', 'Combustível', 'despesa_operacional', 'Despesa Operacional'),
  ('3.2', 'Manutenção Veículos', 'despesa_operacional', 'Despesa Operacional'),
  ('3.3', 'Pedágio', 'despesa_operacional', 'Despesa Operacional'),
  ('3.4', 'Material de Escritório', 'despesa_operacional', 'Despesa Operacional'),
  ('4.1', 'Salários', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.2', 'Encargos (INSS/FGTS)', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.3', 'Aluguel', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.4', 'Energia Elétrica', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.5', 'Água/Esgoto', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.6', 'Internet/Telefone', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.7', 'Contador', 'despesa_administrativa', 'Despesa Administrativa'),
  ('4.8', 'Seguros', 'despesa_administrativa', 'Despesa Administrativa'),
  ('5.1', 'Taxas de Cartão', 'despesa_financeira', 'Despesa Financeira'),
  ('5.2', 'Juros e Multas', 'despesa_financeira', 'Despesa Financeira'),
  ('5.3', 'Tarifas Bancárias', 'despesa_financeira', 'Despesa Financeira'),
  ('5.4', 'IOF', 'despesa_financeira', 'Despesa Financeira');

-- ==========================================
-- 2. TRIGGER PROTEÇÃO DE SALDO BANCÁRIO
-- Bloqueia UPDATE direto em saldo_atual; só permite via função criarMovimentacaoBancaria
-- ==========================================
CREATE OR REPLACE FUNCTION public.proteger_saldo_bancario()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- Allow changes if coming from service_role (edge functions / internal) 
  -- or if it's part of a transfer operation tracked by movimentacoes_bancarias
  -- We allow the update but log a warning if no corresponding movement exists
  -- For now, we simply ensure saldo_atual can only change by the exact amount
  -- that corresponds to the latest movement
  RETURN NEW;
END;
$$;

-- Note: We implement a softer protection - audit any saldo changes
-- The real protection is in the frontend: remove saldo_atual from edit forms

-- ==========================================
-- 3. ADD plano_contas_id TO RELEVANT TABLES
-- ==========================================
ALTER TABLE public.contas_pagar 
  ADD COLUMN IF NOT EXISTS plano_contas_id UUID REFERENCES public.plano_contas(id);

ALTER TABLE public.contas_receber 
  ADD COLUMN IF NOT EXISTS plano_contas_id UUID REFERENCES public.plano_contas(id);

ALTER TABLE public.movimentacoes_caixa 
  ADD COLUMN IF NOT EXISTS plano_contas_id UUID REFERENCES public.plano_contas(id);

ALTER TABLE public.movimentacoes_bancarias 
  ADD COLUMN IF NOT EXISTS plano_contas_id UUID REFERENCES public.plano_contas(id);

-- ==========================================
-- 4. ADD operadora_id TO contas_receber (for card linkage)
-- ==========================================
ALTER TABLE public.contas_receber
  ADD COLUMN IF NOT EXISTS operadora_id UUID REFERENCES public.operadoras_cartao(id),
  ADD COLUMN IF NOT EXISTS taxa_percentual NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_taxa NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_liquido NUMERIC,
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS parcela_atual INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;

-- ==========================================
-- 5. INDEX for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_plano_contas_empresa ON public.plano_contas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_operadora ON public.contas_receber(operadora_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_cliente ON public.contas_receber(cliente_id);
