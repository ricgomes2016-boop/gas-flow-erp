import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pedido {
  id: string;
  created_at: string;
  valor_total: number | null;
  forma_pagamento: string | null;
  status: string | null;
}

interface CustomerHistoryProps {
  clienteId: string | null;
}

export function CustomerHistory({ clienteId }: CustomerHistoryProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clienteId) {
      setPedidos([]);
      return;
    }

    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .select("id, created_at, valor_total, forma_pagamento, status")
          .eq("cliente_id", clienteId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setPedidos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [clienteId]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "entregue":
        return <Badge variant="default">Entregue</Badge>;
      case "em_rota":
        return <Badge variant="secondary">Em Rota</Badge>;
      case "pendente":
        return <Badge variant="outline">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status || "—"}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-5 w-5" />
          Histórico do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!clienteId ? (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecione um cliente para ver o histórico</p>
          </div>
        ) : loading ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Carregando...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Data</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="text-sm">
                      {format(new Date(pedido.created_at), "dd/MM/yy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{pedido.id.slice(0, 6)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {(pedido.valor_total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {pedido.forma_pagamento || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
