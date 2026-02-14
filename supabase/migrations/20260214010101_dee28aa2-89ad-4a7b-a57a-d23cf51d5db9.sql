
-- Tabela para Combustível/Abastecimentos
CREATE TABLE public.abastecimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id uuid REFERENCES veiculos(id) NOT NULL,
  motorista text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  litros numeric NOT NULL,
  valor numeric NOT NULL,
  km integer NOT NULL,
  tipo text NOT NULL DEFAULT 'Gasolina',
  unidade_id uuid REFERENCES unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para Manutenções
CREATE TABLE public.manutencoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id uuid REFERENCES veiculos(id) NOT NULL,
  tipo text NOT NULL, -- 'Preventiva' ou 'Corretiva'
  descricao text NOT NULL,
  oficina text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  valor numeric NOT NULL,
  status text NOT NULL DEFAULT 'Agendada', -- 'Agendada', 'Em andamento', 'Concluída'
  unidade_id uuid REFERENCES unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para Gamificação (Ranking)
CREATE TABLE public.gamificacao_ranking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entregador_id uuid REFERENCES entregadores(id) NOT NULL,
  mes_referencia text NOT NULL, -- 'YYYY-MM'
  pontos integer NOT NULL DEFAULT 0,
  entregas_realizadas integer NOT NULL DEFAULT 0,
  avaliacao_media numeric NOT NULL DEFAULT 0,
  conquistas_desbloqueadas integer NOT NULL DEFAULT 0,
  unidade_id uuid REFERENCES unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(entregador_id, mes_referencia)
);

-- Tabela para Campanhas
CREATE TABLE public.campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL, -- 'WhatsApp', 'SMS', 'Email'
  alcance integer NOT NULL DEFAULT 0,
  enviados integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho', -- 'rascunho', 'ativa', 'concluida'
  data_criacao date NOT NULL DEFAULT CURRENT_DATE,
  unidade_id uuid REFERENCES unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela para Fidelidade (Programa de Pontos)
CREATE TABLE public.fidelidade_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id) NOT NULL,
  pontos integer NOT NULL DEFAULT 0,
  nivel text NOT NULL DEFAULT 'Bronze', -- 'Bronze', 'Prata', 'Ouro'
  indicacoes_realizadas integer NOT NULL DEFAULT 0,
  ultima_atualizacao timestamp with time zone NOT NULL DEFAULT now(),
  unidade_id uuid REFERENCES unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(cliente_id)
);

-- Tabela para Metas
CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL, -- 'financeiro', 'clientes', 'operacional'
  valor_atual numeric NOT NULL DEFAULT 0,
  valor_objetivo numeric NOT NULL,
  prazo date NOT NULL,
  status text NOT NULL DEFAULT 'ativa',
  unidade_id uuid REFERENCES unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ativar RLS para todas as tabelas
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamificacao_ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fidelidade_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para abastecimentos
CREATE POLICY "Authenticated users can view abastecimentos" ON public.abastecimentos
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage abastecimentos" ON public.abastecimentos
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- RLS Policies para manutencoes
CREATE POLICY "Authenticated users can view manutencoes" ON public.manutencoes
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage manutencoes" ON public.manutencoes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- RLS Policies para gamificacao_ranking
CREATE POLICY "Authenticated users can view gamificacao_ranking" ON public.gamificacao_ranking
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage gamificacao_ranking" ON public.gamificacao_ranking
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- RLS Policies para campanhas
CREATE POLICY "Authenticated users can view campanhas" ON public.campanhas
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage campanhas" ON public.campanhas
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- RLS Policies para fidelidade_clientes
CREATE POLICY "Authenticated users can view fidelidade_clientes" ON public.fidelidade_clientes
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage fidelidade_clientes" ON public.fidelidade_clientes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- RLS Policies para metas
CREATE POLICY "Authenticated users can view metas" ON public.metas
  FOR SELECT USING (true);

CREATE POLICY "Staff can manage metas" ON public.metas
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'operacional'::app_role));

-- Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_abastecimentos_updated_at
BEFORE UPDATE ON public.abastecimentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manutencoes_updated_at
BEFORE UPDATE ON public.manutencoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamificacao_ranking_updated_at
BEFORE UPDATE ON public.gamificacao_ranking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campanhas_updated_at
BEFORE UPDATE ON public.campanhas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fidelidade_clientes_updated_at
BEFORE UPDATE ON public.fidelidade_clientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
BEFORE UPDATE ON public.metas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
