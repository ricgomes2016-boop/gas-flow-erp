
-- Tags para segmentação de clientes
CREATE TABLE public.cliente_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Associação muitos-para-muitos
CREATE TABLE public.cliente_tag_associacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.cliente_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, tag_id)
);

-- Observações internas do cliente
CREATE TABLE public.cliente_observacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.cliente_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_tag_associacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_observacoes ENABLE ROW LEVEL SECURITY;

-- Policies - acesso para usuários autenticados
CREATE POLICY "Authenticated users can manage tags" ON public.cliente_tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage tag associations" ON public.cliente_tag_associacoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage observations" ON public.cliente_observacoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger updated_at para observacoes
CREATE TRIGGER update_cliente_observacoes_updated_at
  BEFORE UPDATE ON public.cliente_observacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir tags padrão
INSERT INTO public.cliente_tags (nome, cor) VALUES
  ('VIP', '#eab308'),
  ('Novo', '#22c55e'),
  ('Inadimplente', '#ef4444'),
  ('Fidelizado', '#8b5cf6'),
  ('Inativo', '#6b7280'),
  ('Corporativo', '#3b82f6');
