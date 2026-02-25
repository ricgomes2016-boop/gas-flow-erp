
-- Tabela para configurar destino de cada forma de pagamento → conta bancária
CREATE TABLE public.config_destino_pagamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id) ON DELETE CASCADE,
  forma_pagamento TEXT NOT NULL,
  conta_bancaria_id UUID REFERENCES public.contas_bancarias(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unidade_id, forma_pagamento)
);

-- RLS
ALTER TABLE public.config_destino_pagamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver config destino" 
ON public.config_destino_pagamento FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir config destino" 
ON public.config_destino_pagamento FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar config destino" 
ON public.config_destino_pagamento FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar config destino" 
ON public.config_destino_pagamento FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Trigger updated_at
CREATE TRIGGER update_config_destino_pagamento_updated_at
BEFORE UPDATE ON public.config_destino_pagamento
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão (sem unidade, será preenchido pelo usuário)
COMMENT ON TABLE public.config_destino_pagamento IS 'Configuração de qual conta bancária recebe cada forma de pagamento por unidade';
