
-- Fix check constraint on chamadas_recebidas to allow 'celular' type
ALTER TABLE public.chamadas_recebidas 
DROP CONSTRAINT IF EXISTS chamadas_recebidas_tipo_check;

ALTER TABLE public.chamadas_recebidas 
ADD CONSTRAINT chamadas_recebidas_tipo_check 
CHECK (tipo IN ('celular', 'whatsapp', 'voip', 'fixo'));
