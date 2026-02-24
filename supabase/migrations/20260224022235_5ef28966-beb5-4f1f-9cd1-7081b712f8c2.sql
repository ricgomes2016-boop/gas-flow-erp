
-- =============================================================
-- FASE 1: Isolamento multi-tenant completo (corrigido)
-- =============================================================

-- 1. Adicionar empresa_id à tabela clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id);

-- Preencher empresa_id dos clientes existentes via cliente_unidades
UPDATE public.clientes c
SET empresa_id = sub.empresa_id
FROM (
  SELECT DISTINCT ON (cu.cliente_id) cu.cliente_id, u.empresa_id
  FROM public.cliente_unidades cu
  JOIN public.unidades u ON u.id = cu.unidade_id
  WHERE u.empresa_id IS NOT NULL
  ORDER BY cu.cliente_id, cu.created_at ASC
) sub
WHERE c.id = sub.cliente_id AND c.empresa_id IS NULL;

-- Clientes órfãos: associar via pedidos
UPDATE public.clientes c
SET empresa_id = sub.empresa_id
FROM (
  SELECT DISTINCT ON (p.cliente_id) p.cliente_id, u.empresa_id
  FROM public.pedidos p
  JOIN public.unidades u ON u.id = p.unidade_id
  WHERE u.empresa_id IS NOT NULL AND p.cliente_id IS NOT NULL
  ORDER BY p.cliente_id, p.created_at DESC
) sub
WHERE c.id = sub.cliente_id AND c.empresa_id IS NULL;

-- Clientes restantes: associar à primeira empresa ativa
UPDATE public.clientes c
SET empresa_id = (SELECT id FROM public.empresas WHERE ativo = true ORDER BY created_at ASC LIMIT 1)
WHERE c.empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON public.clientes(empresa_id);

-- 2. Adicionar empresa_id a cliente_tags
ALTER TABLE public.cliente_tags ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id);

UPDATE public.cliente_tags t
SET empresa_id = sub.empresa_id
FROM (
  SELECT DISTINCT ON (cta.tag_id) cta.tag_id, c.empresa_id
  FROM public.cliente_tag_associacoes cta
  JOIN public.clientes c ON c.id = cta.cliente_id
  WHERE c.empresa_id IS NOT NULL
  ORDER BY cta.tag_id, cta.created_at ASC
) sub
WHERE t.id = sub.tag_id AND t.empresa_id IS NULL;

UPDATE public.cliente_tags t
SET empresa_id = (SELECT id FROM public.empresas WHERE ativo = true ORDER BY created_at ASC LIMIT 1)
WHERE t.empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_cliente_tags_empresa_id ON public.cliente_tags(empresa_id);

-- 3. Adicionar empresa_id a conquistas
ALTER TABLE public.conquistas ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id);

UPDATE public.conquistas
SET empresa_id = (SELECT id FROM public.empresas WHERE ativo = true ORDER BY created_at ASC LIMIT 1)
WHERE empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_conquistas_empresa_id ON public.conquistas(empresa_id);

-- 4. Índices compostos para performance (somente colunas que existem)
CREATE INDEX IF NOT EXISTS idx_pedidos_unidade_status ON public.pedidos(unidade_id, status);
CREATE INDEX IF NOT EXISTS idx_pedidos_unidade_created ON public.pedidos(unidade_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_created ON public.pedidos(cliente_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_unidade_status ON public.contas_pagar(unidade_id, status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_unidade_status ON public.contas_receber(unidade_id, status);
CREATE INDEX IF NOT EXISTS idx_cliente_unidades_cliente ON public.cliente_unidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_unidades_unidade ON public.cliente_unidades(unidade_id);

-- 5. Atualizar RLS na tabela clientes para usar empresa_id
DROP POLICY IF EXISTS "Staff can view all clientes" ON public.clientes;
DROP POLICY IF EXISTS "Staff can insert clientes" ON public.clientes;
DROP POLICY IF EXISTS "Staff can update clientes" ON public.clientes;
DROP POLICY IF EXISTS "Staff can delete clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes podem ver seus dados" ON public.clientes;

CREATE POLICY "Staff can view clientes of their empresa"
ON public.clientes FOR SELECT TO authenticated
USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can insert clientes in their empresa"
ON public.clientes FOR INSERT TO authenticated
WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can update clientes of their empresa"
ON public.clientes FOR UPDATE TO authenticated
USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can delete clientes of their empresa"
ON public.clientes FOR DELETE TO authenticated
USING (empresa_id = public.get_user_empresa_id());

-- 6. RLS para cliente_tags isolada por empresa
DROP POLICY IF EXISTS "Anyone can view tags" ON public.cliente_tags;
DROP POLICY IF EXISTS "Staff can manage tags" ON public.cliente_tags;
DROP POLICY IF EXISTS "Staff can view tags" ON public.cliente_tags;
DROP POLICY IF EXISTS "Staff can insert tags" ON public.cliente_tags;
DROP POLICY IF EXISTS "Staff can update tags" ON public.cliente_tags;
DROP POLICY IF EXISTS "Staff can delete tags" ON public.cliente_tags;

CREATE POLICY "Staff can view tags of their empresa"
ON public.cliente_tags FOR SELECT TO authenticated
USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can insert tags in their empresa"
ON public.cliente_tags FOR INSERT TO authenticated
WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can update tags of their empresa"
ON public.cliente_tags FOR UPDATE TO authenticated
USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can delete tags of their empresa"
ON public.cliente_tags FOR DELETE TO authenticated
USING (empresa_id = public.get_user_empresa_id());

-- 7. RLS para conquistas isolada por empresa
DROP POLICY IF EXISTS "Anyone can view conquistas" ON public.conquistas;
DROP POLICY IF EXISTS "Conquistas are viewable by everyone" ON public.conquistas;

CREATE POLICY "Staff can view conquistas of their empresa"
ON public.conquistas FOR SELECT TO authenticated
USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Staff can manage conquistas of their empresa"
ON public.conquistas FOR ALL TO authenticated
USING (empresa_id = public.get_user_empresa_id())
WITH CHECK (empresa_id = public.get_user_empresa_id());
