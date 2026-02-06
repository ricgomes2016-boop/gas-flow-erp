import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2, MapPin, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearch, ItemVenda } from "@/components/vendas/ProductSearch";
import { DeliveryPersonSelect } from "@/components/vendas/DeliveryPersonSelect";
import { PedidoStatus } from "@/types/pedido";

interface PedidoData {
  id: string;
  cliente_id: string | null;
  cliente_nome: string;
  endereco_entrega: string;
  observacoes: string;
  status: PedidoStatus;
  entregador_id: string | null;
  entregador_nome: string | null;
  valor_total: number;
}

export default function EditarPedido() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [entregador, setEntregador] = useState<{ id: string | null; nome: string | null }>({
    id: null,
    nome: null,
  });

  useEffect(() => {
    if (id) {
      fetchPedido(id);
    }
  }, [id]);

  const fetchPedido = async (pedidoId: string) => {
    try {
      // Buscar pedido com cliente e entregador
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .select(`
          *,
          clientes (id, nome, endereco, bairro, cidade),
          entregadores (id, nome)
        `)
        .eq("id", pedidoId)
        .single();

      if (pedidoError) throw pedidoError;

      // Buscar itens do pedido
      const { data: itensData, error: itensError } = await supabase
        .from("pedido_itens")
        .select(`
          *,
          produtos (id, nome, preco)
        `)
        .eq("pedido_id", pedidoId);

      if (itensError) throw itensError;

      // Montar dados do pedido
      const cliente = pedidoData.clientes;
      const enderecoCompleto = pedidoData.endereco_entrega ||
        (cliente ? [cliente.endereco, cliente.bairro, cliente.cidade].filter(Boolean).join(", ") : "");

      setPedido({
        id: pedidoData.id,
        cliente_id: pedidoData.cliente_id,
        cliente_nome: cliente?.nome || "Cliente não identificado",
        endereco_entrega: enderecoCompleto,
        observacoes: pedidoData.observacoes || "",
        status: (pedidoData.status as PedidoStatus) || "pendente",
        entregador_id: pedidoData.entregador_id,
        entregador_nome: pedidoData.entregadores?.nome || null,
        valor_total: Number(pedidoData.valor_total) || 0,
      });

      setEndereco(enderecoCompleto);
      setObservacoes(pedidoData.observacoes || "");
      setEntregador({
        id: pedidoData.entregador_id,
        nome: pedidoData.entregadores?.nome || null,
      });

      // Montar itens
      const itensFormatados: ItemVenda[] = (itensData || []).map((item) => ({
        id: item.id,
        produto_id: item.produto_id || "",
        nome: item.produtos?.nome || "Produto",
        quantidade: item.quantidade,
        preco_unitario: Number(item.preco_unitario),
        total: item.quantidade * Number(item.preco_unitario),
      }));

      setItens(itensFormatados);
    } catch (error: any) {
      console.error("Erro ao buscar pedido:", error);
      toast({
        title: "Erro ao carregar pedido",
        description: error.message || "Não foi possível carregar os dados do pedido.",
        variant: "destructive",
      });
      navigate("/vendas/pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!pedido || !id) return;

    if (itens.length === 0) {
      toast({
        title: "Erro",
        description: "O pedido deve ter pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const novoTotal = itens.reduce((acc, item) => acc + item.total, 0);

      // Atualizar pedido
      const { error: pedidoError } = await supabase
        .from("pedidos")
        .update({
          endereco_entrega: endereco,
          observacoes,
          entregador_id: entregador.id,
          valor_total: novoTotal,
        })
        .eq("id", id);

      if (pedidoError) throw pedidoError;

      // Deletar itens antigos
      const { error: deleteError } = await supabase
        .from("pedido_itens")
        .delete()
        .eq("pedido_id", id);

      if (deleteError) throw deleteError;

      // Inserir novos itens
      const novosItens = itens.map((item) => ({
        pedido_id: id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));

      const { error: insertError } = await supabase
        .from("pedido_itens")
        .insert(novosItens);

      if (insertError) throw insertError;

      toast({
        title: "Pedido atualizado!",
        description: `Pedido #${id.slice(0, 6)} foi salvo com sucesso.`,
      });

      navigate("/vendas/pedidos");
    } catch (error: any) {
      console.error("Erro ao salvar pedido:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelecionarEntregador = (id: string, nome: string) => {
    setEntregador({ id, nome });
  };

  const totalVenda = itens.reduce((acc, item) => acc + item.total, 0);

  const getStatusBadge = (status: PedidoStatus) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      em_rota: { label: "Em Rota", variant: "default" as const },
      entregue: { label: "Entregue", variant: "default" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const },
    };
    const config = statusConfig[status] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <MainLayout>
        <Header title="Editar Pedido" subtitle="Carregando..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!pedido) {
    return (
      <MainLayout>
        <Header title="Pedido não encontrado" />
        <div className="p-6">
          <p className="text-muted-foreground">Pedido não encontrado.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Editar Pedido" subtitle={`#${pedido.id.slice(0, 6)} • ${pedido.cliente_nome}`} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/vendas/pedidos")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileEdit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Pedido</h1>
              <p className="text-sm text-muted-foreground">
                #{pedido.id.slice(0, 6)} • {pedido.cliente_nome}
              </p>
            </div>
          </div>
          {getStatusBadge(pedido.status)}
        </div>

        {/* Aviso de status */}
        {(pedido.status === "entregue" || pedido.status === "cancelado") && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
            ⚠️ Este pedido já foi {pedido.status === "entregue" ? "entregue" : "cancelado"} e não pode ser editado.
          </div>
        )}

        {/* Layout Principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Endereço de Entrega */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Endereço Completo</Label>
                  <Textarea
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro, cidade..."
                    className="mt-1"
                    disabled={pedido.status === "entregue" || pedido.status === "cancelado"}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações do pedido..."
                    className="mt-1"
                    disabled={pedido.status === "entregue" || pedido.status === "cancelado"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Entregador */}
            <DeliveryPersonSelect
              value={entregador.id}
              onChange={handleSelecionarEntregador}
              endereco={endereco}
            />

            {/* Produtos */}
            <ProductSearch itens={itens} onChange={setItens} />
          </div>

          {/* Coluna Direita - Resumo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium">{pedido.cliente_nome}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entregador</span>
                    <span className="font-medium">{entregador.nome || "Não atribuído"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Itens</span>
                    <span className="font-medium">{itens.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {totalVenda.toFixed(2)}
                    </span>
                  </div>
                  {pedido.valor_total !== totalVenda && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Valor original: R$ {pedido.valor_total.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    onClick={handleSalvar}
                    disabled={saving || pedido.status === "entregue" || pedido.status === "cancelado"}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/vendas/pedidos")}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
