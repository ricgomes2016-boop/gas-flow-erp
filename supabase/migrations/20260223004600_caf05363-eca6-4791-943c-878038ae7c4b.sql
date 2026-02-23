
-- 1. Adicionar campo bloqueado na caixa_sessoes (true quando caixa fechado)
ALTER TABLE public.caixa_sessoes 
  ADD COLUMN IF NOT EXISTS bloqueado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS desbloqueado_por uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS desbloqueado_em timestamptz;

-- 2. Atualizar caixas já fechados para bloqueado = true
UPDATE public.caixa_sessoes SET bloqueado = true WHERE status = 'fechado';

-- 3. Criar função que verifica se o caixa do dia está bloqueado para uma unidade
CREATE OR REPLACE FUNCTION public.caixa_dia_bloqueado(_data date, _unidade_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.caixa_sessoes
    WHERE data = _data
      AND bloqueado = true
      AND (unidade_id = _unidade_id OR (_unidade_id IS NULL AND unidade_id IS NULL))
  )
$$;

-- 4. Trigger para bloquear INSERT em movimentacoes_estoque quando caixa fechado
CREATE OR REPLACE FUNCTION public.validar_caixa_aberto_estoque()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.caixa_dia_bloqueado(CURRENT_DATE, NEW.unidade_id) THEN
    RAISE EXCEPTION 'Caixa do dia está fechado. Movimentação de estoque bloqueada. Solicite ao gestor para reabrir.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_caixa_estoque ON public.movimentacoes_estoque;
CREATE TRIGGER trg_validar_caixa_estoque
  BEFORE INSERT ON public.movimentacoes_estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_caixa_aberto_estoque();

-- 5. Trigger para bloquear INSERT em pedidos quando caixa fechado
CREATE OR REPLACE FUNCTION public.validar_caixa_aberto_pedidos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.caixa_dia_bloqueado(CURRENT_DATE, NEW.unidade_id) THEN
    RAISE EXCEPTION 'Caixa do dia está fechado. Novas vendas bloqueadas. Solicite ao gestor para reabrir.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_caixa_pedidos ON public.pedidos;
CREATE TRIGGER trg_validar_caixa_pedidos
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_caixa_aberto_pedidos();

-- 6. Trigger para bloquear INSERT em movimentacoes_caixa quando caixa fechado
CREATE OR REPLACE FUNCTION public.validar_caixa_aberto_movimentacoes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.caixa_dia_bloqueado(CURRENT_DATE, NEW.unidade_id) THEN
    RAISE EXCEPTION 'Caixa do dia está fechado. Movimentações de caixa bloqueadas. Solicite ao gestor para reabrir.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_caixa_movimentacoes ON public.movimentacoes_caixa;
CREATE TRIGGER trg_validar_caixa_movimentacoes
  BEFORE INSERT ON public.movimentacoes_caixa
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_caixa_aberto_movimentacoes();

-- 7. Índice para performance
CREATE INDEX IF NOT EXISTS idx_caixa_sessoes_data_bloqueado ON public.caixa_sessoes(data, bloqueado);
