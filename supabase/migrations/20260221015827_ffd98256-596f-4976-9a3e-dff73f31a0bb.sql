
-- Tabela central de notificações
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info',
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(user_id, lida) WHERE lida = false;

-- RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas notificações"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários marcam como lida"
  ON public.notificacoes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sistema insere notificações"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam suas notificações"
  ON public.notificacoes FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
