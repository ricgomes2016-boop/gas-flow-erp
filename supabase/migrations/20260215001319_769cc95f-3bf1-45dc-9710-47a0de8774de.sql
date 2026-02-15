
-- 1. Tabela de associação usuário <-> unidades
CREATE TABLE public.user_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unidade_id uuid NOT NULL REFERENCES public.unidades(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, unidade_id)
);

ALTER TABLE public.user_unidades ENABLE ROW LEVEL SECURITY;

-- Admins/gestores podem gerenciar
CREATE POLICY "Admin/Gestor can manage user_unidades"
  ON public.user_unidades FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- Usuários podem ver suas próprias associações
CREATE POLICY "Users can view own unidades"
  ON public.user_unidades FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Adicionar unidade_id a veiculos
ALTER TABLE public.veiculos ADD COLUMN unidade_id uuid REFERENCES public.unidades(id);

-- 3. Adicionar unidade_id a funcionarios
ALTER TABLE public.funcionarios ADD COLUMN unidade_id uuid REFERENCES public.unidades(id);

-- 4. Adicionar unidade_id a entregadores (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entregadores' AND column_name = 'unidade_id' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.entregadores ADD COLUMN unidade_id uuid REFERENCES public.unidades(id);
  END IF;
END$$;

-- 5. Função security definer para checar se usuário tem acesso à unidade
CREATE OR REPLACE FUNCTION public.user_has_unidade(_user_id uuid, _unidade_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admin/gestor vê tudo
    has_role(_user_id, 'admin'::app_role) 
    OR has_role(_user_id, 'gestor'::app_role)
    -- Ou o usuário está associado à unidade
    OR EXISTS (
      SELECT 1 FROM public.user_unidades
      WHERE user_id = _user_id AND unidade_id = _unidade_id
    )
$$;

-- 6. Função para retornar todas as unidade_ids que um usuário pode acessar
CREATE OR REPLACE FUNCTION public.get_user_unidade_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN has_role(_user_id, 'admin'::app_role) OR has_role(_user_id, 'gestor'::app_role)
    THEN (SELECT id FROM public.unidades WHERE ativo = true)
    ELSE (SELECT unidade_id FROM public.user_unidades WHERE user_id = _user_id)
  END
$$;
