
-- Add terminal_id to entregadores for fixed machine assignment
ALTER TABLE public.entregadores 
ADD COLUMN IF NOT EXISTS terminal_id UUID REFERENCES public.terminais_cartao(id) ON DELETE SET NULL;

-- Add terminal_ativo_id for dynamic (QR code) assignment during shift
ALTER TABLE public.entregadores 
ADD COLUMN IF NOT EXISTS terminal_ativo_id UUID REFERENCES public.terminais_cartao(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.entregadores.terminal_id IS 'Maquininha fixa vinculada ao entregador';
COMMENT ON COLUMN public.entregadores.terminal_ativo_id IS 'Maquininha ativa da jornada atual (via QR Code)';
