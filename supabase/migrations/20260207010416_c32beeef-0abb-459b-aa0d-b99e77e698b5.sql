-- Create unidades (branches) table for Matriz/Filial management
CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'filial' CHECK (tipo IN ('matriz', 'filial')),
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view unidades" 
ON public.unidades 
FOR SELECT 
USING (true);

CREATE POLICY "Admin/Gestor can manage unidades" 
ON public.unidades 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_unidades_updated_at
BEFORE UPDATE ON public.unidades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default matriz based on existing company config
INSERT INTO public.unidades (nome, tipo, cnpj, telefone, endereco)
SELECT 
  nome_empresa,
  'matriz',
  cnpj,
  telefone,
  endereco
FROM public.configuracoes_empresa
LIMIT 1;

-- Insert sample filial
INSERT INTO public.unidades (nome, tipo, cidade, estado, ativo)
VALUES ('Filial Centro', 'filial', 'São Paulo', 'SP', true);