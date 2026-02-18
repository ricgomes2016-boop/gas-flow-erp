
-- Tabela de transferências de estoque entre filiais
CREATE TABLE public.transferencias_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_origem_id UUID NOT NULL REFERENCES public.unidades(id),
  unidade_destino_id UUID NOT NULL REFERENCES public.unidades(id),
  solicitante_id UUID NOT NULL,
  entregador_id UUID REFERENCES public.entregadores(id),
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, em_transito, recebido, cancelado
  observacoes TEXT,
  compra_gerada_id UUID REFERENCES public.compras(id),
  data_envio TIMESTAMP WITH TIME ZONE,
  data_recebimento TIMESTAMP WITH TIME ZONE,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens da transferência
CREATE TABLE public.transferencia_estoque_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transferencia_id UUID NOT NULL REFERENCES public.transferencias_estoque(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  quantidade INTEGER NOT NULL DEFAULT 0,
  preco_compra NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transferencias_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencia_estoque_itens ENABLE ROW LEVEL SECURITY;

-- RLS for transferencias_estoque
CREATE POLICY "Staff can manage transferencias_estoque"
ON public.transferencias_estoque FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view transferencias_estoque"
ON public.transferencias_estoque FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Entregadores can view own transferencias"
ON public.transferencias_estoque FOR SELECT
USING (has_role(auth.uid(), 'entregador'::app_role) AND entregador_id IN (
  SELECT id FROM entregadores WHERE user_id = auth.uid()
));

CREATE POLICY "Entregadores can insert transferencias"
ON public.transferencias_estoque FOR INSERT
WITH CHECK (has_role(auth.uid(), 'entregador'::app_role) AND entregador_id IN (
  SELECT id FROM entregadores WHERE user_id = auth.uid()
));

CREATE POLICY "Entregadores can update own transferencias"
ON public.transferencias_estoque FOR UPDATE
USING (has_role(auth.uid(), 'entregador'::app_role) AND entregador_id IN (
  SELECT id FROM entregadores WHERE user_id = auth.uid()
));

-- RLS for itens
CREATE POLICY "Staff can manage transferencia_itens"
ON public.transferencia_estoque_itens FOR ALL
USING (transferencia_id IN (
  SELECT id FROM transferencias_estoque WHERE
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role)
));

CREATE POLICY "Staff can view transferencia_itens"
ON public.transferencia_estoque_itens FOR SELECT
USING (transferencia_id IN (
  SELECT id FROM transferencias_estoque WHERE
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role)
));

CREATE POLICY "Entregadores can view own transferencia_itens"
ON public.transferencia_estoque_itens FOR SELECT
USING (transferencia_id IN (
  SELECT id FROM transferencias_estoque WHERE entregador_id IN (
    SELECT id FROM entregadores WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Entregadores can insert transferencia_itens"
ON public.transferencia_estoque_itens FOR INSERT
WITH CHECK (transferencia_id IN (
  SELECT id FROM transferencias_estoque WHERE entregador_id IN (
    SELECT id FROM entregadores WHERE user_id = auth.uid()
  )
));

-- Triggers for updated_at
CREATE TRIGGER update_transferencias_estoque_updated_at
BEFORE UPDATE ON public.transferencias_estoque
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
