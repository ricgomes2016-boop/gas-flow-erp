-- Add comprovante_cartao_url to pedidos for card payment receipt photos
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS comprovante_cartao_url text;

-- Add codigo_voucher for Gás do Povo voucher tracking
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS codigo_voucher text;