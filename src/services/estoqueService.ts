import { supabase } from "@/integrations/supabase/client";

interface ItemEstoque {
  produto_id: string;
  quantidade: number;
}

/**
 * Atualiza o estoque de produtos após uma venda.
 * Decrementa o estoque do produto cheio e incrementa o vazio (se for gás).
 * Também registra a movimentação na tabela movimentacoes_estoque para rastreabilidade.
 */
export async function atualizarEstoqueVenda(itens: ItemEstoque[], unidadeId?: string | null) {
  for (const item of itens) {
    const { data: produto, error: fetchError } = await supabase
      .from("produtos")
      .select("id, estoque, categoria, tipo_botijao, botijao_par_id, unidade_id")
      .eq("id", item.produto_id)
      .single();

    if (fetchError) {
      console.error(`Erro ao buscar produto ${item.produto_id}:`, fetchError);
      continue;
    }

    if (produto) {
      const novoEstoque = Math.max(0, (produto.estoque || 0) - item.quantidade);
      const { error: updateError } = await supabase
        .from("produtos")
        .update({ estoque: novoEstoque })
        .eq("id", item.produto_id);

      if (updateError) {
        console.error(`Erro ao atualizar estoque do produto ${item.produto_id}:`, updateError);
        continue;
      }

      // Registrar movimentação para rastreabilidade
      const { error: movError } = await supabase
        .from("movimentacoes_estoque")
        .insert({
          produto_id: item.produto_id,
          tipo: "saida",
          quantidade: item.quantidade,
          observacoes: "Baixa automática por venda",
          unidade_id: unidadeId || produto.unidade_id || null,
        });

      if (movError) {
        console.error(`Erro ao registrar movimentação do produto ${item.produto_id}:`, movError);
      }

      if (produto.categoria === "gas" && produto.tipo_botijao === "cheio" && produto.botijao_par_id) {
        const { data: produtoVazio } = await supabase
          .from("produtos")
          .select("id, estoque")
          .eq("id", produto.botijao_par_id)
          .single();

        if (produtoVazio) {
          const { error: vazioError } = await supabase
            .from("produtos")
            .update({ estoque: (produtoVazio.estoque || 0) + item.quantidade })
            .eq("id", produtoVazio.id);

          if (vazioError) {
            console.error(`Erro ao atualizar estoque vazio ${produtoVazio.id}:`, vazioError);
          }
        }
      }

      // Também tratar água mineral (cheio -> vazio)
      if (produto.categoria === "agua" && produto.tipo_botijao === "cheio" && produto.botijao_par_id) {
        const { data: galaoVazio } = await supabase
          .from("produtos")
          .select("id, estoque")
          .eq("id", produto.botijao_par_id)
          .single();

        if (galaoVazio) {
          const { error: galaoError } = await supabase
            .from("produtos")
            .update({ estoque: (galaoVazio.estoque || 0) + item.quantidade })
            .eq("id", galaoVazio.id);

          if (galaoError) {
            console.error(`Erro ao atualizar galão vazio ${galaoVazio.id}:`, galaoError);
          }
        }
      }
    }
  }
}

/**
 * Atualiza o estoque de produtos após uma compra.
 * Incrementa o estoque do produto (cheio) e decrementa o vazio (troca de vasilhame).
 */
export async function atualizarEstoqueCompra(itens: ItemEstoque[], unidadeId?: string | null) {
  for (const item of itens) {
    const { data: produto, error: fetchError } = await supabase
      .from("produtos")
      .select("id, estoque, categoria, tipo_botijao, botijao_par_id, unidade_id")
      .eq("id", item.produto_id)
      .single();

    if (fetchError) {
      console.error(`Erro ao buscar produto ${item.produto_id}:`, fetchError);
      continue;
    }

    if (!produto) continue;

    // Incrementar estoque do produto comprado
    const novoEstoque = (produto.estoque || 0) + item.quantidade;
    const { error: updateError } = await supabase
      .from("produtos")
      .update({ estoque: novoEstoque })
      .eq("id", item.produto_id);

    if (updateError) {
      console.error(`Erro ao atualizar estoque do produto ${item.produto_id}:`, updateError);
      continue;
    }

    // Para gás/água cheio: decrementar vazios (troca de vasilhame)
    if ((produto.categoria === "gas" || produto.categoria === "agua") && produto.tipo_botijao === "cheio" && produto.botijao_par_id) {
      const { data: produtoVazio } = await supabase
        .from("produtos")
        .select("id, estoque")
        .eq("id", produto.botijao_par_id)
        .single();

      if (produtoVazio) {
        const novoEstoqueVazio = Math.max(0, (produtoVazio.estoque || 0) - item.quantidade);
        await supabase
          .from("produtos")
          .update({ estoque: novoEstoqueVazio })
          .eq("id", produtoVazio.id);
      }
    }
  }
}
