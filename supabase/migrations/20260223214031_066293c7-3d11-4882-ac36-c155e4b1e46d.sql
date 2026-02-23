
-- =============================================
-- FASE 1: Estrutura Multi-Tenant (SaaS)
-- =============================================

-- 1. Tabela principal de empresas (tenants)
CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  logo_url TEXT,
  plano TEXT NOT NULL DEFAULT 'starter',
  plano_max_unidades INT NOT NULL DEFAULT 1,
  plano_max_usuarios INT NOT NULL DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Adicionar empresa_id nas tabelas-chave
ALTER TABLE public.unidades ADD COLUMN empresa_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.profiles ADD COLUMN empresa_id UUID REFERENCES public.empresas(id);

-- 3. Índices para performance
CREATE INDEX idx_unidades_empresa_id ON public.unidades(empresa_id);
CREATE INDEX idx_profiles_empresa_id ON public.profiles(empresa_id);
CREATE INDEX idx_empresas_slug ON public.empresas(slug);

-- 4. Trigger de updated_at
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Função helper: retorna empresa_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- 6. Função helper: verifica se user pertence à empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_empresa(_user_id UUID, _empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND empresa_id = _empresa_id
  )
$$;

-- 7. RLS na tabela empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own empresa"
  ON public.empresas FOR SELECT
  USING (id = public.get_user_empresa_id());

CREATE POLICY "Admins can update their empresa"
  ON public.empresas FOR UPDATE
  USING (
    id = public.get_user_empresa_id()
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Anyone can insert empresa (onboarding)"
  ON public.empresas FOR INSERT
  WITH CHECK (true);

-- 8. Atualizar RLS de unidades para filtrar por empresa
-- Primeiro remover policies existentes de unidades que conflitam
DROP POLICY IF EXISTS "Admins e gestores podem ver todas unidades" ON public.unidades;
DROP POLICY IF EXISTS "Users can view assigned unidades" ON public.unidades;
DROP POLICY IF EXISTS "Admins can insert unidades" ON public.unidades;
DROP POLICY IF EXISTS "Admins can update unidades" ON public.unidades;
DROP POLICY IF EXISTS "Admins can delete unidades" ON public.unidades;
DROP POLICY IF EXISTS "Staff can view active unidades" ON public.unidades;
DROP POLICY IF EXISTS "Clientes podem ver unidades ativas" ON public.unidades;
DROP POLICY IF EXISTS "Entregadores podem ver unidades" ON public.unidades;

-- Recriar com filtro de empresa
CREATE POLICY "Staff can view empresa unidades"
  ON public.unidades FOR SELECT
  USING (
    empresa_id = public.get_user_empresa_id()
    OR empresa_id IS NULL
  );

CREATE POLICY "Admins can insert unidades"
  ON public.unidades FOR INSERT
  WITH CHECK (
    empresa_id = public.get_user_empresa_id()
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update unidades"
  ON public.unidades FOR UPDATE
  USING (
    empresa_id = public.get_user_empresa_id()
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete unidades"
  ON public.unidades FOR DELETE
  USING (
    empresa_id = public.get_user_empresa_id()
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 9. Atualizar handle_new_user para incluir empresa_id
-- (não precisa aqui pois o onboarding seta via código)

-- 10. Publicar empresas no realtime para updates em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.empresas;
