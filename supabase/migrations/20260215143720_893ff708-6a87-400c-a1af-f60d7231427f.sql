CREATE POLICY "Gestores can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'gestor'::app_role));