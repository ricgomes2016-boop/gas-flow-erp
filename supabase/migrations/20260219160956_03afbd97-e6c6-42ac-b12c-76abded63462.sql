
-- Endereços salvos do cliente
CREATE TABLE public.cliente_enderecos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  apelido TEXT NOT NULL DEFAULT 'Casa',
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT,
  cep TEXT,
  referencia TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cliente_enderecos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON public.cliente_enderecos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.cliente_enderecos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.cliente_enderecos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.cliente_enderecos FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_cliente_enderecos_updated_at
  BEFORE UPDATE ON public.cliente_enderecos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Avaliações de entrega
CREATE TABLE public.avaliacoes_entrega (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  nota_entregador INTEGER CHECK (nota_entregador >= 1 AND nota_entregador <= 5),
  nota_produto INTEGER CHECK (nota_produto >= 1 AND nota_produto <= 5),
  comentario TEXT,
  entregador_id UUID REFERENCES public.entregadores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes_entrega ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON public.avaliacoes_entrega FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON public.avaliacoes_entrega FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can view all reviews"
  ON public.avaliacoes_entrega FOR SELECT
  USING (auth.uid() IS NOT NULL);
