
-- Fix 1: Restrict entregadores SELECT to admin/gestor/operacional + self-view for drivers
DROP POLICY "Authenticated users can view entregadores" ON public.entregadores;

CREATE POLICY "Staff can view entregadores"
ON public.entregadores
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional')
);

CREATE POLICY "Drivers can view own record"
ON public.entregadores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Restrict funcionarios SELECT to admin/gestor only
DROP POLICY "Authenticated users can view funcionarios" ON public.funcionarios;

CREATE POLICY "Admin and gestor can view funcionarios"
ON public.funcionarios
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor')
);

-- Fix 3: Restrict clientes SELECT to staff + entregadores only
DROP POLICY "Authenticated users can view clientes" ON public.clientes;

CREATE POLICY "Staff and entregadores can view clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional') OR 
  public.has_role(auth.uid(), 'entregador')
);
