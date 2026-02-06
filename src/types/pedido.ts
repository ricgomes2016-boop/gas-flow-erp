export type PedidoStatus = "pendente" | "em_rota" | "entregue" | "cancelado";

export interface PedidoItem {
  id: string;
  produto_id: string | null;
  quantidade: number;
  preco_unitario: number;
  produto?: {
    id: string;
    nome: string;
  };
}

export interface PedidoFormatado {
  id: string;
  cliente: string;
  cliente_id: string | null;
  endereco: string;
  produtos: string;
  itens: PedidoItem[];
  valor: number;
  status: PedidoStatus;
  data: string;
  entregador?: string;
  entregador_id?: string | null;
  observacoes?: string;
}
