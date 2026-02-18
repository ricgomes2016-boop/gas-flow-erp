
-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-empresa', 'documentos-empresa', false);

-- Storage policies
CREATE POLICY "Staff can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos-empresa'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gestor'::app_role) OR public.has_role(auth.uid(), 'financeiro'::app_role))
);

CREATE POLICY "Staff can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos-empresa'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gestor'::app_role) OR public.has_role(auth.uid(), 'financeiro'::app_role) OR public.has_role(auth.uid(), 'operacional'::app_role))
);

CREATE POLICY "Admin/Gestor can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-empresa'
  AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gestor'::app_role))
);

-- Create metadata table
CREATE TABLE public.documentos_empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'geral',
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tamanho BIGINT,
  unidade_id UUID REFERENCES public.unidades(id),
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_empresa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view documentos_empresa"
ON public.documentos_empresa FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
  OR public.has_role(auth.uid(), 'operacional'::app_role)
);

CREATE POLICY "Staff can insert documentos_empresa"
ON public.documentos_empresa FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
  OR public.has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "Admin/Gestor can delete documentos_empresa"
ON public.documentos_empresa FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
);

CREATE TRIGGER update_documentos_empresa_updated_at
BEFORE UPDATE ON public.documentos_empresa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
