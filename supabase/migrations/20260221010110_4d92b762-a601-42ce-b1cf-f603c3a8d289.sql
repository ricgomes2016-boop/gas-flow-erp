
-- Tabela de orçamentos
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero SERIAL,
  cliente_id UUID REFERENCES public.clientes(id),
  cliente_nome TEXT NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  validade DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  desconto NUMERIC DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_by UUID,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Itens do orçamento
CREATE TABLE public.orcamento_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  descricao TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 1,
  preco_unitario NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff pode ver orcamentos" ON public.orcamentos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff pode criar orcamentos" ON public.orcamentos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff pode editar orcamentos" ON public.orcamentos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff pode deletar orcamentos" ON public.orcamentos FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Staff pode ver itens orcamento" ON public.orcamento_itens FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orcamentos o WHERE o.id = orcamento_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role))));

CREATE POLICY "Staff pode gerenciar itens orcamento" ON public.orcamento_itens FOR ALL
  USING (EXISTS (SELECT 1 FROM public.orcamentos o WHERE o.id = orcamento_id AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role))));

-- Trigger updated_at
CREATE TRIGGER update_orcamentos_updated_at
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
