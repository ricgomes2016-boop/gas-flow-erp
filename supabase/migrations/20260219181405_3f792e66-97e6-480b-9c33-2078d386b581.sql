-- Add 'cliente' role to the unidades SELECT policy so clients can see the stores
DROP POLICY IF EXISTS "Staff and assigned users can view unidades" ON public.unidades;

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
  OR has_role(auth.uid(), 'cliente'::app_role)
  OR (EXISTS (
    SELECT 1 FROM user_unidades
    WHERE user_unidades.user_id = auth.uid()
    AND user_unidades.unidade_id = unidades.id
  ))
);