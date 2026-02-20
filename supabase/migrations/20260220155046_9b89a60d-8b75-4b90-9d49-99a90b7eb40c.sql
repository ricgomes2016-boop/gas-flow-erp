
CREATE TABLE public.configuracoes_visuais (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id uuid REFERENCES public.unidades(id) ON DELETE CASCADE UNIQUE NOT NULL,
  dark_mode boolean DEFAULT false,
  cor_primaria text DEFAULT '187 65% 38%',
  nome_empresa text DEFAULT 'Gás Fácil',
  logo_url text,
  comprovante jsonb DEFAULT '{"mostrarLogo":true,"mostrarEndereco":true,"mostrarTelefone":true,"rodape":"Obrigado pela preferência! ♻️ Recicle seu botijão."}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.configuracoes_visuais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage visual configs"
  ON public.configuracoes_visuais
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE TRIGGER update_configuracoes_visuais_updated_at
  BEFORE UPDATE ON public.configuracoes_visuais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
