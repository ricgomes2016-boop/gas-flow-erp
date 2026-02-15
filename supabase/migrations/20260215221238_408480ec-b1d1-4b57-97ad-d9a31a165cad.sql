-- Add valor_venda column to track the price the partner sells to the consumer
ALTER TABLE vale_gas ADD COLUMN IF NOT EXISTS valor_venda numeric DEFAULT NULL;