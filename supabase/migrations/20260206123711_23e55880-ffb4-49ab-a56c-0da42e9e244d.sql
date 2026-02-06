-- Adicionar coluna tipo_botijao para distinguir cheio/vazio
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tipo_botijao text DEFAULT NULL;

-- Adicionar coluna para vincular produto cheio ao vazio correspondente
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS botijao_par_id uuid REFERENCES produtos(id) DEFAULT NULL;

-- Criar índice para busca rápida por tipo
CREATE INDEX IF NOT EXISTS idx_produtos_tipo_botijao ON produtos(tipo_botijao);
CREATE INDEX IF NOT EXISTS idx_produtos_botijao_par ON produtos(botijao_par_id);

-- Atualizar produtos existentes de gás como "cheio"
UPDATE produtos SET tipo_botijao = 'cheio' WHERE categoria = 'gas' AND tipo_botijao IS NULL;

-- Inserir versões vazias dos botijões
INSERT INTO produtos (nome, categoria, preco, estoque, ativo, tipo_botijao, descricao)
SELECT 
  nome || ' (Vazio)',
  categoria,
  0,
  0,
  true,
  'vazio',
  'Botijão vazio para troca'
FROM produtos 
WHERE categoria = 'gas' AND tipo_botijao = 'cheio'
ON CONFLICT DO NOTHING;

-- Vincular produtos cheios aos vazios correspondentes
UPDATE produtos p_cheio
SET botijao_par_id = p_vazio.id
FROM produtos p_vazio
WHERE p_cheio.categoria = 'gas' 
  AND p_cheio.tipo_botijao = 'cheio'
  AND p_vazio.tipo_botijao = 'vazio'
  AND p_vazio.nome = p_cheio.nome || ' (Vazio)'
  AND p_cheio.botijao_par_id IS NULL;

-- Vincular produtos vazios aos cheios correspondentes  
UPDATE produtos p_vazio
SET botijao_par_id = p_cheio.id
FROM produtos p_cheio
WHERE p_vazio.categoria = 'gas' 
  AND p_vazio.tipo_botijao = 'vazio'
  AND p_cheio.tipo_botijao = 'cheio'
  AND p_vazio.nome = p_cheio.nome || ' (Vazio)'
  AND p_vazio.botijao_par_id IS NULL;