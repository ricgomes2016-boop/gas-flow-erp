
-- Tabela de categorias de despesas com estrutura contábil
CREATE TABLE public.categorias_despesa (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  grupo text NOT NULL DEFAULT 'operacional',
  tipo text NOT NULL DEFAULT 'fixo',
  codigo_contabil text,
  descricao text,
  valor_padrao numeric DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  unidade_id uuid REFERENCES public.unidades(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categorias_despesa ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff can view categorias_despesa"
ON public.categorias_despesa FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestor'::app_role) 
  OR has_role(auth.uid(), 'financeiro'::app_role)
  OR has_role(auth.uid(), 'operacional'::app_role)
);

CREATE POLICY "Admin/Gestor can manage categorias_despesa"
ON public.categorias_despesa FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestor'::app_role)
);

-- Trigger updated_at
CREATE TRIGGER update_categorias_despesa_updated_at
BEFORE UPDATE ON public.categorias_despesa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: categorias padrão baseadas em contabilidade (plano de contas)
INSERT INTO public.categorias_despesa (nome, grupo, tipo, codigo_contabil, descricao, valor_padrao, ordem) VALUES
-- CUSTOS FIXOS
('Aluguel', 'custos_fixos', 'fixo', '4.1.01', 'Aluguel do imóvel comercial', 0, 1),
('Água / Luz / Telefone', 'custos_fixos', 'fixo', '4.1.02', 'Serviços públicos e telecomunicações', 0, 2),
('Pró-Labore', 'custos_fixos', 'fixo', '4.1.03', 'Retirada dos sócios', 0, 3),
('Contador', 'custos_fixos', 'fixo', '4.1.04', 'Honorários contábeis', 0, 4),
('Sistema / Software', 'custos_fixos', 'fixo', '4.1.05', 'Licenças de software e sistemas', 0, 5),
('Monitoramento / Segurança', 'custos_fixos', 'fixo', '4.1.06', 'Câmeras, alarmes, vigilância', 0, 6),
('Seguros', 'custos_fixos', 'fixo', '4.1.07', 'Seguros empresariais', 0, 7),
('Internet / Telecomunicação', 'custos_fixos', 'fixo', '4.1.08', 'Internet e serviços de comunicação', 0, 8),

-- DESPESAS COM PESSOAL
('Salários', 'pessoal', 'fixo', '4.2.01', 'Folha de pagamento dos funcionários', 0, 10),
('Encargos Sociais (INSS/FGTS)', 'pessoal', 'fixo', '4.2.02', 'INSS, FGTS e contribuições', 0, 11),
('Impostos sobre Salário', 'pessoal', 'fixo', '4.2.03', 'IRRF e demais tributos trabalhistas', 0, 12),
('Vale Transporte', 'pessoal', 'fixo', '4.2.04', 'VT dos funcionários', 0, 13),
('Refeição / Alimentação', 'pessoal', 'fixo', '4.2.05', 'VR, VA e refeições', 0, 14),
('Diárias / Limpeza', 'pessoal', 'variavel', '4.2.06', 'Serviços de terceiros e limpeza', 0, 15),
('Comissões', 'pessoal', 'variavel', '4.2.07', 'Comissões de vendedores e entregadores', 0, 16),
('Premiações / Bônus', 'pessoal', 'variavel', '4.2.08', 'Premiações por metas e bônus', 0, 17),

-- DESPESAS OPERACIONAIS
('Combustível', 'operacional', 'variavel', '4.3.01', 'Combustível dos veículos da frota', 0, 20),
('Manutenção Veículos / Pneus', 'operacional', 'variavel', '4.3.02', 'Manutenção preventiva e corretiva da frota', 0, 21),
('Despachante / Documentação', 'operacional', 'variavel', '4.3.03', 'Serviços de despachante e emissão de documentos', 0, 22),
('Embalagens / Material Consumo', 'operacional', 'variavel', '4.3.04', 'Materiais de consumo operacional', 0, 23),
('Frete / Transporte', 'operacional', 'variavel', '4.3.05', 'Fretes e custos de transporte', 0, 24),
('Pedágios', 'operacional', 'variavel', '4.3.06', 'Custos com pedágios', 0, 25),

-- DESPESAS COMERCIAIS
('Divulgação / Marketing', 'comercial', 'variavel', '4.4.01', 'Publicidade, propaganda e marketing', 0, 30),
('Taxas de Cartão / Maquininhas', 'comercial', 'variavel', '4.4.02', 'Taxas de processamento e aluguel de terminais', 0, 31),
('Comissão Marketplace', 'comercial', 'variavel', '4.4.03', 'Taxas de marketplaces e plataformas', 0, 32),

-- DESPESAS ADMINISTRATIVAS
('Material de Escritório', 'administrativo', 'variavel', '4.5.01', 'Papéis, canetas e suprimentos', 0, 40),
('Cartório / Jurídico', 'administrativo', 'variavel', '4.5.02', 'Custos jurídicos e cartoriais', 0, 41),

-- DESPESAS FINANCEIRAS
('Juros / Multas', 'financeiro', 'variavel', '4.6.01', 'Juros bancários, multas e encargos', 0, 50),
('Tarifas Bancárias', 'financeiro', 'fixo', '4.6.02', 'Taxas de manutenção de conta, TED, DOC', 0, 51),
('Cartão de Crédito Empresa', 'financeiro', 'variavel', '4.6.03', 'Compras no cartão corporativo', 0, 52),

-- IMPOSTOS
('Simples Nacional / DAS', 'impostos', 'variavel', '4.7.01', 'Guia DAS do Simples Nacional', 0, 60),
('ICMS', 'impostos', 'variavel', '4.7.02', 'Imposto sobre circulação', 0, 61),
('ISS', 'impostos', 'variavel', '4.7.03', 'Imposto sobre serviços', 0, 62),

-- DIVERSOS
('Diversos / Outros', 'diversos', 'variavel', '4.9.01', 'Despesas não classificadas', 0, 99);
