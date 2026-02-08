import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { PedidoFormatado, PedidoStatus } from "@/types/pedido";
import { useUnidade } from "@/contexts/UnidadeContext";

export function usePedidos() {
  const queryClient = useQueryClient();
  const { unidadeAtual } = useUnidade();

  const { data: pedidos = [], isLoading, error } = useQuery({
    queryKey: ["pedidos", unidadeAtual?.id],
    queryFn: async () => {
      // Buscar pedidos com cliente e entregador
      let query = supabase
        .from("pedidos")
        .select(`
          *,
          clientes (id, nome, endereco, bairro, cidade),
          entregadores (id, nome)
        `)
        .order("created_at", { ascending: false });

      // Filtrar por unidade se houver unidade selecionada
      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data: pedidosData, error: pedidosError } = await query;

      if (pedidosError) throw pedidosError;

      // Buscar itens de cada pedido com produtos
      const pedidosFormatados: PedidoFormatado[] = await Promise.all(
        (pedidosData || []).map(async (pedido) => {
          const { data: itensData } = await supabase
            .from("pedido_itens")
            .select(`
              *,
              produtos (id, nome)
            `)
            .eq("pedido_id", pedido.id);

          const itens = itensData || [];
          
          // Formatar string de produtos
          const produtosStr = itens
            .map((item) => {
              const nomeProduto = item.produtos?.nome || "Produto";
              return `${item.quantidade}x ${nomeProduto}`;
            })
            .join(", ") || "Sem itens";

          // Formatar endereço
          const cliente = pedido.clientes;
          const endereco = pedido.endereco_entrega || 
            (cliente ? [cliente.endereco, cliente.bairro, cliente.cidade].filter(Boolean).join(", ") : "Endereço não informado");

          return {
            id: pedido.id,
            cliente: cliente?.nome || "Cliente não identificado",
            cliente_id: pedido.cliente_id,
            endereco,
            produtos: produtosStr,
            itens: itens.map((item) => ({
              id: item.id,
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: Number(item.preco_unitario),
              produto: item.produtos ? { id: item.produtos.id, nome: item.produtos.nome } : undefined,
            })),
            valor: Number(pedido.valor_total) || 0,
            status: (pedido.status as PedidoStatus) || "pendente",
            data: format(new Date(pedido.created_at), "dd/MM/yyyy HH:mm"),
            entregador: pedido.entregadores?.nome,
            entregador_id: pedido.entregador_id,
            observacoes: pedido.observacoes || undefined,
          };
        })
      );

      return pedidosFormatados;
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ pedidoId, novoStatus }: { pedidoId: string; novoStatus: PedidoStatus }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: novoStatus })
        .eq("id", pedidoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });

  const atribuirEntregadorMutation = useMutation({
    mutationFn: async ({ pedidoId, entregadorId }: { pedidoId: string; entregadorId: string }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({ entregador_id: entregadorId })
        .eq("id", pedidoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });

  return {
    pedidos,
    isLoading,
    error,
    atualizarStatus: atualizarStatusMutation.mutate,
    atribuirEntregador: atribuirEntregadorMutation.mutate,
    isUpdating: atualizarStatusMutation.isPending || atribuirEntregadorMutation.isPending,
  };
}
