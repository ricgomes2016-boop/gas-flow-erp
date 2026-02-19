
-- Tabela de comodatos (controle de vasilhames emprestados)
CREATE TABLE public.comodatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  deposito NUMERIC NOT NULL DEFAULT 0,
  data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
  data_devolucao DATE,
  prazo_devolucao DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comodatos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage comodatos"
ON public.comodatos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view comodatos"
ON public.comodatos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_comodatos_updated_at
BEFORE UPDATE ON public.comodatos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
