
ALTER TABLE public.configuracoes_empresa
ADD COLUMN IF NOT EXISTS regras_cadastro jsonb NOT NULL DEFAULT '{"telefone_obrigatorio": true, "canal_venda_obrigatorio": false, "email_obrigatorio": false, "endereco_obrigatorio": false, "cpf_obrigatorio": false}'::jsonb;
