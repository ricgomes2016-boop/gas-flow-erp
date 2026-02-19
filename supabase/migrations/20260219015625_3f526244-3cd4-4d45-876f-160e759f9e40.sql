
-- Create boletos_emitidos table
CREATE TABLE public.boletos_emitidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial NOT NULL,
  sacado text NOT NULL,
  cpf_cnpj text NOT NULL,
  endereco text,
  valor numeric NOT NULL DEFAULT 0,
  vencimento date NOT NULL,
  emissao date NOT NULL DEFAULT CURRENT_DATE,
  descricao text,
  juros_mes numeric DEFAULT 2,
  multa numeric DEFAULT 2,
  instrucoes text,
  linha_digitavel text,
  status text NOT NULL DEFAULT 'aberto',
  observacoes text,
  conta_receber_id uuid REFERENCES public.contas_receber(id),
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boletos_emitidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage boletos_emitidos"
ON public.boletos_emitidos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "Staff can view boletos_emitidos"
ON public.boletos_emitidos FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE TRIGGER update_boletos_emitidos_updated_at
BEFORE UPDATE ON public.boletos_emitidos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
