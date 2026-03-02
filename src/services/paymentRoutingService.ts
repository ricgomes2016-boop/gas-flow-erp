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
 * Busca a conta bancária principal da unidade (primeira conta ativa)
 */
async function getContaPrincipal(unidadeId?: string | null): Promise<string | null> {
  if (!unidadeId) return null;
  const { data } = await supabase
    .from("contas_bancarias")
    .select("id")
    .eq("unidade_id", unidadeId)
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

/**
 * Busca operadora ativa da unidade e calcula taxa/prazo
 */
async function getOperadoraConfig(unidadeId: string | null, tipo: string) {
  if (!unidadeId) return null;
  const { data } = await supabase
    .from("operadoras_cartao")
    .select("id, nome, taxa_debito, taxa_credito_vista, taxa_credito_parcelado, prazo_debito, prazo_credito, taxa_pix, prazo_pix")
    .or(`unidade_id.eq.${unidadeId},unidade_id.is.null`)
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  if (!data) return null;

  let taxa = 0;
  let prazo = 0;
  if (tipo === "pix_maquininha") {
    taxa = Number((data as any).taxa_pix) || 0;
    prazo = Number((data as any).prazo_pix) || 0;
  } else if (tipo === "cartao_debito" || tipo === "debito") {
    taxa = Number(data.taxa_debito) || 0;
    prazo = Number(data.prazo_debito) || 1;
  } else {
    taxa = Number(data.taxa_credito_vista) || 0;
    prazo = Number(data.prazo_credito) || 30;
  }

  return { id: data.id, nome: data.nome, taxa, prazo };
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
 * Roteia automaticamente os pagamentos de uma venda.
 * 
 * Fluxo: Venda → Geração de título → Recebimento → Baixa → Conciliação
 * 
 * - Dinheiro → movimentacoes_caixa (caixa físico)
 * - PIX → movimentacoes_bancarias DIRETO (conta principal)
 * - Cartão Débito → contas_receber (operadora, taxa, D+1)
 * - Cartão Crédito → contas_receber (operadora, taxa, D+30)
 * - PIX Maquininha → contas_receber (operadora, taxa, D+0/D+1)
 * - Cheque → movimentacoes_caixa + tabela cheques
 * - Fiado → contas_receber vinculada ao cliente
 * - Boleto → contas_receber
 * - Vale Gás → contas_receber (título vinculado ao parceiro)
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
          categoria: "Venda Dinheiro",
          status: "aprovada",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          entregador_id: entregadorId || null,
        }));
        break;
      }

      case "pix": {
        promises.push(
          getContaPrincipal(unidadeId).then(contaId => {
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
      case "debito":
      case "cartao_credito":
      case "credito":
      case "pix_maquininha": {
        // Cartões e PIX Maquininha → contas_receber com operadora + taxa + prazo
        promises.push(
          (async () => {
            const op = await getOperadoraConfig(unidadeId || null, pag.forma);
            const taxa = op ? op.taxa : 0;
            const prazo = op ? op.prazo : (pag.forma.includes("debito") ? 1 : 30);
            const valorTaxa = pag.valor * (taxa / 100);
            const valorLiquido = pag.valor - valorTaxa;

            const tipoLabel = pag.forma.includes("debito") || pag.forma === "debito"
              ? "Débito" : pag.forma === "pix_maquininha" ? "PIX Maq." : "Crédito";

            await insertContasReceber({
              cliente: op?.nome || clienteNome || "Operadora Cartão",
              descricao: `${tipoLabel} - Venda #${pedidoRef}`,
              valor: pag.valor,
              vencimento: format(addDays(new Date(), prazo), "yyyy-MM-dd"),
              status: "pendente",
              forma_pagamento: pag.forma === "debito" ? "cartao_debito" : pag.forma === "credito" ? "cartao_credito" : pag.forma,
              pedido_id: pedidoId,
              unidade_id: unidadeId || null,
              operadora_id: op?.id || null,
              taxa_percentual: taxa,
              valor_taxa: valorTaxa,
              valor_liquido: valorLiquido,
              cliente_id: clienteId || null,
            });
          })()
        );
        break;
      }

      case "cheque": {
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
          cliente_id: clienteId || null,
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
          cliente_id: clienteId || null,
        }));
        break;
      }

      case "vale_gas": {
        // Vale Gás NÃO entra no caixa físico — é um voucher do parceiro.
        // Gera título em Contas a Receber vinculado ao parceiro.
        promises.push(insertContasReceber({
          cliente: "Parceiro Vale Gás",
          descricao: `Vale Gás - Venda #${pedidoRef}`,
          valor: pag.valor,
          vencimento: hoje,
          status: "pendente",
          forma_pagamento: "vale_gas",
          pedido_id: pedidoId,
          unidade_id: unidadeId || null,
          cliente_id: clienteId || null,
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

  // Notificação consolidada
  await supabase.from("notificacoes").insert({
    titulo: "💰 Nova venda registrada",
    mensagem: `Venda #${pedidoId.slice(0, 8)} — R$ ${totalVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${formasUsadas}). Títulos financeiros gerados automaticamente.`,
    tipo: "info",
    user_id: userId || "",
  }).then(r => { if (r.error) console.error("Erro notificação:", r.error); });
}
