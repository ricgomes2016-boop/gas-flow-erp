
-- Add super_admin policies for user_roles table
CREATE POLICY "Super admin can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
