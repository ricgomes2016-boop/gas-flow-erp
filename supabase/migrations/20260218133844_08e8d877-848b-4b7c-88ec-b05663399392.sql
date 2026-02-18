
CREATE TABLE public.anotacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  cor TEXT NOT NULL DEFAULT 'yellow',
  fixado BOOLEAN NOT NULL DEFAULT false,
  concluido BOOLEAN NOT NULL DEFAULT false,
  lembrete_data TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.anotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own anotacoes"
ON public.anotacoes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_anotacoes_updated_at
BEFORE UPDATE ON public.anotacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
