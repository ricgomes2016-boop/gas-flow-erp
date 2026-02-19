
-- Tabela de conversas do assistente IA
CREATE TABLE public.ai_conversas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Nova conversa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensagens de cada conversa
CREATE TABLE public.ai_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID NOT NULL REFERENCES public.ai_conversas(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_conversas_user_id ON public.ai_conversas(user_id);
CREATE INDEX idx_ai_mensagens_conversa_id ON public.ai_mensagens(conversa_id);

-- RLS
ALTER TABLE public.ai_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations"
ON public.ai_conversas FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage messages of their conversations"
ON public.ai_mensagens FOR ALL
USING (EXISTS (SELECT 1 FROM public.ai_conversas WHERE id = conversa_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversas WHERE id = conversa_id AND user_id = auth.uid()));

-- Trigger updated_at
CREATE TRIGGER update_ai_conversas_updated_at
BEFORE UPDATE ON public.ai_conversas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
