
-- Tabela para registrar movimentações de estoque (entradas manuais, saídas manuais, avarias)
CREATE TABLE public.movimentacoes_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'avaria')),
  quantidade INTEGER NOT NULL DEFAULT 0,
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage movimentacoes_estoque"
ON public.movimentacoes_estoque
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view movimentacoes_estoque"
ON public.movimentacoes_estoque
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE TRIGGER update_movimentacoes_estoque_updated_at
BEFORE UPDATE ON public.movimentacoes_estoque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
