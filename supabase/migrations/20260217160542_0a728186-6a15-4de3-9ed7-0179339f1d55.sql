
-- Add entregador_id to veiculos for driver-vehicle linking
ALTER TABLE public.veiculos ADD COLUMN entregador_id uuid REFERENCES public.entregadores(id);

-- Create index for performance
CREATE INDEX idx_veiculos_entregador_id ON public.veiculos(entregador_id);
