-- Allow super_admin to read all empresas (bypass empresa_id filter)
CREATE POLICY "Super admin can read all empresas"
ON public.empresas
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to insert empresas
CREATE POLICY "Super admin can insert empresas"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to update empresas
CREATE POLICY "Super admin can update empresas"
ON public.empresas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to read all unidades
CREATE POLICY "Super admin can read all unidades"
ON public.unidades
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to insert unidades
CREATE POLICY "Super admin can insert unidades"
ON public.unidades
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to read all profiles
CREATE POLICY "Super admin can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to update profiles (for linking empresa_id)
CREATE POLICY "Super admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));
