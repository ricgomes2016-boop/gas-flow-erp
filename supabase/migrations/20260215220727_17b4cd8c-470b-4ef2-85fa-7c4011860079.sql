-- Prevent duplicate vale numbers
CREATE UNIQUE INDEX IF NOT EXISTS vale_gas_numero_unique ON vale_gas (numero);