
-- Tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS public.cupons_desconto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'percentual', -- 'percentual' | 'fixo'
  valor NUMERIC NOT NULL DEFAULT 10,
  valor_minimo NUMERIC NOT NULL DEFAULT 0,
  limite_uso INTEGER,
  usos INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  validade DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cupons_desconto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e gestores gerenciam cupons"
  ON public.cupons_desconto FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Clientes podem ler cupons ativos"
  ON public.cupons_desconto FOR SELECT
  USING (ativo = true);

-- Tabela de promoções
CREATE TABLE IF NOT EXISTS public.promocoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'desconto_percentual', -- 'desconto_percentual' | 'desconto_fixo' | 'frete_gratis' | 'brinde'
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativa', -- 'ativa' | 'pausada' | 'encerrada'
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e gestores gerenciam promocoes"
  ON public.promocoes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Clientes podem ler promocoes ativas"
  ON public.promocoes FOR SELECT
  USING (status = 'ativa');

-- Triggers updated_at
CREATE TRIGGER update_cupons_desconto_updated_at
  BEFORE UPDATE ON public.cupons_desconto
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promocoes_updated_at
  BEFORE UPDATE ON public.promocoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
