
-- Tabela de documentos contábeis (portal contador)
CREATE TABLE IF NOT EXISTS public.documentos_contabeis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id UUID REFERENCES public.unidades(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'geral',
  tipo TEXT NOT NULL DEFAULT 'enviado', -- 'enviado' (empresa→contador) | 'recebido' (contador→empresa)
  status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel' | 'pendente' | 'revisao'
  periodo TEXT, -- ex: '2025-01'
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho BIGINT,
  uploaded_by UUID,
  gerado_em TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_contabeis ENABLE ROW LEVEL SECURITY;

-- Admin/gestor/financeiro podem ver tudo
CREATE POLICY "staff_select_documentos_contabeis"
  ON public.documentos_contabeis FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gestor'::app_role)
    OR has_role(auth.uid(), 'financeiro'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
  );

CREATE POLICY "staff_insert_documentos_contabeis"
  ON public.documentos_contabeis FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gestor'::app_role)
    OR has_role(auth.uid(), 'financeiro'::app_role)
  );

CREATE POLICY "staff_update_documentos_contabeis"
  ON public.documentos_contabeis FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gestor'::app_role)
    OR has_role(auth.uid(), 'financeiro'::app_role)
  );

CREATE POLICY "staff_delete_documentos_contabeis"
  ON public.documentos_contabeis FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gestor'::app_role)
    OR has_role(auth.uid(), 'financeiro'::app_role)
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-contabeis', 'documentos-contabeis', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "staff_upload_contabeis"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documentos-contabeis'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'gestor'::app_role)
      OR has_role(auth.uid(), 'financeiro'::app_role)
    )
  );

CREATE POLICY "staff_select_contabeis"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documentos-contabeis'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'gestor'::app_role)
      OR has_role(auth.uid(), 'financeiro'::app_role)
      OR has_role(auth.uid(), 'operacional'::app_role)
    )
  );

CREATE POLICY "staff_delete_contabeis"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documentos-contabeis'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'gestor'::app_role)
      OR has_role(auth.uid(), 'financeiro'::app_role)
    )
  );

-- Trigger updated_at
CREATE TRIGGER update_documentos_contabeis_updated_at
  BEFORE UPDATE ON public.documentos_contabeis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
