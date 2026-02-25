
-- Add PIX Maquininha support to operadoras_cartao
ALTER TABLE public.operadoras_cartao
  ADD COLUMN IF NOT EXISTS taxa_pix numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prazo_pix integer DEFAULT 0;

COMMENT ON COLUMN public.operadoras_cartao.taxa_pix IS 'Taxa percentual cobrada pela operadora para PIX na maquininha';
COMMENT ON COLUMN public.operadoras_cartao.prazo_pix IS 'Prazo em dias para liquidação do PIX na maquininha (0=D+0, 1=D+1)';
