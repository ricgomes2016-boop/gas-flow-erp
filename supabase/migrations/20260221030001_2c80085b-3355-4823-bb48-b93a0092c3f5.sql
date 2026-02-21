
-- Tabela de movimentações bancárias (extrato real por conta)
CREATE TABLE public.movimentacoes_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conta_bancaria_id UUID NOT NULL REFERENCES public.contas_bancarias(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL DEFAULT 'manual',
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  saldo_apos NUMERIC,
  referencia_id UUID,
  referencia_tipo TEXT,
  observacoes TEXT,
  user_id UUID,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_mov_bancarias_conta ON public.movimentacoes_bancarias(conta_bancaria_id, data DESC);
CREATE INDEX idx_mov_bancarias_data ON public.movimentacoes_bancarias(data DESC);

-- RLS
ALTER TABLE public.movimentacoes_bancarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view movimentacoes" ON public.movimentacoes_bancarias
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert movimentacoes" ON public.movimentacoes_bancarias
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update movimentacoes" ON public.movimentacoes_bancarias
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete movimentacoes" ON public.movimentacoes_bancarias
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Trigger updated_at
CREATE TRIGGER update_movimentacoes_bancarias_updated_at
  BEFORE UPDATE ON public.movimentacoes_bancarias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
