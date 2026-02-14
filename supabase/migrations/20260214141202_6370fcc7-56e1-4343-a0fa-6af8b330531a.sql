
-- Restrict fornecedores SELECT to staff roles only
DROP POLICY "Authenticated users can view fornecedores" ON public.fornecedores;

CREATE POLICY "Staff can view fornecedores"
ON public.fornecedores
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional')
);
