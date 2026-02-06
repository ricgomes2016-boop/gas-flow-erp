-- Fix overly permissive RLS policies

-- Drop the permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Authenticated users can insert pedido_itens" ON public.pedido_itens;
DROP POLICY IF EXISTS "Users can insert their own route history" ON public.rota_historico;

-- Recreate with proper checks
CREATE POLICY "Authenticated users can insert pedidos" ON public.pedidos 
FOR INSERT TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional') OR
  public.has_role(auth.uid(), 'entregador')
);

CREATE POLICY "Authenticated users can insert pedido_itens" ON public.pedido_itens 
FOR INSERT TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR 
  public.has_role(auth.uid(), 'operacional') OR
  public.has_role(auth.uid(), 'entregador')
);

CREATE POLICY "Users can insert their own route history" ON public.rota_historico 
FOR INSERT TO authenticated 
WITH CHECK (
  rota_id IN (
    SELECT r.id FROM public.rotas r 
    JOIN public.entregadores e ON r.entregador_id = e.id 
    WHERE e.user_id = auth.uid()
  ) OR
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor')
);