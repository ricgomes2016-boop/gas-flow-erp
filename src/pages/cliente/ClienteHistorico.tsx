import { useEffect, useState } from "react";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCliente } from "@/contexts/ClienteContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  History, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck,
  ShoppingBag,
  RotateCcw,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface PedidoDB {
  id: string;
  created_at: string;
  valor_total: number | null;
  status: string | null;
  forma_pagamento: string | null;
  endereco_entrega: string | null;
  pedido_itens: {
    id: string;
    quantidade: number;
    preco_unitario: number;
    produto_id: string | null;
    produtos: {
      nome: string;
      image_url: string | null;
    } | null;
  }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  em_rota: { label: "Em Rota", color: "bg-blue-100 text-blue-700", icon: Truck },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: Package },
};

export default function ClienteHistorico() {
  const { cartItemsCount, addToCart } = useCliente();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Find cliente by email
        const { data: clienteData } = await supabase
          .from("clientes")
          .select("id")
          .eq("email", user.email || "")
          .maybeSingle();

        let query = supabase
          .from("pedidos")
          .select(`
            id, created_at, valor_total, status, forma_pagamento, endereco_entrega,
            pedido_itens (
              id, quantidade, preco_unitario, produto_id,
              produtos:produto_id (nome, image_url)
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50);

        // Filter by canal_venda=app_cliente if no cliente match, or by cliente_id
        if (clienteData) {
          query = query.eq("cliente_id", clienteData.id);
        } else {
          query = query.eq("canal_venda", "app_cliente");
        }

        const { data, error } = await query;

        if (!error && data) {
          setPedidos(data as unknown as PedidoDB[]);
        }
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPedidos();
  }, [user]);

  const handleRepetirPedido = (pedido: PedidoDB) => {
    pedido.pedido_itens.forEach(item => {
      if (item.produtos) {
        addToCart({
          id: item.produto_id || item.id,
          name: item.produtos.nome,
          description: "",
          price: item.preco_unitario,
          image: item.produtos.image_url || "📦",
          category: "",
        }, item.quantidade);
      }
    });
  };

  return (
    <ClienteLayout cartItemsCount={cartItemsCount}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Minhas Compras</h1>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{pedidos.length}</p>
              <p className="text-sm text-muted-foreground">Total de pedidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">
                {pedidos.filter(p => p.status === "entregue").length}
              </p>
              <p className="text-sm text-muted-foreground">Entregas realizadas</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-1">Nenhuma compra ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Faça seu primeiro pedido agora!
              </p>
              <Button asChild>
                <Link to="/cliente">Ver Produtos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pedidos.map(pedido => {
              const status = statusConfig[pedido.status || "pendente"] || statusConfig.pendente;
              const StatusIcon = status.icon;
              
              return (
                <Card key={pedido.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pedido #{pedido.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm font-medium">
                          {format(new Date(pedido.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2 mb-3">
                      {pedido.pedido_itens.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-sm">
                            {item.produtos?.image_url ? (
                              <img src={item.produtos.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.produtos?.nome || "Produto"}</p>
                            <p className="text-sm text-muted-foreground">Qtd: {item.quantidade}</p>
                          </div>
                          <p className="font-medium">
                            R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Pago via {pedido.forma_pagamento || "—"}
                      </p>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {(pedido.valor_total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2" 
                        size="sm"
                        onClick={() => handleRepetirPedido(pedido)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Repetir Pedido
                      </Button>
                      {pedido.status !== "entregue" && pedido.status !== "cancelado" && (
                        <Button asChild variant="default" size="sm" className="gap-1">
                          <Link to={`/cliente/rastreamento/${pedido.id}`}>
                            <MapPin className="h-4 w-4" />
                            Rastrear
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
