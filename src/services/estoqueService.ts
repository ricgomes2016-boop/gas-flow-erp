import { supabase } from "@/integrations/supabase/client";

interface ItemEstoque {
  produto_id: string;
  quantidade: number;
}

/**
 * Atualiza o estoque de produtos após uma venda.
 * Decrementa o estoque do produto cheio e incrementa o vazio (se for gás).
 */
export async function atualizarEstoqueVenda(itens: ItemEstoque[]) {
  for (const item of itens) {
    const { data: produto } = await supabase
      .from("produtos")
      .select("id, estoque, categoria, tipo_botijao, botijao_par_id")
      .eq("id", item.produto_id)
      .single();

    if (produto) {
      const novoEstoque = Math.max(0, (produto.estoque || 0) - item.quantidade);
      await supabase.from("produtos").update({ estoque: novoEstoque }).eq("id", item.produto_id);

      if (produto.categoria === "gas" && produto.tipo_botijao === "cheio" && produto.botijao_par_id) {
        const { data: produtoVazio } = await supabase
          .from("produtos")
          .select("id, estoque")
          .eq("id", produto.botijao_par_id)
          .single();

        if (produtoVazio) {
          await supabase
            .from("produtos")
            .update({ estoque: (produtoVazio.estoque || 0) + item.quantidade })
            .eq("id", produtoVazio.id);
        }
      }
    }
  }
}
