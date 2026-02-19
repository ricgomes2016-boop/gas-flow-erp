
-- Chat messages between entregador and base
CREATE TABLE public.chat_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  remetente_id UUID NOT NULL,
  remetente_tipo TEXT NOT NULL DEFAULT 'entregador', -- 'entregador' or 'base'
  remetente_nome TEXT,
  destinatario_tipo TEXT NOT NULL DEFAULT 'base', -- 'base' or 'entregador'
  destinatario_id UUID,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  pedido_id UUID REFERENCES public.pedidos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat messages"
  ON public.chat_mensagens FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert chat messages"
  ON public.chat_mensagens FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update chat messages"
  ON public.chat_mensagens FOR UPDATE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_mensagens;

-- Gamificação: conquistas definitions
CREATE TABLE public.conquistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT 'trophy',
  meta_valor INT NOT NULL DEFAULT 1,
  tipo TEXT NOT NULL DEFAULT 'entregas', -- 'entregas', 'dias_consecutivos', 'sem_atraso'
  pontos INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read conquistas" ON public.conquistas FOR SELECT TO authenticated USING (true);

-- Seed conquistas
INSERT INTO public.conquistas (nome, descricao, icone, meta_valor, tipo, pontos) VALUES
  ('Primeira Entrega', 'Complete sua primeira entrega', 'package', 1, 'entregas', 10),
  ('Velocista', 'Complete 10 entregas', 'zap', 10, 'entregas', 50),
  ('Maratonista', 'Complete 50 entregas', 'flame', 50, 'entregas', 200),
  ('Lendário', 'Complete 200 entregas', 'crown', 200, 'entregas', 1000),
  ('Semana Perfeita', '7 dias consecutivos trabalhando', 'calendar', 7, 'dias_consecutivos', 100),
  ('Mês de Ouro', '30 dias consecutivos', 'star', 30, 'dias_consecutivos', 500),
  ('Pontualidade', '20 entregas sem atraso', 'clock', 20, 'sem_atraso', 150);

-- Entregador conquistas unlocked
CREATE TABLE public.entregador_conquistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entregador_id UUID NOT NULL REFERENCES public.entregadores(id) ON DELETE CASCADE,
  conquista_id UUID NOT NULL REFERENCES public.conquistas(id) ON DELETE CASCADE,
  desbloqueada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entregador_id, conquista_id)
);

ALTER TABLE public.entregador_conquistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read entregador_conquistas" ON public.entregador_conquistas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert entregador_conquistas" ON public.entregador_conquistas FOR INSERT TO authenticated WITH CHECK (true);
