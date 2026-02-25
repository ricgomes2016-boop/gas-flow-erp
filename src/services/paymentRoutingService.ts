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
export async function criarMovimentacaoBancaria(params: {
  contaBancariaId: string;
  valor: number;
  descricao: string;
  categoria: string;
  unidadeId?: string | null;
  userId?: string;
  pedidoId?: string;
}) {
  const { data: conta } = await supabase
    .from("contas_bancarias")
    .select("saldo_atual")
    .eq("id", params.contaBancariaId)
    .single();

  if (!conta) return;

  const novoSaldo = Number(conta.saldo_atual) + params.valor;

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
 * Roteia automaticamente os pagamentos de uma venda:
 * 
 * - Dinheiro → movimentacoes_caixa APENAS (caixa físico). Depósito bancário é manual.
 * - PIX → movimentacoes_bancarias DIRETO (nunca entra no caixa físico)
 * - Cartão Débito → contas_receber (D+1). Entra no banco quando liquidado.
 * - Cartão Crédito → contas_receber (D+30). Entra no banco quando liquidado.
 * - Cheque → movimentacoes_caixa + tabela cheques. Entra no banco quando depositado.
 * - Fiado → contas_receber apenas
 * - Boleto → contas_receber apenas. Entra no banco quando baixado.
 * - Vale Gás → movimentacoes_caixa (depende da forma como será pago)
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
        // Dinheiro entra APENAS no caixa físico da loja
        // Depósito bancário é feito manualmente na tela "Caixa da Loja"
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Dinheiro`,
          valor: pag.valor,
          categoria: "Venda Dinheiro",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        break;
      }

      case "pix": {
        // PIX vai DIRETO para conta bancária — nunca entra no caixa físico
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
        // Cartão Débito → só contas a receber (D+1)
        // Entra no banco automaticamente quando liquidado
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
        break;
      }

      case "cartao_credito":
      case "credito": {
        // Cartão Crédito → só contas a receber (D+30)
        // Entra no banco automaticamente quando liquidado
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

      case "pix_maquininha": {
        // PIX Maquininha → contas a receber (prazo configurável por operadora, D+0 ou D+1)
        // Busca prazo da operadora configurada na unidade
        promises.push(
          (async () => {
            let prazoPix = 0; // default D+0
            if (unidadeId) {
              const { data: opData } = await supabase
                .from("operadoras_cartao")
                .select("prazo_pix, taxa_pix")
                .or(`unidade_id.eq.${unidadeId},unidade_id.is.null`)
                .eq("ativo", true)
                .limit(1)
                .maybeSingle();
              if (opData) {
                prazoPix = opData.prazo_pix || 0;
              }
            }
            await insertContasReceber({
              cliente: clienteNome || "Operadora PIX Maquininha",
              descricao: `PIX Maquininha - Venda #${pedidoRef}`,
              valor: pag.valor,
              vencimento: format(addDays(new Date(), prazoPix), "yyyy-MM-dd"),
              status: "pendente",
              forma_pagamento: "pix_maquininha",
              pedido_id: pedidoId,
              unidade_id: unidadeId || null,
            });
          })()
        );
        break;
      }

      case "cheque": {
        // Cheque entra no caixa como registro + tabela cheques
        // Entra no banco quando for depositado manualmente
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Cheque #${pag.cheque_numero || "s/n"}`,
          valor: pag.valor,
          categoria: "Cheque",
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
        // Fiado → apenas contas a receber (sem caixa, sem banco)
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
        // Boleto → apenas contas a receber. Entra no banco quando baixado.
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
        // Vale Gás entra no caixa físico (depende da forma como será pago)
        promises.push(insertCaixa({
          tipo: "entrada",
          descricao: `Venda #${pedidoRef} - Vale Gás`,
          valor: pag.valor,
          categoria: "Vale Gás",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
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
