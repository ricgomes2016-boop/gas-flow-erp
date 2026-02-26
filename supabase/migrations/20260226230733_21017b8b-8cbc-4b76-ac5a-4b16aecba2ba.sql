
ALTER TABLE public.conferencia_cartao 
ADD COLUMN terminal_id UUID REFERENCES public.terminais_cartao(id) ON DELETE SET NULL;

CREATE INDEX idx_conferencia_cartao_terminal_id ON public.conferencia_cartao(terminal_id);
