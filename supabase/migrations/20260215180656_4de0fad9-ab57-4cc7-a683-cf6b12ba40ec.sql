-- Add numero column to clientes table
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS numero text;