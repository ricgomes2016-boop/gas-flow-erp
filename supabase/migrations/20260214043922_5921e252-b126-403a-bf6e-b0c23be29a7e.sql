
-- Tabela para gerenciar canais de venda
CREATE TABLE public.canais_venda (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'fixo', -- 'fixo' ou 'parceiro_vale_gas'
  parceiro_id text, -- referência ao parceiro vale gás (se aplicável)
  ativo boolean NOT NULL DEFAULT true,
  descricao text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canais_venda ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Authenticated users can view canais_venda"
ON public.canais_venda FOR SELECT
USING (true);

CREATE POLICY "Staff can manage canais_venda"
ON public.canais_venda FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gestor'::app_role) OR 
  has_role(auth.uid(), 'operacional'::app_role)
);

-- Trigger para updated_at
CREATE TRIGGER update_canais_venda_updated_at
BEFORE UPDATE ON public.canais_venda
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir canais padrão
INSERT INTO public.canais_venda (nome, tipo, descricao) VALUES
  ('Telefone', 'fixo', 'Vendas realizadas por telefone'),
  ('WhatsApp', 'fixo', 'Vendas realizadas via WhatsApp'),
  ('Portaria', 'fixo', 'Vendas realizadas na portaria'),
  ('Balcão', 'fixo', 'Vendas realizadas no balcão'),
  ('Entregador', 'fixo', 'Vendas realizadas pelo entregador em rota');
