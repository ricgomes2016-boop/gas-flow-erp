
-- Fix produtos: change "Anyone can view" to "Authenticated users can view"
DROP POLICY IF EXISTS "Anyone can view produtos" ON public.produtos;
CREATE POLICY "Authenticated users can view produtos"
ON public.produtos
FOR SELECT
TO authenticated
USING (true);

-- Fix unidades: restrict view to staff + users with unidade access
DROP POLICY IF EXISTS "Authenticated users can view unidades" ON public.unidades;
CREATE POLICY "Staff and assigned users can view unidades"
ON public.unidades
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
  OR has_role(auth.uid(), 'financeiro'::app_role)
  OR has_role(auth.uid(), 'entregador'::app_role)
  OR has_role(auth.uid(), 'parceiro'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.user_unidades
    WHERE user_id = auth.uid() AND unidade_id = unidades.id
  )
);

-- Fix escalas_entregador: restrict to staff + own driver
DROP POLICY IF EXISTS "Authenticated users can view escalas_entregador" ON public.escalas_entregador;
CREATE POLICY "Staff and own driver can view escalas"
ON public.escalas_entregador
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
  OR entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
);

-- Fix canais_venda: restrict to staff
DROP POLICY IF EXISTS "Authenticated users can view canais_venda" ON public.canais_venda;
CREATE POLICY "Staff can view canais_venda"
ON public.canais_venda
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
);

-- Fix rotas_definidas: restrict to staff + entregadores
DROP POLICY IF EXISTS "Authenticated users can view rotas_definidas" ON public.rotas_definidas;
CREATE POLICY "Staff and drivers can view rotas_definidas"
ON public.rotas_definidas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
  OR has_role(auth.uid(), 'entregador'::app_role)
);

-- Fix horarios_funcionario: restrict to staff + own records
DROP POLICY IF EXISTS "Authenticated users can view horarios_funcionario" ON public.horarios_funcionario;
CREATE POLICY "Staff and own records can view horarios"
ON public.horarios_funcionario
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
  OR funcionario_id IN (SELECT id FROM funcionarios WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
);

-- Fix campanhas: restrict to staff
DROP POLICY IF EXISTS "Authenticated users can view campanhas" ON public.campanhas;
CREATE POLICY "Staff can view campanhas"
ON public.campanhas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
);

-- Fix documentos_contabeis: restrict to financial staff
DROP POLICY IF EXISTS "Authenticated users can view documentos_contabeis" ON public.documentos_contabeis;
CREATE POLICY "Financial staff can view documentos_contabeis"
ON public.documentos_contabeis
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'financeiro'::app_role)
);

-- Fix alertas_jornada: restrict to staff
DROP POLICY IF EXISTS "Authenticated users can view alertas_jornada" ON public.alertas_jornada;
CREATE POLICY "Staff can view alertas_jornada"
ON public.alertas_jornada
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
);

-- Fix gamificacao_ranking: restrict to staff + own driver
DROP POLICY IF EXISTS "Authenticated users can view gamificacao_ranking" ON public.gamificacao_ranking;
CREATE POLICY "Staff and drivers can view gamificacao_ranking"
ON public.gamificacao_ranking
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
  OR has_role(auth.uid(), 'entregador'::app_role)
);

-- Fix premiacoes: restrict to staff
DROP POLICY IF EXISTS "Authenticated users can view premiacoes" ON public.premiacoes;
CREATE POLICY "Staff can view premiacoes"
ON public.premiacoes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
);
