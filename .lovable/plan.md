
# Plano: Customização dos Dados da Empresa no Comprovante PDF

## Resumo
Implementar um sistema para que os dados da empresa (nome, CNPJ, telefone, endereço e mensagem do cupom) possam ser configurados pela tela de Configurações e usados automaticamente no cabeçalho do comprovante PDF gerado após cada venda.

## O Que Será Feito

### 1. Criar Tabela de Configurações da Empresa
Uma nova tabela no banco de dados para armazenar as informações da empresa de forma centralizada.

**Campos:**
- `id` - Identificador único
- `nome_empresa` - Nome que aparece no cupom (ex: "GásPro Revenda")
- `cnpj` - CNPJ formatado
- `telefone` - Telefone de contato
- `endereco` - Endereço completo
- `mensagem_cupom` - Mensagem de rodapé (ex: "Obrigado pela preferência!")
- `created_at` / `updated_at` - Timestamps

### 2. Atualizar Tela de Configurações
Conectar o card "Dados da Empresa" ao banco de dados:
- Carregar dados salvos ao abrir a página
- Salvar alterações no banco ao clicar em "Salvar Alterações"
- Feedback visual de sucesso/erro

### 3. Integrar com Serviço de PDF
Modificar o `receiptPdfService.ts` para:
- Receber os dados da empresa como parâmetro
- Usar nome, CNPJ, telefone, endereço e mensagem personalizados
- Manter valores padrão caso não haja configuração

### 4. Atualizar Fluxo de Venda
Na tela `NovaVenda.tsx`:
- Buscar configurações da empresa antes de gerar o PDF
- Passar os dados para a função `generateReceiptPdf`

---

## Detalhes Técnicos

### Migração SQL
```sql
CREATE TABLE configuracoes_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa text NOT NULL DEFAULT 'Distribuidora Gás',
  cnpj text,
  telefone text,
  endereco text,
  mensagem_cupom text DEFAULT 'Obrigado pela preferência!',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Políticas de acesso (apenas admin/gestor podem editar)
ALTER TABLE configuracoes_empresa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view configuracoes" 
  ON configuracoes_empresa FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/Gestor can manage configuracoes" 
  ON configuracoes_empresa FOR ALL TO authenticated 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- Inserir configuração padrão
INSERT INTO configuracoes_empresa (nome_empresa, cnpj, telefone, endereco, mensagem_cupom)
VALUES ('GásPro Revenda', '12.345.678/0001-90', '(11) 3333-4444', 'Av. Principal, 100 - Centro', 'Obrigado pela preferência!');
```

### Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/services/receiptPdfService.ts` | Adicionar interface `EmpresaConfig` e usar dados dinâmicos no cabeçalho e rodapé |
| `src/pages/Configuracoes.tsx` | Integrar com banco de dados para carregar/salvar configurações |
| `src/pages/vendas/NovaVenda.tsx` | Buscar configurações da empresa antes de gerar PDF |

### Interface do Serviço de PDF (Atualizada)
```typescript
interface EmpresaConfig {
  nome_empresa: string;
  cnpj?: string;
  telefone?: string;
  endereco?: string;
  mensagem_cupom?: string;
}

interface ReceiptData {
  // ... campos existentes
  empresa: EmpresaConfig;
}
```

### Exemplo de Uso no PDF
```text
┌────────────────────────────┐
│    GÁSPRO REVENDA          │  ← nome_empresa
│  CNPJ: 12.345.678/0001-90  │  ← cnpj
│  Tel: (11) 3333-4444       │  ← telefone
│  Av. Principal, 100        │  ← endereco
├────────────────────────────┤
│  PEDIDO #ABC123...         │
│  ...                       │
├────────────────────────────┤
│  Obrigado pela preferência!│  ← mensagem_cupom
│  Volte sempre!             │
└────────────────────────────┘
```

## Resultado Esperado
- Administradores podem alterar os dados da empresa na tela de Configurações
- Todos os comprovantes gerados usarão automaticamente os dados atualizados
- Se não houver configuração, valores padrão serão utilizados
