
-- Add boleto-related columns to contas_pagar
ALTER TABLE public.contas_pagar 
  ADD COLUMN IF NOT EXISTS boleto_url text,
  ADD COLUMN IF NOT EXISTS boleto_codigo_barras text,
  ADD COLUMN IF NOT EXISTS boleto_linha_digitavel text;

-- Create storage bucket for boleto files
INSERT INTO storage.buckets (id, name, public)
VALUES ('boletos', 'boletos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for boleto storage
CREATE POLICY "Staff can upload boletos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'boletos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'gestor'::app_role) 
    OR has_role(auth.uid(), 'financeiro'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
  )
);

CREATE POLICY "Staff can view boletos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'boletos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'gestor'::app_role) 
    OR has_role(auth.uid(), 'financeiro'::app_role)
    OR has_role(auth.uid(), 'operacional'::app_role)
  )
);

CREATE POLICY "Staff can delete boletos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'boletos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'gestor'::app_role) 
    OR has_role(auth.uid(), 'financeiro'::app_role)
  )
);
