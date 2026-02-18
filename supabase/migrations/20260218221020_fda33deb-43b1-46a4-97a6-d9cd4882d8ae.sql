
-- 1. Folhas de pagamento fechadas
CREATE TABLE public.folhas_pagamento (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_referencia text NOT NULL,
  data_fechamento timestamp with time zone NOT NULL DEFAULT now(),
  total_bruto numeric NOT NULL DEFAULT 0,
  total_descontos numeric NOT NULL DEFAULT 0,
  total_liquido numeric NOT NULL DEFAULT 0,
  total_comissoes numeric NOT NULL DEFAULT 0,
  total_funcionarios integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'fechada',
  observacoes text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.folha_pagamento_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folha_id uuid NOT NULL REFERENCES public.folhas_pagamento(id) ON DELETE CASCADE,
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id),
  funcionario_nome text NOT NULL,
  cargo text,
  salario_base numeric NOT NULL DEFAULT 0,
  horas_extras numeric NOT NULL DEFAULT 0,
  comissao numeric NOT NULL DEFAULT 0,
  bonus numeric NOT NULL DEFAULT 0,
  inss numeric NOT NULL DEFAULT 0,
  ir numeric NOT NULL DEFAULT 0,
  vales_desconto numeric NOT NULL DEFAULT 0,
  outros_descontos numeric NOT NULL DEFAULT 0,
  bruto numeric NOT NULL DEFAULT 0,
  total_descontos numeric NOT NULL DEFAULT 0,
  liquido numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Ponto eletrônico
CREATE TABLE public.ponto_eletronico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id),
  data date NOT NULL DEFAULT CURRENT_DATE,
  entrada timestamp with time zone,
  saida_almoco timestamp with time zone,
  retorno_almoco timestamp with time zone,
  saida timestamp with time zone,
  horas_trabalhadas numeric DEFAULT 0,
  horas_extras numeric DEFAULT 0,
  observacoes text,
  status text NOT NULL DEFAULT 'aberto',
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Atestados e faltas
CREATE TABLE public.atestados_faltas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id),
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_fim date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL DEFAULT 'falta',
  motivo text,
  dias integer NOT NULL DEFAULT 1,
  abona boolean NOT NULL DEFAULT false,
  documento_url text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Avaliações de desempenho
CREATE TABLE public.avaliacoes_desempenho (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id),
  avaliador_id uuid,
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  periodo_referencia text NOT NULL,
  nota_geral numeric NOT NULL DEFAULT 0,
  pontualidade integer DEFAULT 0,
  produtividade integer DEFAULT 0,
  trabalho_equipe integer DEFAULT 0,
  iniciativa integer DEFAULT 0,
  comunicacao integer DEFAULT 0,
  pontos_fortes text,
  pontos_melhorar text,
  metas_proximas text,
  observacoes text,
  status text NOT NULL DEFAULT 'rascunho',
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Onboarding/Offboarding checklists
CREATE TABLE public.onboarding_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id),
  tipo text NOT NULL DEFAULT 'admissao',
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao date,
  status text NOT NULL DEFAULT 'em_andamento',
  responsavel_id uuid,
  observacoes text,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.onboarding_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id uuid NOT NULL REFERENCES public.onboarding_checklists(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  concluido boolean NOT NULL DEFAULT false,
  data_conclusao timestamp with time zone,
  responsavel text,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.folhas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folha_pagamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponto_eletronico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atestados_faltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_desempenho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_itens ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can manage folhas_pagamento" ON public.folhas_pagamento FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view folhas_pagamento" ON public.folhas_pagamento FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Staff can manage folha_pagamento_itens" ON public.folha_pagamento_itens FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view folha_pagamento_itens" ON public.folha_pagamento_itens FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Staff can manage ponto_eletronico" ON public.ponto_eletronico FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view ponto_eletronico" ON public.ponto_eletronico FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage atestados_faltas" ON public.atestados_faltas FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view atestados_faltas" ON public.atestados_faltas FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage avaliacoes_desempenho" ON public.avaliacoes_desempenho FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view avaliacoes_desempenho" ON public.avaliacoes_desempenho FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage onboarding_checklists" ON public.onboarding_checklists FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view onboarding_checklists" ON public.onboarding_checklists FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

CREATE POLICY "Staff can manage onboarding_itens" ON public.onboarding_itens FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));
CREATE POLICY "Staff can view onboarding_itens" ON public.onboarding_itens FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));
