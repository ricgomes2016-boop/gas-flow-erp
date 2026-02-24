
-- Junction table: clientes <-> unidades (many-to-many)
CREATE TABLE public.cliente_unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  unidade_id UUID NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, unidade_id)
);

-- Index for fast lookups
CREATE INDEX idx_cliente_unidades_unidade ON public.cliente_unidades(unidade_id);
CREATE INDEX idx_cliente_unidades_cliente ON public.cliente_unidades(cliente_id);

-- Enable RLS
ALTER TABLE public.cliente_unidades ENABLE ROW LEVEL SECURITY;

-- RLS: users can see cliente_unidades for their empresa's unidades
CREATE POLICY "Users can view cliente_unidades for their unidades"
ON public.cliente_unidades FOR SELECT
USING (
  unidade_id IN (
    SELECT id FROM public.unidades WHERE empresa_id = public.get_user_empresa_id()
  )
);

-- RLS: admin/gestor can insert
CREATE POLICY "Staff can insert cliente_unidades"
ON public.cliente_unidades FOR INSERT
WITH CHECK (
  unidade_id IN (
    SELECT id FROM public.unidades WHERE empresa_id = public.get_user_empresa_id()
  )
);

-- RLS: admin/gestor can delete
CREATE POLICY "Staff can delete cliente_unidades"
ON public.cliente_unidades FOR DELETE
USING (
  unidade_id IN (
    SELECT id FROM public.unidades WHERE empresa_id = public.get_user_empresa_id()
  )
);

-- Populate: associate all existing clients with all active unidades of each empresa
-- Since clientes don't have empresa_id, we associate them with all unidades
-- (the user will clean up later or we base it on pedidos)
INSERT INTO public.cliente_unidades (cliente_id, unidade_id)
SELECT DISTINCT c.id, u.id
FROM public.clientes c
CROSS JOIN public.unidades u
WHERE u.ativo = true
  AND EXISTS (
    SELECT 1 FROM public.pedidos p 
    WHERE p.cliente_id = c.id AND p.unidade_id = u.id
  )
ON CONFLICT DO NOTHING;

-- Also add clients that have no pedidos to the first active unidade
INSERT INTO public.cliente_unidades (cliente_id, unidade_id)
SELECT c.id, (SELECT id FROM public.unidades WHERE ativo = true ORDER BY tipo, nome LIMIT 1)
FROM public.clientes c
WHERE NOT EXISTS (SELECT 1 FROM public.cliente_unidades cu WHERE cu.cliente_id = c.id)
  AND (SELECT id FROM public.unidades WHERE ativo = true ORDER BY tipo, nome LIMIT 1) IS NOT NULL
ON CONFLICT DO NOTHING;
