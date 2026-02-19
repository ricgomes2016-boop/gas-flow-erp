import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, PhoneIncoming, PhoneMissed, ShoppingCart, User, Search, Clock, PhoneCall, RotateCcw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Chamada {
  id: string;
  telefone: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  tipo: string;
  status: string;
  duracao_segundos: number | null;
  observacoes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  recebida: { label: "Recebida", variant: "default" },
  atendida: { label: "Atendida", variant: "secondary" },
  perdida: { label: "Perdida", variant: "destructive" },
  retornar: { label: "Retornar", variant: "outline" },
};

export default function CentralAtendimento() {
  const [chamadas, setChamadas] = useState<Chamada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  const fetchChamadas = async () => {
    let query = supabase
      .from("chamadas_recebidas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filtroStatus !== "todos") {
      query = query.eq("status", filtroStatus);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Erro ao carregar chamadas");
    } else {
      setChamadas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChamadas();

    // Realtime updates
    const channel = supabase
      .channel("central-atendimento")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chamadas_recebidas" },
        () => fetchChamadas()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filtroStatus]);

  const chamadasFiltradas = chamadas.filter((c) => {
    if (!busca) return true;
    const term = busca.toLowerCase();
    return (
      c.telefone.includes(term) ||
      c.cliente_nome?.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: chamadas.length,
    recebidas: chamadas.filter((c) => c.status === "recebida").length,
    atendidas: chamadas.filter((c) => c.status === "atendida").length,
    perdidas: chamadas.filter((c) => c.status === "perdida").length,
    retornar: chamadas.filter((c) => c.status === "retornar").length,
  };

  const handleMarcarRetornar = async (id: string) => {
    await supabase.from("chamadas_recebidas").update({ status: "retornar" }).eq("id", id);
    toast.success("Marcada para retorno");
    fetchChamadas();
  };

  const handleNovaVenda = (chamada: Chamada) => {
    if (chamada.cliente_id) {
      navigate(`/vendas/nova?cliente=${chamada.cliente_id}`);
    } else {
      navigate(`/vendas/nova?telefone=${encodeURIComponent(chamada.telefone)}`);
    }
  };

  return (
    <MainLayout>
      <Header title="Central de Atendimento" subtitle="Caller ID, histórico de chamadas e atendimento rápido" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <PhoneCall className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <PhoneIncoming className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.recebidas}</p>
                  <p className="text-xs text-muted-foreground">Aguardando</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.atendidas}</p>
                  <p className="text-xs text-muted-foreground">Atendidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <PhoneMissed className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{stats.perdidas}</p>
                  <p className="text-xs text-muted-foreground">Perdidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.retornar}</p>
                  <p className="text-xs text-muted-foreground">Retornar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por telefone ou nome..."
                  className="pl-9"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="recebida">Recebidas</SelectItem>
                  <SelectItem value="atendida">Atendidas</SelectItem>
                  <SelectItem value="perdida">Perdidas</SelectItem>
                  <SelectItem value="retornar">Retornar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Call List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Chamadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : chamadasFiltradas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma chamada encontrada</p>
            ) : (
              <div className="space-y-1">
                {chamadasFiltradas.map((chamada, idx) => {
                  const status = statusConfig[chamada.status] || statusConfig.recebida;
                  return (
                    <div key={chamada.id}>
                      {idx > 0 && <Separator className="my-3" />}
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-muted">
                          {chamada.tipo === "whatsapp" ? (
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {chamada.cliente_nome || chamada.telefone}
                            </span>
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {chamada.cliente_nome && <span>{chamada.telefone}</span>}
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(chamada.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {chamada.status !== "retornar" && chamada.status !== "atendida" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-xs"
                              onClick={() => handleMarcarRetornar(chamada.id)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Retornar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={() => handleNovaVenda(chamada)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Venda
                          </Button>
                          {chamada.cliente_id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-xs"
                              onClick={() => navigate(`/clientes/${chamada.cliente_id}`)}
                            >
                              <User className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
