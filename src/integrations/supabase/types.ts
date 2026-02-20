export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abastecimentos: {
        Row: {
          acerto_data: string | null
          created_at: string
          data: string
          entregador_id: string | null
          id: string
          km: number
          litros: number
          motorista: string
          nota_fiscal: string | null
          posto: string | null
          sem_saida_caixa: boolean
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor: number
          veiculo_id: string
        }
        Insert: {
          acerto_data?: string | null
          created_at?: string
          data?: string
          entregador_id?: string | null
          id?: string
          km: number
          litros: number
          motorista: string
          nota_fiscal?: string | null
          posto?: string | null
          sem_saida_caixa?: boolean
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor: number
          veiculo_id: string
        }
        Update: {
          acerto_data?: string | null
          created_at?: string
          data?: string
          entregador_id?: string | null
          id?: string
          km?: number
          litros?: number
          motorista?: string
          nota_fiscal?: string | null
          posto?: string | null
          sem_saida_caixa?: boolean
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "abastecimentos_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abastecimentos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abastecimentos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversas: {
        Row: {
          created_at: string
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_mensagens: {
        Row: {
          content: string
          conversa_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversa_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversa_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "ai_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_jornada: {
        Row: {
          created_at: string
          data: string
          descricao: string
          funcionario_id: string
          id: string
          nivel: string
          resolvido: boolean
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao: string
          funcionario_id: string
          id?: string
          nivel?: string
          resolvido?: boolean
          tipo: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          funcionario_id?: string
          id?: string
          nivel?: string
          resolvido?: boolean
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_jornada_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_jornada_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      anotacoes: {
        Row: {
          concluido: boolean
          conteudo: string | null
          cor: string
          created_at: string
          fixado: boolean
          id: string
          lembrete_data: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          concluido?: boolean
          conteudo?: string | null
          cor?: string
          created_at?: string
          fixado?: boolean
          id?: string
          lembrete_data?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          concluido?: boolean
          conteudo?: string | null
          cor?: string
          created_at?: string
          fixado?: boolean
          id?: string
          lembrete_data?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      atestados_faltas: {
        Row: {
          abona: boolean
          created_at: string
          data_fim: string
          data_inicio: string
          dias: number
          documento_url: string | null
          funcionario_id: string
          id: string
          motivo: string | null
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          abona?: boolean
          created_at?: string
          data_fim?: string
          data_inicio?: string
          dias?: number
          documento_url?: string | null
          funcionario_id: string
          id?: string
          motivo?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          abona?: boolean
          created_at?: string
          data_fim?: string
          data_inicio?: string
          dias?: number
          documento_url?: string | null
          funcionario_id?: string
          id?: string
          motivo?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atestados_faltas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atestados_faltas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_desempenho: {
        Row: {
          avaliador_id: string | null
          comunicacao: number | null
          created_at: string
          data_avaliacao: string
          funcionario_id: string
          id: string
          iniciativa: number | null
          metas_proximas: string | null
          nota_geral: number
          observacoes: string | null
          periodo_referencia: string
          pontos_fortes: string | null
          pontos_melhorar: string | null
          pontualidade: number | null
          produtividade: number | null
          status: string
          trabalho_equipe: number | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          avaliador_id?: string | null
          comunicacao?: number | null
          created_at?: string
          data_avaliacao?: string
          funcionario_id: string
          id?: string
          iniciativa?: number | null
          metas_proximas?: string | null
          nota_geral?: number
          observacoes?: string | null
          periodo_referencia: string
          pontos_fortes?: string | null
          pontos_melhorar?: string | null
          pontualidade?: number | null
          produtividade?: number | null
          status?: string
          trabalho_equipe?: number | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          avaliador_id?: string | null
          comunicacao?: number | null
          created_at?: string
          data_avaliacao?: string
          funcionario_id?: string
          id?: string
          iniciativa?: number | null
          metas_proximas?: string | null
          nota_geral?: number
          observacoes?: string | null
          periodo_referencia?: string
          pontos_fortes?: string | null
          pontos_melhorar?: string | null
          pontualidade?: number | null
          produtividade?: number | null
          status?: string
          trabalho_equipe?: number | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_desempenho_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_desempenho_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_entrega: {
        Row: {
          comentario: string | null
          created_at: string
          entregador_id: string | null
          id: string
          nota_entregador: number | null
          nota_produto: number | null
          pedido_id: string | null
          user_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          entregador_id?: string | null
          id?: string
          nota_entregador?: number | null
          nota_produto?: number | null
          pedido_id?: string | null
          user_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          entregador_id?: string | null
          id?: string
          nota_entregador?: number | null
          nota_produto?: number | null
          pedido_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_entrega_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_entrega_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      banco_horas: {
        Row: {
          created_at: string
          funcionario_id: string
          id: string
          observacoes: string | null
          saldo_negativo: number
          saldo_positivo: number
          ultima_atualizacao: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          funcionario_id: string
          id?: string
          observacoes?: string | null
          saldo_negativo?: number
          saldo_positivo?: number
          ultima_atualizacao?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          saldo_negativo?: number
          saldo_positivo?: number
          ultima_atualizacao?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banco_horas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banco_horas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      boletos_emitidos: {
        Row: {
          conta_receber_id: string | null
          cpf_cnpj: string
          created_at: string
          descricao: string | null
          emissao: string
          endereco: string | null
          id: string
          instrucoes: string | null
          juros_mes: number | null
          linha_digitavel: string | null
          multa: number | null
          numero: number
          observacoes: string | null
          sacado: string
          status: string
          unidade_id: string | null
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          conta_receber_id?: string | null
          cpf_cnpj: string
          created_at?: string
          descricao?: string | null
          emissao?: string
          endereco?: string | null
          id?: string
          instrucoes?: string | null
          juros_mes?: number | null
          linha_digitavel?: string | null
          multa?: number | null
          numero?: number
          observacoes?: string | null
          sacado: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          conta_receber_id?: string | null
          cpf_cnpj?: string
          created_at?: string
          descricao?: string | null
          emissao?: string
          endereco?: string | null
          id?: string
          instrucoes?: string | null
          juros_mes?: number | null
          linha_digitavel?: string | null
          multa?: number | null
          numero?: number
          observacoes?: string | null
          sacado?: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletos_emitidos_conta_receber_id_fkey"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletos_emitidos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus: {
        Row: {
          created_at: string
          funcionario_id: string
          id: string
          mes_referencia: string | null
          observacoes: string | null
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          funcionario_id: string
          id?: string
          mes_referencia?: string | null
          observacoes?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          funcionario_id?: string
          id?: string
          mes_referencia?: string | null
          observacoes?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "bonus_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_sessoes: {
        Row: {
          aberto_em: string
          created_at: string
          data: string
          diferenca: number | null
          fechado_em: string | null
          id: string
          observacoes_abertura: string | null
          observacoes_fechamento: string | null
          status: string
          unidade_id: string | null
          updated_at: string
          usuario_abertura_id: string
          usuario_fechamento_id: string | null
          valor_abertura: number
          valor_fechamento: number | null
        }
        Insert: {
          aberto_em?: string
          created_at?: string
          data?: string
          diferenca?: number | null
          fechado_em?: string | null
          id?: string
          observacoes_abertura?: string | null
          observacoes_fechamento?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          usuario_abertura_id: string
          usuario_fechamento_id?: string | null
          valor_abertura?: number
          valor_fechamento?: number | null
        }
        Update: {
          aberto_em?: string
          created_at?: string
          data?: string
          diferenca?: number | null
          fechado_em?: string | null
          id?: string
          observacoes_abertura?: string | null
          observacoes_fechamento?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          usuario_abertura_id?: string
          usuario_fechamento_id?: string | null
          valor_abertura?: number
          valor_fechamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "caixa_sessoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      campanhas: {
        Row: {
          alcance: number
          created_at: string
          data_criacao: string
          enviados: number
          id: string
          nome: string
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          alcance?: number
          created_at?: string
          data_criacao?: string
          enviados?: number
          id?: string
          nome: string
          status?: string
          tipo: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          alcance?: number
          created_at?: string
          data_criacao?: string
          enviados?: number
          id?: string
          nome?: string
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      canais_venda: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          parceiro_id: string | null
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          parceiro_id?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          parceiro_id?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "canais_venda_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      carregamento_rota_itens: {
        Row: {
          carregamento_id: string
          created_at: string
          id: string
          produto_id: string
          quantidade_retorno: number | null
          quantidade_saida: number
          quantidade_vendida: number | null
        }
        Insert: {
          carregamento_id: string
          created_at?: string
          id?: string
          produto_id: string
          quantidade_retorno?: number | null
          quantidade_saida?: number
          quantidade_vendida?: number | null
        }
        Update: {
          carregamento_id?: string
          created_at?: string
          id?: string
          produto_id?: string
          quantidade_retorno?: number | null
          quantidade_saida?: number
          quantidade_vendida?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "carregamento_rota_itens_carregamento_id_fkey"
            columns: ["carregamento_id"]
            isOneToOne: false
            referencedRelation: "carregamentos_rota"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carregamento_rota_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      carregamentos_rota: {
        Row: {
          created_at: string
          data_retorno: string | null
          data_saida: string
          entregador_id: string
          id: string
          observacoes: string | null
          rota_definida_id: string | null
          status: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_retorno?: string | null
          data_saida?: string
          entregador_id: string
          id?: string
          observacoes?: string | null
          rota_definida_id?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_retorno?: string | null
          data_saida?: string
          entregador_id?: string
          id?: string
          observacoes?: string | null
          rota_definida_id?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carregamentos_rota_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carregamentos_rota_rota_definida_id_fkey"
            columns: ["rota_definida_id"]
            isOneToOne: false
            referencedRelation: "rotas_definidas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carregamentos_rota_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_despesa: {
        Row: {
          ativo: boolean
          codigo_contabil: string | null
          created_at: string
          descricao: string | null
          grupo: string
          id: string
          nome: string
          ordem: number
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean
          codigo_contabil?: string | null
          created_at?: string
          descricao?: string | null
          grupo?: string
          id?: string
          nome: string
          ordem?: number
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean
          codigo_contabil?: string | null
          created_at?: string
          descricao?: string | null
          grupo?: string
          id?: string
          nome?: string
          ordem?: number
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_despesa_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      chamadas_recebidas: {
        Row: {
          atendente_id: string | null
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          duracao_segundos: number | null
          id: string
          observacoes: string | null
          pedido_gerado_id: string | null
          status: string
          telefone: string
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          atendente_id?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          duracao_segundos?: number | null
          id?: string
          observacoes?: string | null
          pedido_gerado_id?: string | null
          status?: string
          telefone: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          atendente_id?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          duracao_segundos?: number | null
          id?: string
          observacoes?: string | null
          pedido_gerado_id?: string | null
          status?: string
          telefone?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamadas_recebidas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chamadas_recebidas_pedido_gerado_id_fkey"
            columns: ["pedido_gerado_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chamadas_recebidas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mensagens: {
        Row: {
          created_at: string
          destinatario_id: string | null
          destinatario_tipo: string
          id: string
          lida: boolean
          mensagem: string
          pedido_id: string | null
          remetente_id: string
          remetente_nome: string | null
          remetente_tipo: string
        }
        Insert: {
          created_at?: string
          destinatario_id?: string | null
          destinatario_tipo?: string
          id?: string
          lida?: boolean
          mensagem: string
          pedido_id?: string | null
          remetente_id: string
          remetente_nome?: string | null
          remetente_tipo?: string
        }
        Update: {
          created_at?: string
          destinatario_id?: string | null
          destinatario_tipo?: string
          id?: string
          lida?: boolean
          mensagem?: string
          pedido_id?: string | null
          remetente_id?: string
          remetente_nome?: string | null
          remetente_tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_saida_veiculo: {
        Row: {
          agua: boolean
          aprovado: boolean
          avarias: boolean
          created_at: string
          data: string
          documentos: boolean
          entregador_id: string
          freios: boolean
          id: string
          limpeza: boolean
          luzes: boolean
          observacoes: string | null
          oleo: boolean
          pneus: boolean
          unidade_id: string | null
          veiculo_id: string
        }
        Insert: {
          agua?: boolean
          aprovado?: boolean
          avarias?: boolean
          created_at?: string
          data?: string
          documentos?: boolean
          entregador_id: string
          freios?: boolean
          id?: string
          limpeza?: boolean
          luzes?: boolean
          observacoes?: string | null
          oleo?: boolean
          pneus?: boolean
          unidade_id?: string | null
          veiculo_id: string
        }
        Update: {
          agua?: boolean
          aprovado?: boolean
          avarias?: boolean
          created_at?: string
          data?: string
          documentos?: boolean
          entregador_id?: string
          freios?: boolean
          id?: string
          limpeza?: boolean
          luzes?: boolean
          observacoes?: string | null
          oleo?: boolean
          pneus?: boolean
          unidade_id?: string | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_saida_veiculo_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_saida_veiculo_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_saida_veiculo_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_enderecos: {
        Row: {
          apelido: string
          bairro: string
          cep: string | null
          cidade: string | null
          cliente_id: string | null
          complemento: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          numero: string
          principal: boolean | null
          referencia: string | null
          rua: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido?: string
          bairro: string
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          numero: string
          principal?: boolean | null
          referencia?: string | null
          rua: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string
          bairro?: string
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          numero?: string
          principal?: boolean | null
          referencia?: string | null
          rua?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_enderecos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_observacoes: {
        Row: {
          autor_id: string | null
          cliente_id: string
          created_at: string
          id: string
          texto: string
          updated_at: string
        }
        Insert: {
          autor_id?: string | null
          cliente_id: string
          created_at?: string
          id?: string
          texto: string
          updated_at?: string
        }
        Update: {
          autor_id?: string | null
          cliente_id?: string
          created_at?: string
          id?: string
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_observacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_tag_associacoes: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_tag_associacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_tag_associacoes_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "cliente_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_tags: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          numero: string | null
          telefone: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          numero?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          numero?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comissao_config: {
        Row: {
          canal_venda: string
          created_at: string
          id: string
          produto_id: string
          unidade_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          canal_venda: string
          created_at?: string
          id?: string
          produto_id: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          canal_venda?: string
          created_at?: string
          id?: string
          produto_id?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissao_config_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissao_config_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      comodatos: {
        Row: {
          cliente_id: string
          created_at: string
          data_devolucao: string | null
          data_emprestimo: string
          deposito: number
          id: string
          observacoes: string | null
          prazo_devolucao: string | null
          produto_id: string
          quantidade: number
          status: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          deposito?: number
          id?: string
          observacoes?: string | null
          prazo_devolucao?: string | null
          produto_id: string
          quantidade?: number
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          deposito?: number
          id?: string
          observacoes?: string | null
          prazo_devolucao?: string | null
          produto_id?: string
          quantidade?: number
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comodatos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comodatos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      compra_itens: {
        Row: {
          compra_id: string
          created_at: string
          id: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          compra_id: string
          created_at?: string
          id?: string
          preco_unitario: number
          produto_id?: string | null
          quantidade?: number
        }
        Update: {
          compra_id?: string
          created_at?: string
          id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "compra_itens_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compra_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          chave_nfe: string | null
          created_at: string
          data_compra: string | null
          data_pagamento: string | null
          data_prevista: string | null
          data_recebimento: string | null
          fornecedor_id: string | null
          id: string
          numero_nota_fiscal: string | null
          observacoes: string | null
          status: string | null
          unidade_id: string | null
          updated_at: string
          valor_frete: number | null
          valor_total: number | null
        }
        Insert: {
          chave_nfe?: string | null
          created_at?: string
          data_compra?: string | null
          data_pagamento?: string | null
          data_prevista?: string | null
          data_recebimento?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nota_fiscal?: string | null
          observacoes?: string | null
          status?: string | null
          unidade_id?: string | null
          updated_at?: string
          valor_frete?: number | null
          valor_total?: number | null
        }
        Update: {
          chave_nfe?: string | null
          created_at?: string
          data_compra?: string | null
          data_pagamento?: string | null
          data_prevista?: string | null
          data_recebimento?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nota_fiscal?: string | null
          observacoes?: string | null
          status?: string | null
          unidade_id?: string | null
          updated_at?: string
          valor_frete?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      conferencia_cartao: {
        Row: {
          autorizacao: string | null
          bandeira: string | null
          created_at: string
          data_deposito_real: string | null
          data_prevista_deposito: string | null
          data_venda: string
          id: string
          nsu: string | null
          observacoes: string | null
          operadora_id: string | null
          parcelas: number
          pedido_id: string | null
          status: string
          taxa_percentual: number
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor_bruto: number
          valor_liquido_esperado: number
          valor_liquido_recebido: number | null
          valor_taxa: number
        }
        Insert: {
          autorizacao?: string | null
          bandeira?: string | null
          created_at?: string
          data_deposito_real?: string | null
          data_prevista_deposito?: string | null
          data_venda?: string
          id?: string
          nsu?: string | null
          observacoes?: string | null
          operadora_id?: string | null
          parcelas?: number
          pedido_id?: string | null
          status?: string
          taxa_percentual?: number
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_bruto?: number
          valor_liquido_esperado?: number
          valor_liquido_recebido?: number | null
          valor_taxa?: number
        }
        Update: {
          autorizacao?: string | null
          bandeira?: string | null
          created_at?: string
          data_deposito_real?: string | null
          data_prevista_deposito?: string | null
          data_venda?: string
          id?: string
          nsu?: string | null
          observacoes?: string | null
          operadora_id?: string | null
          parcelas?: number
          pedido_id?: string | null
          status?: string
          taxa_percentual?: number
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_bruto?: number
          valor_liquido_esperado?: number
          valor_liquido_recebido?: number | null
          valor_taxa?: number
        }
        Relationships: [
          {
            foreignKeyName: "conferencia_cartao_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras_cartao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conferencia_cartao_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conferencia_cartao_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_empresa: {
        Row: {
          cnpj: string | null
          created_at: string
          endereco: string | null
          id: string
          mensagem_cupom: string | null
          nome_empresa: string
          regras_cadastro: Json
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          mensagem_cupom?: string | null
          nome_empresa?: string
          regras_cadastro?: Json
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          mensagem_cupom?: string | null
          nome_empresa?: string
          regras_cadastro?: Json
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conquistas: {
        Row: {
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          meta_valor: number
          nome: string
          pontos: number
          tipo: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          meta_valor?: number
          nome: string
          pontos?: number
          tipo?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          meta_valor?: number
          nome?: string
          pontos?: number
          tipo?: string
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          boleto_codigo_barras: string | null
          boleto_linha_digitavel: string | null
          boleto_url: string | null
          categoria: string | null
          created_at: string
          descricao: string
          fornecedor: string
          id: string
          observacoes: string | null
          status: string
          unidade_id: string | null
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          boleto_codigo_barras?: string | null
          boleto_linha_digitavel?: string | null
          boleto_url?: string | null
          categoria?: string | null
          created_at?: string
          descricao: string
          fornecedor: string
          id?: string
          observacoes?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          boleto_codigo_barras?: string | null
          boleto_linha_digitavel?: string | null
          boleto_url?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string
          fornecedor?: string
          id?: string
          observacoes?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          cliente: string
          created_at: string
          descricao: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          pedido_id: string | null
          status: string
          unidade_id: string | null
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          cliente: string
          created_at?: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          cliente?: string
          created_at?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_recorrentes: {
        Row: {
          cliente_id: string
          cliente_nome: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          dia_preferencial: number | null
          entregas_realizadas: number
          frequencia: string
          id: string
          observacoes: string | null
          produto_id: string | null
          produto_nome: string
          proxima_entrega: string | null
          quantidade: number
          status: string
          turno_preferencial: string | null
          unidade_id: string | null
          updated_at: string
          valor_unitario: number
        }
        Insert: {
          cliente_id: string
          cliente_nome: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dia_preferencial?: number | null
          entregas_realizadas?: number
          frequencia?: string
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          produto_nome: string
          proxima_entrega?: string | null
          quantidade?: number
          status?: string
          turno_preferencial?: string | null
          unidade_id?: string | null
          updated_at?: string
          valor_unitario?: number
        }
        Update: {
          cliente_id?: string
          cliente_nome?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dia_preferencial?: number | null
          entregas_realizadas?: number
          frequencia?: string
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          produto_nome?: string
          proxima_entrega?: string | null
          quantidade?: number
          status?: string
          turno_preferencial?: string | null
          unidade_id?: string | null
          updated_at?: string
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_recorrentes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_recorrentes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_recorrentes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons_desconto: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          limite_uso: number | null
          tipo: string
          unidade_id: string | null
          updated_at: string
          usos: number
          validade: string | null
          valor: number
          valor_minimo: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          usos?: number
          validade?: string | null
          valor?: number
          valor_minimo?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          usos?: number
          validade?: string | null
          valor?: number
          valor_minimo?: number
        }
        Relationships: [
          {
            foreignKeyName: "cupons_desconto_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      devolucao_itens: {
        Row: {
          created_at: string
          devolucao_id: string
          id: string
          motivo_item: string | null
          produto_id: string | null
          produto_nome: string
          quantidade: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          devolucao_id: string
          id?: string
          motivo_item?: string | null
          produto_id?: string | null
          produto_nome: string
          quantidade?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          devolucao_id?: string
          id?: string
          motivo_item?: string | null
          produto_id?: string | null
          produto_nome?: string
          quantidade?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "devolucao_itens_devolucao_id_fkey"
            columns: ["devolucao_id"]
            isOneToOne: false
            referencedRelation: "devolucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucao_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      devolucoes: {
        Row: {
          aprovado_por: string | null
          cliente_id: string | null
          cliente_nome: string
          created_at: string
          data_aprovacao: string | null
          id: string
          motivo: string
          observacoes: string | null
          pedido_id: string | null
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor_total: number
        }
        Insert: {
          aprovado_por?: string | null
          cliente_id?: string | null
          cliente_nome: string
          created_at?: string
          data_aprovacao?: string | null
          id?: string
          motivo: string
          observacoes?: string | null
          pedido_id?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_total?: number
        }
        Update: {
          aprovado_por?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          created_at?: string
          data_aprovacao?: string | null
          id?: string
          motivo?: string
          observacoes?: string | null
          pedido_id?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "devolucoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devolucoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_contabeis: {
        Row: {
          arquivo_url: string | null
          created_at: string
          gerado_em: string | null
          id: string
          periodo: string
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          gerado_em?: string | null
          id?: string
          periodo: string
          status?: string
          tipo: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          gerado_em?: string | null
          id?: string
          periodo?: string
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_contabeis_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_empresa: {
        Row: {
          arquivo_nome: string
          arquivo_tamanho: number | null
          arquivo_url: string
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          unidade_id: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_tamanho?: number | null
          arquivo_url: string
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          unidade_id?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_tamanho?: number | null
          arquivo_url?: string
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          unidade_id?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_empresa_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      entregador_conquistas: {
        Row: {
          conquista_id: string
          desbloqueada_em: string
          entregador_id: string
          id: string
        }
        Insert: {
          conquista_id: string
          desbloqueada_em?: string
          entregador_id: string
          id?: string
        }
        Update: {
          conquista_id?: string
          desbloqueada_em?: string
          entregador_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregador_conquistas_conquista_id_fkey"
            columns: ["conquista_id"]
            isOneToOne: false
            referencedRelation: "conquistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregador_conquistas_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
        ]
      }
      entregadores: {
        Row: {
          ativo: boolean | null
          cnh: string | null
          cnh_vencimento: string | null
          cpf: string | null
          created_at: string
          email: string | null
          funcionario_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          status: string | null
          telefone: string | null
          unidade_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnh?: string | null
          cnh_vencimento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          funcionario_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          status?: string | null
          telefone?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnh?: string | null
          cnh_vencimento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          funcionario_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          status?: string | null
          telefone?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregadores_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregadores_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      escalas_entregador: {
        Row: {
          created_at: string
          data: string
          entregador_id: string
          id: string
          observacoes: string | null
          rota_definida_id: string | null
          status: string
          turno_fim: string
          turno_inicio: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          entregador_id: string
          id?: string
          observacoes?: string | null
          rota_definida_id?: string | null
          status?: string
          turno_fim?: string
          turno_inicio?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          entregador_id?: string
          id?: string
          observacoes?: string | null
          rota_definida_id?: string | null
          status?: string
          turno_fim?: string
          turno_inicio?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalas_entregador_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_entregador_rota_definida_id_fkey"
            columns: ["rota_definida_id"]
            isOneToOne: false
            referencedRelation: "rotas_definidas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalas_entregador_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      extrato_bancario: {
        Row: {
          conciliado: boolean
          created_at: string
          data: string
          descricao: string
          id: string
          pedido_id: string | null
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          conciliado?: boolean
          created_at?: string
          data?: string
          descricao: string
          id?: string
          pedido_id?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          conciliado?: boolean
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          pedido_id?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extrato_bancario_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extrato_bancario_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      ferias: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          dias_direito: number
          dias_gozados: number
          dias_vendidos: number
          funcionario_id: string
          id: string
          observacoes: string | null
          periodo_aquisitivo_fim: string
          periodo_aquisitivo_inicio: string
          status: string
          unidade_id: string | null
          updated_at: string
          valor_abono: number | null
          valor_ferias: number | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          dias_direito?: number
          dias_gozados?: number
          dias_vendidos?: number
          funcionario_id: string
          id?: string
          observacoes?: string | null
          periodo_aquisitivo_fim: string
          periodo_aquisitivo_inicio: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor_abono?: number | null
          valor_ferias?: number | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          dias_direito?: number
          dias_gozados?: number
          dias_vendidos?: number
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          periodo_aquisitivo_fim?: string
          periodo_aquisitivo_inicio?: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor_abono?: number | null
          valor_ferias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ferias_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ferias_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      fidelidade_clientes: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          indicacoes_realizadas: number
          nivel: string
          pontos: number
          ultima_atualizacao: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          indicacoes_realizadas?: number
          nivel?: string
          pontos?: number
          ultima_atualizacao?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          indicacoes_realizadas?: number
          nivel?: string
          pontos?: number
          ultima_atualizacao?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fidelidade_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fidelidade_clientes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_pagamento_itens: {
        Row: {
          bonus: number
          bruto: number
          cargo: string | null
          comissao: number
          created_at: string
          folha_id: string
          funcionario_id: string
          funcionario_nome: string
          horas_extras: number
          id: string
          inss: number
          ir: number
          liquido: number
          outros_descontos: number
          salario_base: number
          total_descontos: number
          vales_desconto: number
        }
        Insert: {
          bonus?: number
          bruto?: number
          cargo?: string | null
          comissao?: number
          created_at?: string
          folha_id: string
          funcionario_id: string
          funcionario_nome: string
          horas_extras?: number
          id?: string
          inss?: number
          ir?: number
          liquido?: number
          outros_descontos?: number
          salario_base?: number
          total_descontos?: number
          vales_desconto?: number
        }
        Update: {
          bonus?: number
          bruto?: number
          cargo?: string | null
          comissao?: number
          created_at?: string
          folha_id?: string
          funcionario_id?: string
          funcionario_nome?: string
          horas_extras?: number
          id?: string
          inss?: number
          ir?: number
          liquido?: number
          outros_descontos?: number
          salario_base?: number
          total_descontos?: number
          vales_desconto?: number
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_itens_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "folhas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_pagamento_itens_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      folhas_pagamento: {
        Row: {
          created_at: string
          data_fechamento: string
          id: string
          mes_referencia: string
          observacoes: string | null
          status: string
          total_bruto: number
          total_comissoes: number
          total_descontos: number
          total_funcionarios: number
          total_liquido: number
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fechamento?: string
          id?: string
          mes_referencia: string
          observacoes?: string | null
          status?: string
          total_bruto?: number
          total_comissoes?: number
          total_descontos?: number
          total_funcionarios?: number
          total_liquido?: number
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fechamento?: string
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          status?: string
          total_bruto?: number
          total_comissoes?: number
          total_descontos?: number
          total_funcionarios?: number
          total_liquido?: number
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folhas_pagamento_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          contato_cargo: string | null
          contato_nome: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          contato_cargo?: string | null
          contato_nome?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          contato_cargo?: string | null
          contato_nome?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          cpf: string | null
          created_at: string
          data_admissao: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          salario: number | null
          setor: string | null
          status: string | null
          telefone: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          salario?: number | null
          setor?: string | null
          status?: string | null
          telefone?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          salario?: number | null
          setor?: string | null
          status?: string | null
          telefone?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      gamificacao_ranking: {
        Row: {
          avaliacao_media: number
          conquistas_desbloqueadas: number
          created_at: string
          entregador_id: string
          entregas_realizadas: number
          id: string
          mes_referencia: string
          pontos: number
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          avaliacao_media?: number
          conquistas_desbloqueadas?: number
          created_at?: string
          entregador_id: string
          entregas_realizadas?: number
          id?: string
          mes_referencia: string
          pontos?: number
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          avaliacao_media?: number
          conquistas_desbloqueadas?: number
          created_at?: string
          entregador_id?: string
          entregas_realizadas?: number
          id?: string
          mes_referencia?: string
          pontos?: number
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamificacao_ranking_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamificacao_ranking_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_funcionario: {
        Row: {
          created_at: string
          dias_semana: string | null
          entrada: string
          entregador_id: string | null
          funcionario_id: string | null
          id: string
          intervalo: string | null
          saida: string
          turno: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dias_semana?: string | null
          entrada?: string
          entregador_id?: string | null
          funcionario_id?: string | null
          id?: string
          intervalo?: string | null
          saida?: string
          turno?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dias_semana?: string | null
          entrada?: string
          entregador_id?: string | null
          funcionario_id?: string | null
          id?: string
          intervalo?: string | null
          saida?: string
          turno?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_funcionario_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horarios_funcionario_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horarios_funcionario_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacao_documentos: {
        Row: {
          created_at: string
          id: string
          licitacao_id: string
          nome: string
          tipo: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          licitacao_id: string
          nome: string
          tipo?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          licitacao_id?: string
          nome?: string
          tipo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licitacao_documentos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacao_ocorrencias: {
        Row: {
          autor_id: string | null
          created_at: string
          descricao: string
          id: string
          licitacao_id: string
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          descricao: string
          id?: string
          licitacao_id: string
          tipo?: string
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          descricao?: string
          id?: string
          licitacao_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "licitacao_ocorrencias_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacoes: {
        Row: {
          cnpj_orgao: string | null
          created_at: string
          data_abertura: string | null
          data_publicacao: string | null
          data_resultado: string | null
          data_vigencia_fim: string | null
          data_vigencia_inicio: string | null
          id: string
          link_edital: string | null
          local_entrega: string | null
          modalidade: string
          numero: string
          numero_processo: string | null
          objeto: string
          observacoes: string | null
          orgao: string
          prazo_entrega: string | null
          produtos: string | null
          responsavel_id: string | null
          status: string
          unidade_id: string | null
          updated_at: string
          valor_adjudicado: number | null
          valor_estimado: number | null
          valor_proposta: number | null
        }
        Insert: {
          cnpj_orgao?: string | null
          created_at?: string
          data_abertura?: string | null
          data_publicacao?: string | null
          data_resultado?: string | null
          data_vigencia_fim?: string | null
          data_vigencia_inicio?: string | null
          id?: string
          link_edital?: string | null
          local_entrega?: string | null
          modalidade?: string
          numero: string
          numero_processo?: string | null
          objeto: string
          observacoes?: string | null
          orgao: string
          prazo_entrega?: string | null
          produtos?: string | null
          responsavel_id?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor_adjudicado?: number | null
          valor_estimado?: number | null
          valor_proposta?: number | null
        }
        Update: {
          cnpj_orgao?: string | null
          created_at?: string
          data_abertura?: string | null
          data_publicacao?: string | null
          data_resultado?: string | null
          data_vigencia_fim?: string | null
          data_vigencia_inicio?: string | null
          id?: string
          link_edital?: string | null
          local_entrega?: string | null
          modalidade?: string
          numero?: string
          numero_processo?: string | null
          objeto?: string
          observacoes?: string | null
          orgao?: string
          prazo_entrega?: string | null
          produtos?: string | null
          responsavel_id?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor_adjudicado?: number | null
          valor_estimado?: number | null
          valor_proposta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "licitacoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      manutencoes: {
        Row: {
          created_at: string
          data: string
          descricao: string
          id: string
          oficina: string
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor: number
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao: string
          id?: string
          oficina: string
          status?: string
          tipo: string
          unidade_id?: string | null
          updated_at?: string
          valor: number
          veiculo_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          oficina?: string
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manutencoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      mdfe_nfes_vinculadas: {
        Row: {
          chave_acesso: string
          created_at: string
          destinatario: string | null
          id: string
          mdfe_id: string
          nfe_id: string | null
          valor: number | null
        }
        Insert: {
          chave_acesso: string
          created_at?: string
          destinatario?: string | null
          id?: string
          mdfe_id: string
          nfe_id?: string | null
          valor?: number | null
        }
        Update: {
          chave_acesso?: string
          created_at?: string
          destinatario?: string | null
          id?: string
          mdfe_id?: string
          nfe_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mdfe_nfes_vinculadas_mdfe_id_fkey"
            columns: ["mdfe_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mdfe_nfes_vinculadas_nfe_id_fkey"
            columns: ["nfe_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          prazo: string
          status: string
          tipo: string
          titulo: string
          unidade_id: string | null
          updated_at: string
          valor_atual: number
          valor_objetivo: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          prazo: string
          status?: string
          tipo: string
          titulo: string
          unidade_id?: string | null
          updated_at?: string
          valor_atual?: number
          valor_objetivo: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          prazo?: string
          status?: string
          tipo?: string
          titulo?: string
          unidade_id?: string | null
          updated_at?: string
          valor_atual?: number
          valor_objetivo?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_caixa: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string
          entregador_id: string | null
          id: string
          observacoes: string | null
          pedido_id: string | null
          responsavel: string | null
          solicitante: string | null
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          urgencia: string | null
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao: string
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          responsavel?: string | null
          solicitante?: string | null
          status?: string
          tipo: string
          unidade_id?: string | null
          updated_at?: string
          urgencia?: string | null
          valor?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          responsavel?: string | null
          solicitante?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          urgencia?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_caixa_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_caixa_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_caixa_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          produto_id: string
          quantidade: number
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          produto_id: string
          quantidade?: number
          tipo: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      multas_frota: {
        Row: {
          created_at: string
          data_infracao: string
          data_vencimento: string | null
          descricao: string
          entregador_id: string | null
          id: string
          observacoes: string | null
          pontos: number
          responsavel: string
          status: string
          unidade_id: string | null
          updated_at: string
          valor: number
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          data_infracao?: string
          data_vencimento?: string | null
          descricao: string
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          pontos?: number
          responsavel?: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          veiculo_id: string
        }
        Update: {
          created_at?: string
          data_infracao?: string
          data_vencimento?: string | null
          descricao?: string
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          pontos?: number
          responsavel?: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multas_frota_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multas_frota_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multas_frota_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      nota_fiscal_itens: {
        Row: {
          cfop: string | null
          created_at: string
          descricao: string
          id: string
          ncm: string | null
          nota_fiscal_id: string
          produto_id: string | null
          quantidade: number
          unidade: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cfop?: string | null
          created_at?: string
          descricao: string
          id?: string
          ncm?: string | null
          nota_fiscal_id: string
          produto_id?: string | null
          quantidade?: number
          unidade?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          cfop?: string | null
          created_at?: string
          descricao?: string
          id?: string
          ncm?: string | null
          nota_fiscal_id?: string
          produto_id?: string | null
          quantidade?: number
          unidade?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "nota_fiscal_itens_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nota_fiscal_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          carta_correcao: string | null
          chave_acesso: string | null
          created_at: string
          created_by: string | null
          danfe_url: string | null
          data_cancelamento: string | null
          data_emissao: string
          destinatario_cep: string | null
          destinatario_cidade_uf: string | null
          destinatario_cpf_cnpj: string | null
          destinatario_endereco: string | null
          destinatario_ie: string | null
          destinatario_nome: string | null
          destinatario_telefone: string | null
          focus_id: string | null
          focus_ref: string | null
          forma_pagamento: string | null
          id: string
          modal: string | null
          motivo_cancelamento: string | null
          motivo_rejeicao: string | null
          motorista_cpf: string | null
          motorista_nome: string | null
          natureza_operacao: string | null
          numero: string | null
          observacoes: string | null
          peso_bruto: number | null
          placa: string | null
          protocolo: string | null
          protocolo_cancelamento: string | null
          protocolo_carta_correcao: string | null
          remetente_cpf_cnpj: string | null
          remetente_endereco: string | null
          remetente_nome: string | null
          rntrc: string | null
          serie: string | null
          status: string
          tipo: string
          uf_carregamento: string | null
          uf_descarregamento: string | null
          unidade_id: string | null
          updated_at: string
          valor_desconto: number | null
          valor_frete: number | null
          valor_icms: number | null
          valor_mercadoria: number | null
          valor_total: number
          xml_url: string | null
        }
        Insert: {
          carta_correcao?: string | null
          chave_acesso?: string | null
          created_at?: string
          created_by?: string | null
          danfe_url?: string | null
          data_cancelamento?: string | null
          data_emissao?: string
          destinatario_cep?: string | null
          destinatario_cidade_uf?: string | null
          destinatario_cpf_cnpj?: string | null
          destinatario_endereco?: string | null
          destinatario_ie?: string | null
          destinatario_nome?: string | null
          destinatario_telefone?: string | null
          focus_id?: string | null
          focus_ref?: string | null
          forma_pagamento?: string | null
          id?: string
          modal?: string | null
          motivo_cancelamento?: string | null
          motivo_rejeicao?: string | null
          motorista_cpf?: string | null
          motorista_nome?: string | null
          natureza_operacao?: string | null
          numero?: string | null
          observacoes?: string | null
          peso_bruto?: number | null
          placa?: string | null
          protocolo?: string | null
          protocolo_cancelamento?: string | null
          protocolo_carta_correcao?: string | null
          remetente_cpf_cnpj?: string | null
          remetente_endereco?: string | null
          remetente_nome?: string | null
          rntrc?: string | null
          serie?: string | null
          status?: string
          tipo?: string
          uf_carregamento?: string | null
          uf_descarregamento?: string | null
          unidade_id?: string | null
          updated_at?: string
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_mercadoria?: number | null
          valor_total?: number
          xml_url?: string | null
        }
        Update: {
          carta_correcao?: string | null
          chave_acesso?: string | null
          created_at?: string
          created_by?: string | null
          danfe_url?: string | null
          data_cancelamento?: string | null
          data_emissao?: string
          destinatario_cep?: string | null
          destinatario_cidade_uf?: string | null
          destinatario_cpf_cnpj?: string | null
          destinatario_endereco?: string | null
          destinatario_ie?: string | null
          destinatario_nome?: string | null
          destinatario_telefone?: string | null
          focus_id?: string | null
          focus_ref?: string | null
          forma_pagamento?: string | null
          id?: string
          modal?: string | null
          motivo_cancelamento?: string | null
          motivo_rejeicao?: string | null
          motorista_cpf?: string | null
          motorista_nome?: string | null
          natureza_operacao?: string | null
          numero?: string | null
          observacoes?: string | null
          peso_bruto?: number | null
          placa?: string | null
          protocolo?: string | null
          protocolo_cancelamento?: string | null
          protocolo_carta_correcao?: string | null
          remetente_cpf_cnpj?: string | null
          remetente_endereco?: string | null
          remetente_nome?: string | null
          rntrc?: string | null
          serie?: string | null
          status?: string
          tipo?: string
          uf_carregamento?: string | null
          uf_descarregamento?: string | null
          unidade_id?: string | null
          updated_at?: string
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_mercadoria?: number | null
          valor_total?: number
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklists: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string
          funcionario_id: string
          id: string
          observacoes: string | null
          responsavel_id: string | null
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          funcionario_id: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_itens: {
        Row: {
          checklist_id: string
          concluido: boolean
          created_at: string
          data_conclusao: string | null
          descricao: string
          id: string
          ordem: number
          responsavel: string | null
        }
        Insert: {
          checklist_id: string
          concluido?: boolean
          created_at?: string
          data_conclusao?: string | null
          descricao: string
          id?: string
          ordem?: number
          responsavel?: string | null
        }
        Update: {
          checklist_id?: string
          concluido?: boolean
          created_at?: string
          data_conclusao?: string | null
          descricao?: string
          id?: string
          ordem?: number
          responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      operadoras_cartao: {
        Row: {
          ativo: boolean
          bandeira: string | null
          created_at: string
          id: string
          nome: string
          prazo_credito: number
          prazo_debito: number
          taxa_credito_parcelado: number
          taxa_credito_vista: number
          taxa_debito: number
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bandeira?: string | null
          created_at?: string
          id?: string
          nome: string
          prazo_credito?: number
          prazo_debito?: number
          taxa_credito_parcelado?: number
          taxa_credito_vista?: number
          taxa_debito?: number
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bandeira?: string | null
          created_at?: string
          id?: string
          nome?: string
          prazo_credito?: number
          prazo_debito?: number
          taxa_credito_parcelado?: number
          taxa_credito_vista?: number
          taxa_debito?: number
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operadoras_cartao_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id?: string | null
          quantidade?: number
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          bairro_entrega: string | null
          canal_venda: string | null
          cep_entrega: string | null
          cidade_entrega: string | null
          cliente_id: string | null
          complemento_entrega: string | null
          created_at: string
          endereco_entrega: string | null
          entregador_id: string | null
          forma_pagamento: string | null
          id: string
          latitude: number | null
          longitude: number | null
          numero_entrega: string | null
          observacoes: string | null
          status: string | null
          troco_para: number | null
          unidade_id: string | null
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          bairro_entrega?: string | null
          canal_venda?: string | null
          cep_entrega?: string | null
          cidade_entrega?: string | null
          cliente_id?: string | null
          complemento_entrega?: string | null
          created_at?: string
          endereco_entrega?: string | null
          entregador_id?: string | null
          forma_pagamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          numero_entrega?: string | null
          observacoes?: string | null
          status?: string | null
          troco_para?: number | null
          unidade_id?: string | null
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          bairro_entrega?: string | null
          canal_venda?: string | null
          cep_entrega?: string | null
          cidade_entrega?: string | null
          cliente_id?: string | null
          complemento_entrega?: string | null
          created_at?: string
          endereco_entrega?: string | null
          entregador_id?: string | null
          forma_pagamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          numero_entrega?: string | null
          observacoes?: string | null
          status?: string | null
          troco_para?: number | null
          unidade_id?: string | null
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      ponto_eletronico: {
        Row: {
          created_at: string
          data: string
          entrada: string | null
          funcionario_id: string
          horas_extras: number | null
          horas_trabalhadas: number | null
          id: string
          observacoes: string | null
          retorno_almoco: string | null
          saida: string | null
          saida_almoco: string | null
          status: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: string
          entrada?: string | null
          funcionario_id: string
          horas_extras?: number | null
          horas_trabalhadas?: number | null
          id?: string
          observacoes?: string | null
          retorno_almoco?: string | null
          saida?: string | null
          saida_almoco?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          entrada?: string | null
          funcionario_id?: string
          horas_extras?: number | null
          horas_trabalhadas?: number | null
          id?: string
          observacoes?: string | null
          retorno_almoco?: string | null
          saida?: string | null
          saida_almoco?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ponto_eletronico_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ponto_eletronico_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      premiacoes: {
        Row: {
          created_at: string
          ganhador_id: string | null
          id: string
          mes_referencia: string | null
          meta_descricao: string | null
          nome: string
          premio: string | null
          status: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ganhador_id?: string | null
          id?: string
          mes_referencia?: string | null
          meta_descricao?: string | null
          nome: string
          premio?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ganhador_id?: string | null
          id?: string
          mes_referencia?: string | null
          meta_descricao?: string | null
          nome?: string
          premio?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "premiacoes_ganhador_id_fkey"
            columns: ["ganhador_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          botijao_par_id: string | null
          categoria: string | null
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          estoque: number | null
          id: string
          image_url: string | null
          nome: string
          preco: number
          tipo_botijao: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          botijao_par_id?: string | null
          categoria?: string | null
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number | null
          id?: string
          image_url?: string | null
          nome: string
          preco: number
          tipo_botijao?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          botijao_par_id?: string | null
          categoria?: string | null
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number | null
          id?: string
          image_url?: string | null
          nome?: string
          preco?: number
          tipo_botijao?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_botijao_par_id_fkey"
            columns: ["botijao_par_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "promocoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_historico: {
        Row: {
          id: string
          latitude: number
          longitude: number
          rota_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          rota_id: string
          timestamp?: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          rota_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_historico_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          entregador_id: string
          id: string
          km_final: number | null
          km_inicial: number
          status: string | null
          veiculo_id: string | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          entregador_id: string
          id?: string
          km_final?: number | null
          km_inicial: number
          status?: string | null
          veiculo_id?: string | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          entregador_id?: string
          id?: string
          km_final?: number | null
          km_inicial?: number
          status?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rotas_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas_definidas: {
        Row: {
          ativo: boolean | null
          bairros: string[]
          created_at: string
          distancia_km: number | null
          id: string
          nome: string
          tempo_estimado: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          bairros?: string[]
          created_at?: string
          distancia_km?: number | null
          id?: string
          nome: string
          tempo_estimado?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          bairros?: string[]
          created_at?: string
          distancia_km?: number | null
          id?: string
          nome?: string
          tempo_estimado?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotas_definidas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      terminais_cartao: {
        Row: {
          created_at: string
          entregador_id: string | null
          id: string
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          operadora: string
          status: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entregador_id?: string | null
          id?: string
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          operadora?: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entregador_id?: string | null
          id?: string
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          operadora?: string
          status?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terminais_cartao_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminais_cartao_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      transferencia_estoque_itens: {
        Row: {
          created_at: string
          id: string
          preco_compra: number
          produto_id: string
          quantidade: number
          transferencia_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preco_compra?: number
          produto_id: string
          quantidade?: number
          transferencia_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preco_compra?: number
          produto_id?: string
          quantidade?: number
          transferencia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transferencia_estoque_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencia_estoque_itens_transferencia_id_fkey"
            columns: ["transferencia_id"]
            isOneToOne: false
            referencedRelation: "transferencias_estoque"
            referencedColumns: ["id"]
          },
        ]
      }
      transferencias_estoque: {
        Row: {
          compra_gerada_id: string | null
          created_at: string
          data_envio: string | null
          data_recebimento: string | null
          entregador_id: string | null
          id: string
          observacoes: string | null
          solicitante_id: string
          status: string
          unidade_destino_id: string
          unidade_origem_id: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          compra_gerada_id?: string | null
          created_at?: string
          data_envio?: string | null
          data_recebimento?: string | null
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          solicitante_id: string
          status?: string
          unidade_destino_id: string
          unidade_origem_id: string
          updated_at?: string
          valor_total?: number
        }
        Update: {
          compra_gerada_id?: string | null
          created_at?: string
          data_envio?: string | null
          data_recebimento?: string | null
          entregador_id?: string | null
          id?: string
          observacoes?: string | null
          solicitante_id?: string
          status?: string
          unidade_destino_id?: string
          unidade_origem_id?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "transferencias_estoque_compra_gerada_id_fkey"
            columns: ["compra_gerada_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_estoque_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_estoque_unidade_destino_id_fkey"
            columns: ["unidade_destino_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_estoque_unidade_origem_id_fkey"
            columns: ["unidade_origem_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          chave_pix: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_unidades: {
        Row: {
          created_at: string
          id: string
          unidade_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          unidade_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          unidade_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unidades_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_gas: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          codigo: string
          consumidor_cpf: string | null
          consumidor_endereco: string | null
          consumidor_nome: string | null
          consumidor_telefone: string | null
          created_at: string
          data_utilizacao: string | null
          descricao: string | null
          entregador_id: string | null
          entregador_nome: string | null
          id: string
          lote_id: string
          numero: number
          parceiro_id: string
          produto_id: string | null
          produto_nome: string | null
          status: string
          unidade_id: string | null
          updated_at: string
          valor: number
          valor_venda: number | null
          venda_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo: string
          consumidor_cpf?: string | null
          consumidor_endereco?: string | null
          consumidor_nome?: string | null
          consumidor_telefone?: string | null
          created_at?: string
          data_utilizacao?: string | null
          descricao?: string | null
          entregador_id?: string | null
          entregador_nome?: string | null
          id?: string
          lote_id: string
          numero: number
          parceiro_id: string
          produto_id?: string | null
          produto_nome?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor: number
          valor_venda?: number | null
          venda_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo?: string
          consumidor_cpf?: string | null
          consumidor_endereco?: string | null
          consumidor_nome?: string | null
          consumidor_telefone?: string | null
          created_at?: string
          data_utilizacao?: string | null
          descricao?: string | null
          entregador_id?: string | null
          entregador_nome?: string | null
          id?: string
          lote_id?: string
          numero?: number
          parceiro_id?: string
          produto_id?: string | null
          produto_nome?: string | null
          status?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
          valor_venda?: number | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vale_gas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "vale_gas_lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "vale_gas_parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_gas_acerto_vales: {
        Row: {
          acerto_id: string
          created_at: string
          id: string
          vale_id: string
        }
        Insert: {
          acerto_id: string
          created_at?: string
          id?: string
          vale_id: string
        }
        Update: {
          acerto_id?: string
          created_at?: string
          id?: string
          vale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vale_gas_acerto_vales_acerto_id_fkey"
            columns: ["acerto_id"]
            isOneToOne: false
            referencedRelation: "vale_gas_acertos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_acerto_vales_vale_id_fkey"
            columns: ["vale_id"]
            isOneToOne: false
            referencedRelation: "vale_gas"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_gas_acertos: {
        Row: {
          created_at: string
          data_acerto: string
          data_pagamento: string | null
          forma_pagamento: string | null
          id: string
          observacao: string | null
          parceiro_id: string
          parceiro_nome: string
          quantidade: number
          status_pagamento: string
          unidade_id: string | null
          updated_at: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          data_acerto?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          observacao?: string | null
          parceiro_id: string
          parceiro_nome: string
          quantidade: number
          status_pagamento?: string
          unidade_id?: string | null
          updated_at?: string
          valor_total: number
        }
        Update: {
          created_at?: string
          data_acerto?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          observacao?: string | null
          parceiro_id?: string
          parceiro_nome?: string
          quantidade?: number
          status_pagamento?: string
          unidade_id?: string | null
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vale_gas_acertos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "vale_gas_parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_acertos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_gas_lotes: {
        Row: {
          cancelado: boolean
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          data_vencimento_pagamento: string | null
          descricao: string | null
          gerar_conta_receber: boolean | null
          id: string
          numero_final: number
          numero_inicial: number
          observacao: string | null
          parceiro_id: string
          produto_id: string | null
          produto_nome: string | null
          quantidade: number
          status_pagamento: string
          unidade_id: string | null
          updated_at: string
          valor_pago: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cancelado?: boolean
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          data_vencimento_pagamento?: string | null
          descricao?: string | null
          gerar_conta_receber?: boolean | null
          id?: string
          numero_final: number
          numero_inicial: number
          observacao?: string | null
          parceiro_id: string
          produto_id?: string | null
          produto_nome?: string | null
          quantidade: number
          status_pagamento?: string
          unidade_id?: string | null
          updated_at?: string
          valor_pago?: number
          valor_total: number
          valor_unitario: number
        }
        Update: {
          cancelado?: boolean
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          data_vencimento_pagamento?: string | null
          descricao?: string | null
          gerar_conta_receber?: boolean | null
          id?: string
          numero_final?: number
          numero_inicial?: number
          observacao?: string | null
          parceiro_id?: string
          produto_id?: string | null
          produto_nome?: string | null
          quantidade?: number
          status_pagamento?: string
          unidade_id?: string | null
          updated_at?: string
          valor_pago?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "vale_gas_lotes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_lotes_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "vale_gas_parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_lotes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_gas_lotes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_gas_parceiros: {
        Row: {
          ativo: boolean
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string
          unidade_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vale_gas_parceiros_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      vales_funcionario: {
        Row: {
          created_at: string
          data: string
          desconto_referencia: string | null
          funcionario_id: string
          id: string
          observacoes: string | null
          status: string
          tipo: string
          unidade_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          desconto_referencia?: string | null
          funcionario_id: string
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string
          desconto_referencia?: string | null
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          unidade_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vales_funcionario_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vales_funcionario_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          ativo: boolean | null
          created_at: string
          crlv_vencimento: string | null
          entregador_id: string | null
          id: string
          km_atual: number | null
          marca: string | null
          modelo: string
          placa: string
          seguro_empresa: string | null
          seguro_vencimento: string | null
          tipo: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          ativo?: boolean | null
          created_at?: string
          crlv_vencimento?: string | null
          entregador_id?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo: string
          placa: string
          seguro_empresa?: string | null
          seguro_vencimento?: string | null
          tipo?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          ativo?: boolean | null
          created_at?: string
          crlv_vencimento?: string | null
          entregador_id?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          modelo?: string
          placa?: string
          seguro_empresa?: string | null
          seguro_vencimento?: string | null
          tipo?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_entregador_id_fkey"
            columns: ["entregador_id"]
            isOneToOne: false
            referencedRelation: "entregadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_readonly_query: { Args: { query_text: string }; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_unidade_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_unidade: {
        Args: { _unidade_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "gestor"
        | "financeiro"
        | "operacional"
        | "entregador"
        | "cliente"
        | "parceiro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "gestor",
        "financeiro",
        "operacional",
        "entregador",
        "cliente",
        "parceiro",
      ],
    },
  },
} as const
