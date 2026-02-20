
-- Adiciona colunas faltantes na tabela documentos_contabeis
ALTER TABLE public.documentos_contabeis
  ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'geral',
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_nome TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_tamanho BIGINT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS competencia TEXT,
  ADD COLUMN IF NOT EXISTS prazo_entrega DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Corrige coluna periodo para ser nullable (código pode enviar null)
ALTER TABLE public.documentos_contabeis
  ALTER COLUMN periodo DROP NOT NULL,
  ALTER COLUMN periodo SET DEFAULT NULL;

-- Adiciona trigger de updated_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_documentos_contabeis_updated_at'
  ) THEN
    CREATE TRIGGER update_documentos_contabeis_updated_at
      BEFORE UPDATE ON public.documentos_contabeis
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Habilita Realtime para notificações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.documentos_contabeis;
