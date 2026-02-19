
-- ===== 1. Campos de documento no veículo =====
ALTER TABLE public.veiculos
  ADD COLUMN IF NOT EXISTS crlv_vencimento date,
  ADD COLUMN IF NOT EXISTS seguro_vencimento date,
  ADD COLUMN IF NOT EXISTS seguro_empresa text;

-- ===== 2. Campo de CNH vencimento no entregador =====
ALTER TABLE public.entregadores
  ADD COLUMN IF NOT EXISTS cnh_vencimento date;

-- ===== 3. Tabela de multas =====
CREATE TABLE public.multas_frota (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id uuid NOT NULL REFERENCES public.veiculos(id),
  entregador_id uuid REFERENCES public.entregadores(id),
  data_infracao date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date,
  descricao text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  pontos integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  responsavel text NOT NULL DEFAULT 'empresa',
  observacoes text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multas_frota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage multas_frota" ON public.multas_frota
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Staff can view multas_frota" ON public.multas_frota
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- ===== 4. Tabela de checklist de saída =====
CREATE TABLE public.checklist_saida_veiculo (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id uuid NOT NULL REFERENCES public.veiculos(id),
  entregador_id uuid NOT NULL REFERENCES public.entregadores(id),
  data date NOT NULL DEFAULT CURRENT_DATE,
  pneus boolean NOT NULL DEFAULT false,
  freios boolean NOT NULL DEFAULT false,
  luzes boolean NOT NULL DEFAULT false,
  oleo boolean NOT NULL DEFAULT false,
  agua boolean NOT NULL DEFAULT false,
  limpeza boolean NOT NULL DEFAULT false,
  documentos boolean NOT NULL DEFAULT false,
  avarias boolean NOT NULL DEFAULT false,
  observacoes text,
  aprovado boolean NOT NULL DEFAULT false,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_saida_veiculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage checklist_saida" ON public.checklist_saida_veiculo
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can view checklist_saida" ON public.checklist_saida_veiculo
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Entregadores can insert own checklist" ON public.checklist_saida_veiculo
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'entregador'::app_role) AND
    entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
  );

CREATE POLICY "Entregadores can view own checklist" ON public.checklist_saida_veiculo
  FOR SELECT USING (
    has_role(auth.uid(), 'entregador'::app_role) AND
    entregador_id IN (SELECT id FROM entregadores WHERE user_id = auth.uid())
  );
