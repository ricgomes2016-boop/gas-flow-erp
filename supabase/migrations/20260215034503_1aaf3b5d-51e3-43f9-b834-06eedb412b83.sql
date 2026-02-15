
-- Table to store commission values per product and sales channel
CREATE TABLE public.comissao_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  canal_venda text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(produto_id, canal_venda, unidade_id)
);

ALTER TABLE public.comissao_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view comissao_config"
ON public.comissao_config FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage comissao_config"
ON public.comissao_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE TRIGGER update_comissao_config_updated_at
BEFORE UPDATE ON public.comissao_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
