import { supabase } from "@/integrations/supabase/client";
import { getBrasiliaDateString } from "@/lib/utils";
import { addDays, format } from "date-fns";

export interface PagamentoRoteamento {
  forma: string;
  valor: number;
  cheque_numero?: string;
  cheque_banco?: string;
  cheque_foto_url?: string;
  data_vencimento_fiado?: string;
}

interface RotearPagamentosParams {
  pedidoId: string;
  clienteId?: string | null;
  clienteNome?: string;
  pagamentos: PagamentoRoteamento[];
  unidadeId?: string | null;
  entregadorId?: string | null;
  userId?: string;
}

/**
 * Busca a conta bancária configurada para uma forma de pagamento na unidade
 */
async function getContaDestino(formaPagamento: string, unidadeId?: string | null): Promise<string | null> {
  if (!unidadeId) return null;
  const { data } = await supabase
    .from("config_destino_pagamento")
    .select("conta_bancaria_id")
    .eq("forma_pagamento", formaPagamento)
    .eq("unidade_id", unidadeId)
    .eq("ativo", true)
    .maybeSingle();
  return data?.conta_bancaria_id || null;
}

/**
 * Cria movimentação bancária e atualiza saldo da conta
 */
async function criarMovimentacaoBancaria(params: {
  contaBancariaId: string;
  valor: number;
  descricao: string;
  categoria: string;
  unidadeId?: string | null;
  userId?: string;
  pedidoId?: string;
}) {
  // Buscar saldo atual
  const { data: conta } = await supabase
    .from("contas_bancarias")
    .select("saldo_atual")
    .eq("id", params.contaBancariaId)
    .single();

  if (!conta) return;

  const novoSaldo = Number(conta.saldo_atual) + params.valor;

  // Inserir movimentação
  await supabase.from("movimentacoes_bancarias").insert({
    conta_bancaria_id: params.contaBancariaId,
    data: getBrasiliaDateString(),
    tipo: params.valor >= 0 ? "entrada" : "saida",
    categoria: params.categoria,
    descricao: params.descricao,
    valor: params.valor,
    saldo_apos: novoSaldo,
    referencia_id: params.pedidoId || null,
    referencia_tipo: params.pedidoId ? "pedido" : null,
    user_id: params.userId || null,
    unidade_id: params.unidadeId || null,
  });

  // Atualizar saldo
  await supabase
    .from("contas_bancarias")
    .update({ saldo_atual: novoSaldo })
    .eq("id", params.contaBancariaId);
}

/**
 * Cria notificação sobre movimentação financeira
 */
async function criarNotificacaoFinanceira(params: {
  titulo: string;
  mensagem: string;
  unidadeId?: string | null;
  userId?: string;
}) {
  if (!params.userId) return;
  await supabase.from("notificacoes").insert({
    titulo: params.titulo,
    mensagem: params.mensagem,
    tipo: "info",
    user_id: params.userId,
  }).then(r => { if (r.error) console.error("Erro notificação:", r.error); });
}

/**
 * Roteia automaticamente os pagamentos de uma venda para os destinos financeiros corretos:
 * - Dinheiro / PIX → movimentacoes_caixa + movimentacoes_bancarias (se conta configurada)
 * - Cartão Débito → movimentacoes_caixa + contas_receber (D+1) + movimentacoes_bancarias futura
 * - Cartão Crédito → movimentacoes_caixa + contas_receber (D+30) + movimentacoes_bancarias futura
 * - Cheque → movimentacoes_caixa + tabela cheques
 * - Fiado → contas_receber (sem entrada no caixa)
 * - Boleto → contas_receber (sem entrada no caixa)
 * - Vale Gás → movimentacoes_caixa + movimentacoes_bancarias (se conta configurada)
 */
export async function rotearPagamentosVenda(params: RotearPagamentosParams): Promise<void> {
  const { pedidoId, clienteId, clienteNome, pagamentos, unidadeId, entregadorId } = params;
  const hoje = getBrasiliaDateString();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = params.userId || user?.id;

  const promises: PromiseLike<any>[] = [];

  const insertCaixa = (data: any) =>
    supabase.from("movimentacoes_caixa").insert(data).select("id").then(r => { if (r.error) throw r.error; });

  const insertContasReceber = (data: any) =>
    supabase.from("contas_receber").insert(data).select("id").then(r => { if (r.error) throw r.error; });

  const insertCheque = (data: any) =>
    supabase.from("cheques").insert(data).select("id").then(r => { if (r.error) throw r.error; });

  const totalVenda = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const formasUsadas = pagamentos.map(p => p.forma).join(", ");

  for (const pag of pagamentos) {
    const pedidoRef = pedidoId.slice(0, 8);

    switch (pag.forma) {
      case "dinheiro": {
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Dinheiro`,
          valor: pag.valor,
          categoria: "venda",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        // Movimentação bancária automática
        promises.push(
          getContaDestino("dinheiro", unidadeId).then(contaId => {
            if (contaId) {
              return criarMovimentacaoBancaria({
                contaBancariaId: contaId,
                valor: pag.valor,
                descricao: `Venda #${pedidoRef} - Dinheiro`,
                categoria: "venda",
                unidadeId,
                userId,
                pedidoId,
              });
            }
          })
        );
        break;
      }

      case "pix": {
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - PIX`,
          valor: pag.valor,
          categoria: "venda",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        promises.push(
          getContaDestino("pix", unidadeId).then(contaId => {
            if (contaId) {
              return criarMovimentacaoBancaria({
                contaBancariaId: contaId,
                valor: pag.valor,
                descricao: `Venda #${pedidoRef} - PIX`,
                categoria: "venda",
                unidadeId,
                userId,
                pedidoId,
              });
            }
          })
        );
        break;
      }

      case "cartao_debito":
      case "debito": {
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Cartão Débito`,
          valor: pag.valor,
          categoria: "venda_cartao",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        promises.push(insertContasReceber({
          cliente: clienteNome || "Operadora Cartão",
          descricao: `Cartão Débito - Venda #${pedidoRef}`,
          valor: pag.valor,
          vencimento: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          status: "pendente",
          forma_pagamento: "cartao_debito",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
        }));
        // Nota: movimentação bancária será criada quando o contas_receber for liquidado
        break;
      }

      case "cartao_credito":
      case "credito": {
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Cartão Crédito`,
          valor: pag.valor,
          categoria: "venda_cartao",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        promises.push(insertContasReceber({
          cliente: clienteNome || "Operadora Cartão",
          descricao: `Cartão Crédito - Venda #${pedidoRef}`,
          valor: pag.valor,
          vencimento: format(addDays(new Date(), 30), "yyyy-MM-dd"),
          status: "pendente",
          forma_pagamento: "cartao_credito",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
        }));
        break;
      }

      case "cheque": {
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Cheque #${pag.cheque_numero || "s/n"}`,
          valor: pag.valor,
          categoria: "venda_cheque",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        if (userId && pag.cheque_numero && pag.cheque_banco) {
          promises.push(insertCheque({
            numero_cheque: pag.cheque_numero,
            banco_emitente: pag.cheque_banco,
            valor: pag.valor,
            data_emissao: hoje,
            data_vencimento: hoje,
            status: "em_maos",
            pedido_id: pedidoId,
            cliente_id: clienteId || null,
            unidade_id: unidadeId || null,
            user_id: userId,
            foto_url: pag.cheque_foto_url || null,
          }));
        }
        break;
      }

      case "fiado": {
        const vencimento = pag.data_vencimento_fiado || format(addDays(new Date(), 30), "yyyy-MM-dd");
        promises.push(insertContasReceber({
          cliente: clienteNome || "Cliente não identificado",
          descricao: `Venda a prazo (Fiado) - Pedido #${pedidoRef}`,
          valor: pag.valor,
          vencimento,
          status: "pendente",
          forma_pagamento: "fiado",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
        }));
        break;
      }

      case "boleto": {
        promises.push(insertContasReceber({
          cliente: clienteNome || "Cliente não identificado",
          descricao: `Boleto - Venda #${pedidoRef}`,
          valor: pag.valor,
          vencimento: format(addDays(new Date(), 30), "yyyy-MM-dd"),
          status: "pendente",
          forma_pagamento: "boleto",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
        }));
        break;
      }

      case "vale_gas": {
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Vale Gás`,
          valor: pag.valor,
          categoria: "venda_vale",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        promises.push(
          getContaDestino("vale_gas", unidadeId).then(contaId => {
            if (contaId) {
              return criarMovimentacaoBancaria({
                contaBancariaId: contaId,
                valor: pag.valor,
                descricao: `Venda #${pedidoRef} - Vale Gás`,
                categoria: "venda",
                unidadeId,
                userId,
                pedidoId,
              });
            }
          })
        );
        break;
      }
    }
  }

  const results = await Promise.allSettled(promises);
  const failures = results.filter(r => r.status === "rejected");
  if (failures.length > 0) {
    console.error("Erros ao rotear pagamentos:", failures);
  }

  // Notificação consolidada da venda
  await criarNotificacaoFinanceira({
    titulo: "💰 Nova venda registrada",
    mensagem: `Venda #${pedidoId.slice(0, 8)} — R$ ${totalVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${formasUsadas}). Movimentações financeiras criadas automaticamente.`,
    unidadeId,
    userId,
  });
}
