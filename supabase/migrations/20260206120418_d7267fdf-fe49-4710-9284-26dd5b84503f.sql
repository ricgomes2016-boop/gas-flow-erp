-- Criar tabela para configurações da empresa
CREATE TABLE public.configuracoes_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa text NOT NULL DEFAULT 'Distribuidora Gás',
  cnpj text,
  telefone text,
  endereco text,
  mensagem_cupom text DEFAULT 'Obrigado pela preferência!',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode visualizar
CREATE POLICY "Authenticated users can view configuracoes" 
  ON public.configuracoes_empresa 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Apenas admin/gestor podem gerenciar
CREATE POLICY "Admin/Gestor can manage configuracoes" 
  ON public.configuracoes_empresa 
  FOR ALL 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_configuracoes_empresa_updated_at
  BEFORE UPDATE ON public.configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão
INSERT INTO public.configuracoes_empresa (nome_empresa, cnpj, telefone, endereco, mensagem_cupom)
VALUES ('GásPro Revenda', '12.345.678/0001-90', '(11) 3333-4444', 'Av. Principal, 100 - Centro', 'Obrigado pela preferência!');