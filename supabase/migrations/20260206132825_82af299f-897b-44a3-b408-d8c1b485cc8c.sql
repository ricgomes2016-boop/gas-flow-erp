-- Adicionar coluna de código de barras na tabela produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS codigo_barras TEXT UNIQUE;

-- Criar índice para busca por código de barras
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON public.produtos(codigo_barras);