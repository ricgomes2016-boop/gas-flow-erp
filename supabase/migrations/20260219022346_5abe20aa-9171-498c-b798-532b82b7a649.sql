
-- Tabela unificada para todos os documentos fiscais eletrônicos
CREATE TABLE public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'nfe', -- nfe, nfce, cte, mdfe
  numero TEXT,
  serie TEXT DEFAULT '1',
  chave_acesso TEXT,
  protocolo TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho', -- rascunho, processando, autorizada, cancelada, denegada, inutilizada, rejeitada
  
  -- Dados do emitente/destinatário
  destinatario_nome TEXT,
  destinatario_cpf_cnpj TEXT,
  destinatario_endereco TEXT,
  destinatario_cidade_uf TEXT,
  destinatario_ie TEXT,
  destinatario_cep TEXT,
  destinatario_telefone TEXT,
  
  -- Valores
  valor_total NUMERIC NOT NULL DEFAULT 0,
  valor_frete NUMERIC DEFAULT 0,
  valor_desconto NUMERIC DEFAULT 0,
  valor_icms NUMERIC DEFAULT 0,
  
  -- Dados específicos NF-e / NFC-e
  natureza_operacao TEXT,
  forma_pagamento TEXT,
  
  -- Dados específicos CT-e
  remetente_nome TEXT,
  remetente_cpf_cnpj TEXT,
  remetente_endereco TEXT,
  modal TEXT, -- rodoviario, aereo, aquaviario
  peso_bruto NUMERIC,
  valor_mercadoria NUMERIC,
  
  -- Dados específicos MDF-e
  uf_carregamento TEXT,
  uf_descarregamento TEXT,
  motorista_nome TEXT,
  motorista_cpf TEXT,
  placa TEXT,
  rntrc TEXT,
  
  -- Integração Focus NFe
  focus_id TEXT, -- ID retornado pela API Focus NFe
  focus_ref TEXT, -- referência interna enviada para Focus
  xml_url TEXT,
  danfe_url TEXT,
  motivo_rejeicao TEXT,
  
  -- Cancelamento / Inutilização
  data_cancelamento TIMESTAMPTZ,
  motivo_cancelamento TEXT,
  protocolo_cancelamento TEXT,
  
  -- Carta de Correção
  carta_correcao TEXT,
  protocolo_carta_correcao TEXT,
  
  -- Metadados
  observacoes TEXT,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Itens dos documentos fiscais
CREATE TABLE public.nota_fiscal_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_fiscal_id UUID NOT NULL REFERENCES public.notas_fiscais(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  descricao TEXT NOT NULL,
  ncm TEXT,
  cfop TEXT,
  unidade TEXT DEFAULT 'UN',
  quantidade NUMERIC NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NF-es vinculadas ao MDF-e
CREATE TABLE public.mdfe_nfes_vinculadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mdfe_id UUID NOT NULL REFERENCES public.notas_fiscais(id) ON DELETE CASCADE,
  nfe_id UUID REFERENCES public.notas_fiscais(id),
  chave_acesso TEXT NOT NULL,
  destinatario TEXT,
  valor NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_notas_fiscais_tipo ON public.notas_fiscais(tipo);
CREATE INDEX idx_notas_fiscais_status ON public.notas_fiscais(status);
CREATE INDEX idx_notas_fiscais_data ON public.notas_fiscais(data_emissao);
CREATE INDEX idx_notas_fiscais_chave ON public.notas_fiscais(chave_acesso);
CREATE INDEX idx_notas_fiscais_unidade ON public.notas_fiscais(unidade_id);
CREATE INDEX idx_nota_fiscal_itens_nota ON public.nota_fiscal_itens(nota_fiscal_id);

-- RLS
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nota_fiscal_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mdfe_nfes_vinculadas ENABLE ROW LEVEL SECURITY;

-- Políticas notas_fiscais
CREATE POLICY "Staff can manage notas_fiscais" ON public.notas_fiscais
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role)
  );

CREATE POLICY "Staff can view notas_fiscais" ON public.notas_fiscais
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role) OR
    has_role(auth.uid(), 'operacional'::app_role)
  );

-- Políticas nota_fiscal_itens
CREATE POLICY "Staff can manage nota_fiscal_itens" ON public.nota_fiscal_itens
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role)
  );

CREATE POLICY "Staff can view nota_fiscal_itens" ON public.nota_fiscal_itens
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role) OR
    has_role(auth.uid(), 'operacional'::app_role)
  );

-- Políticas mdfe_nfes_vinculadas
CREATE POLICY "Staff can manage mdfe_nfes_vinculadas" ON public.mdfe_nfes_vinculadas
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role)
  );

CREATE POLICY "Staff can view mdfe_nfes_vinculadas" ON public.mdfe_nfes_vinculadas
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'gestor'::app_role) OR 
    has_role(auth.uid(), 'financeiro'::app_role) OR
    has_role(auth.uid(), 'operacional'::app_role)
  );

-- Trigger updated_at
CREATE TRIGGER update_notas_fiscais_updated_at
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
