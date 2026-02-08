-- Add unidade_id to pedidos table
ALTER TABLE public.pedidos ADD COLUMN unidade_id uuid REFERENCES public.unidades(id);

-- Add unidade_id to produtos table (for stock per unit)
ALTER TABLE public.produtos ADD COLUMN unidade_id uuid REFERENCES public.unidades(id);

-- Create index for better query performance
CREATE INDEX idx_pedidos_unidade ON public.pedidos(unidade_id);
CREATE INDEX idx_produtos_unidade ON public.produtos(unidade_id);

-- Set default unidade_id for existing records (use matriz as default)
UPDATE public.pedidos 
SET unidade_id = (SELECT id FROM public.unidades WHERE tipo = 'matriz' LIMIT 1)
WHERE unidade_id IS NULL;

UPDATE public.produtos 
SET unidade_id = (SELECT id FROM public.unidades WHERE tipo = 'matriz' LIMIT 1)
WHERE unidade_id IS NULL;