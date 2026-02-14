
-- Adicionar novos campos à tabela compras
ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS numero_nota_fiscal text,
  ADD COLUMN IF NOT EXISTS chave_nfe text,
  ADD COLUMN IF NOT EXISTS valor_frete numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_compra date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS data_pagamento date;
