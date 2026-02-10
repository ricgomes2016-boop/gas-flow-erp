-- Criar tabela de fornecedores
CREATE TABLE public.fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT,
  inscricao_estadual TEXT,
  tipo TEXT DEFAULT 'gas',
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  contato_nome TEXT,
  contato_cargo TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de compras
CREATE TABLE public.compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  unidade_id UUID REFERENCES public.unidades(id),
  valor_total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  data_prevista TIMESTAMP WITH TIME ZONE,
  data_recebimento TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens de compra
CREATE TABLE public.compra_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compra_id UUID NOT NULL REFERENCES public.compras(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compra_itens ENABLE ROW LEVEL SECURITY;

-- Policies para fornecedores
CREATE POLICY "Authenticated users can view fornecedores"
ON public.fornecedores FOR SELECT
USING (true);

CREATE POLICY "Staff can manage fornecedores"
ON public.fornecedores FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- Policies para compras
CREATE POLICY "Authenticated users can view compras"
ON public.compras FOR SELECT
USING (true);

CREATE POLICY "Staff can manage compras"
ON public.compras FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Policies para compra_itens
CREATE POLICY "Authenticated users can view compra_itens"
ON public.compra_itens FOR SELECT
USING (true);

CREATE POLICY "Staff can manage compra_itens"
ON public.compra_itens FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Criar índices
CREATE INDEX idx_compras_fornecedor ON public.compras(fornecedor_id);
CREATE INDEX idx_compras_unidade ON public.compras(unidade_id);
CREATE INDEX idx_compras_status ON public.compras(status);
CREATE INDEX idx_compra_itens_compra ON public.compra_itens(compra_id);

-- Triggers para updated_at
CREATE TRIGGER update_fornecedores_updated_at
BEFORE UPDATE ON public.fornecedores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compras_updated_at
BEFORE UPDATE ON public.compras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();