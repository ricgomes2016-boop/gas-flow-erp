
-- Add separate address fields to pedidos table
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS numero_entrega text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS bairro_entrega text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS complemento_entrega text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS cep_entrega text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS cidade_entrega text;
