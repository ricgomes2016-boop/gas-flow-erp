
-- Add foto_url to cheques table for check photos
ALTER TABLE public.cheques ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Add data_vencimento_fiado to pedidos for fiado/a prazo payments
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS data_vencimento_fiado DATE;

-- Add cheque_foto_url to pedidos for driver check photo capture
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS cheque_foto_url TEXT;

-- Add cheque_numero to pedidos for driver check number capture
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS cheque_numero TEXT;

-- Add cheque_banco to pedidos for driver check bank capture  
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS cheque_banco TEXT;
