
-- Tabela de vales de funcionários
CREATE TABLE public.vales_funcionario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'adiantamento', -- adiantamento, vale_alimentacao, vale_transporte, emprestimo
  valor NUMERIC NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, parcelado
  desconto_referencia TEXT, -- ex: "Folha Jan", "3x de R$500"
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vales_funcionario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vales_funcionario" ON public.vales_funcionario FOR SELECT USING (true);
CREATE POLICY "Staff can manage vales_funcionario" ON public.vales_funcionario FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'financeiro')
);

CREATE TRIGGER update_vales_funcionario_updated_at BEFORE UPDATE ON public.vales_funcionario
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de bônus
CREATE TABLE public.bonus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'meta_vendas', -- meta_vendas, indicacao, aniversario, pontualidade
  valor NUMERIC NOT NULL DEFAULT 0,
  mes_referencia TEXT, -- ex: "Janeiro 2024"
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bonus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view bonus" ON public.bonus FOR SELECT USING (true);
CREATE POLICY "Staff can manage bonus" ON public.bonus FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')
);

CREATE TRIGGER update_bonus_updated_at BEFORE UPDATE ON public.bonus
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de premiações
CREATE TABLE public.premiacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  meta_descricao TEXT,
  premio TEXT, -- ex: "R$ 500 + Folga"
  ganhador_id UUID REFERENCES public.funcionarios(id),
  status TEXT NOT NULL DEFAULT 'em_andamento', -- em_andamento, atingida, encerrada
  mes_referencia TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.premiacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view premiacoes" ON public.premiacoes FOR SELECT USING (true);
CREATE POLICY "Staff can manage premiacoes" ON public.premiacoes FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')
);

CREATE TRIGGER update_premiacoes_updated_at BEFORE UPDATE ON public.premiacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de horários de funcionários
CREATE TABLE public.horarios_funcionario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  turno TEXT NOT NULL DEFAULT 'comercial', -- manha, tarde, comercial, noturno
  entrada TIME NOT NULL DEFAULT '08:00',
  saida TIME NOT NULL DEFAULT '18:00',
  intervalo TEXT DEFAULT '1h',
  dias_semana TEXT DEFAULT 'Seg-Sex',
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.horarios_funcionario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view horarios_funcionario" ON public.horarios_funcionario FOR SELECT USING (true);
CREATE POLICY "Staff can manage horarios_funcionario" ON public.horarios_funcionario FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')
);

CREATE TRIGGER update_horarios_funcionario_updated_at BEFORE UPDATE ON public.horarios_funcionario
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de banco de horas
CREATE TABLE public.banco_horas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  saldo_positivo NUMERIC NOT NULL DEFAULT 0,
  saldo_negativo NUMERIC NOT NULL DEFAULT 0,
  ultima_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banco_horas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view banco_horas" ON public.banco_horas FOR SELECT USING (true);
CREATE POLICY "Staff can manage banco_horas" ON public.banco_horas FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')
);

CREATE TRIGGER update_banco_horas_updated_at BEFORE UPDATE ON public.banco_horas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de alertas de jornada
CREATE TABLE public.alertas_jornada (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- horas_extras, intervalo, descanso_semanal, jornada_noturna
  descricao TEXT NOT NULL,
  nivel TEXT NOT NULL DEFAULT 'medio', -- alto, medio, baixo
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  resolvido BOOLEAN NOT NULL DEFAULT false,
  unidade_id UUID REFERENCES public.unidades(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alertas_jornada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alertas_jornada" ON public.alertas_jornada FOR SELECT USING (true);
CREATE POLICY "Staff can manage alertas_jornada" ON public.alertas_jornada FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor')
);

CREATE TRIGGER update_alertas_jornada_updated_at BEFORE UPDATE ON public.alertas_jornada
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
