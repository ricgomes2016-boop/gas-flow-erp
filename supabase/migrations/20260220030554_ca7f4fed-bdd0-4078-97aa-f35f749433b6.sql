
-- Tabela de licitações públicas
CREATE TABLE public.licitacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  orgao TEXT NOT NULL,
  objeto TEXT NOT NULL,
  modalidade TEXT NOT NULL DEFAULT 'pregao_eletronico',
  status TEXT NOT NULL DEFAULT 'prospeccao',
  valor_estimado NUMERIC(15,2) DEFAULT 0,
  valor_proposta NUMERIC(15,2) DEFAULT NULL,
  valor_adjudicado NUMERIC(15,2) DEFAULT NULL,
  data_publicacao DATE,
  data_abertura TIMESTAMP WITH TIME ZONE,
  data_resultado DATE,
  data_vigencia_inicio DATE,
  data_vigencia_fim DATE,
  prazo_entrega TEXT,
  local_entrega TEXT,
  produtos TEXT,
  observacoes TEXT,
  link_edital TEXT,
  numero_processo TEXT,
  cnpj_orgao TEXT,
  responsavel_id UUID,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de documentos da licitação
CREATE TABLE public.licitacao_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'edital',
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ocorrências/histórico da licitação
CREATE TABLE public.licitacao_ocorrencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licitacao_id UUID NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'atualizacao',
  autor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licitacao_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licitacao_ocorrencias ENABLE ROW LEVEL SECURITY;

-- Policies licitacoes
CREATE POLICY "Admins e gestores gerenciam licitacoes"
ON public.licitacoes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Financeiro e operacional visualizam licitacoes"
ON public.licitacoes FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Policies documentos
CREATE POLICY "Admins e gestores gerenciam documentos licitacao"
ON public.licitacao_documentos FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Financeiro e operacional visualizam documentos"
ON public.licitacao_documentos FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Policies ocorrencias
CREATE POLICY "Admins e gestores gerenciam ocorrencias"
ON public.licitacao_ocorrencias FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Financeiro e operacional visualizam ocorrencias"
ON public.licitacao_ocorrencias FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Trigger updated_at
CREATE TRIGGER update_licitacoes_updated_at
BEFORE UPDATE ON public.licitacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
