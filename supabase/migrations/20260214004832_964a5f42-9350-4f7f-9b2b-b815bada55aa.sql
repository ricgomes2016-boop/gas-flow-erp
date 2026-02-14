
-- Extrato bancário para conciliação
CREATE TABLE public.extrato_bancario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'credito',
  conciliado BOOLEAN NOT NULL DEFAULT false,
  pedido_id UUID REFERENCES public.pedidos(id),
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.extrato_bancario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view extrato_bancario"
  ON public.extrato_bancario FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage extrato_bancario"
  ON public.extrato_bancario FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));

-- Documentos contábeis
CREATE TABLE public.documentos_contabeis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  periodo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  gerado_em TIMESTAMPTZ,
  arquivo_url TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_contabeis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documentos_contabeis"
  ON public.documentos_contabeis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage documentos_contabeis"
  ON public.documentos_contabeis FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro'));
