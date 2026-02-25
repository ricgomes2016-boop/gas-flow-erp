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
 * Roteia automaticamente os pagamentos de uma venda para os destinos financeiros corretos:
 * - Dinheiro / PIX → movimentacoes_caixa (entrada)
 * - Cartão Débito → movimentacoes_caixa (entrada) + contas_receber (D+1)
 * - Cartão Crédito → movimentacoes_caixa (entrada) + contas_receber (D+30)
 * - Cheque → movimentacoes_caixa (entrada) + tabela cheques
 * - Fiado → contas_receber (sem entrada no caixa)
 * - Boleto → contas_receber (sem entrada no caixa)
 * - Vale Gás → movimentacoes_caixa (entrada)
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
        break;
      }
    }
  }

  const results = await Promise.allSettled(promises);
  const failures = results.filter(r => r.status === "rejected");
  if (failures.length > 0) {
    console.error("Erros ao rotear pagamentos:", failures);
  }
}
