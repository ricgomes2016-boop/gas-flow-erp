-- Adicionar campo responsavel_acerto na tabela pedidos
-- Valores: 'portaria', 'pdv', ou NULL (quando é entregador)
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS responsavel_acerto TEXT DEFAULT NULL;

-- Índice para facilitar filtros no acerto
CREATE INDEX IF NOT EXISTS idx_pedidos_responsavel_acerto ON public.pedidos(responsavel_acerto);

-- Migrar dados existentes: pedidos com canal_venda 'portaria'/'balcao' sem entregador → responsavel_acerto = 'portaria'
UPDATE public.pedidos 
SET responsavel_acerto = 'portaria' 
WHERE entregador_id IS NULL 
  AND canal_venda IN ('portaria', 'balcao', 'Portaria', 'PDV')
  AND responsavel_acerto IS NULL;
