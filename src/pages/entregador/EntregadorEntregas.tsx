import { useState } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Navigation,
  User,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { IniciarRotaModal } from "@/components/entregador/IniciarRotaModal";

interface Entrega {
  id: number;
  pedidoId: number;
  cliente: string;
  telefone: string;
  endereco: string;
  bairro: string;
  produto: string;
  quantidade: number;
  status: "pendente" | "aceita" | "em_rota" | "entregue";
  horarioPrevisto: string;
  valorTotal: number;
  formaPagamento: string;
  veiculo?: string;
  kmInicial?: number;
}

const entregasIniciais: Entrega[] = [
  {
    id: 1,
    pedidoId: 1001,
    cliente: "Maria Silva",
    telefone: "(11) 99999-1111",
    endereco: "Rua das Flores, 123",
    bairro: "Centro",
    produto: "Botijão P13",
    quantidade: 2,
    status: "pendente",
    horarioPrevisto: "10:30",
    valorTotal: 240.0,
    formaPagamento: "Dinheiro",
  },
  {
    id: 2,
    pedidoId: 1002,
    cliente: "João Santos",
    telefone: "(11) 99999-2222",
    endereco: "Av. Brasil, 456",
    bairro: "Jardim América",
    produto: "Botijão P13",
    quantidade: 1,
    status: "pendente",
    horarioPrevisto: "11:00",
    valorTotal: 120.0,
    formaPagamento: "PIX",
  },
  {
    id: 3,
    pedidoId: 1003,
    cliente: "Ana Oliveira",
    telefone: "(11) 99999-3333",
    endereco: "Rua São Paulo, 789",
    bairro: "Vila Nova",
    produto: "Botijão P45",
    quantidade: 1,
    status: "aceita",
    horarioPrevisto: "11:30",
    valorTotal: 450.0,
    formaPagamento: "Cartão Crédito",
  },
  {
    id: 4,
    pedidoId: 1004,
    cliente: "Carlos Ferreira",
    telefone: "(11) 99999-4444",
    endereco: "Rua Minas Gerais, 321",
    bairro: "Centro",
    produto: "Botijão P13",
    quantidade: 3,
    status: "em_rota",
    horarioPrevisto: "12:00",
    valorTotal: 360.0,
    formaPagamento: "Vale Gás",
    veiculo: "ABC-1234",
    kmInicial: 45230,
  },
  {
    id: 5,
    pedidoId: 1005,
    cliente: "Lucia Costa",
    telefone: "(11) 99999-5555",
    endereco: "Av. Paulista, 1000",
    bairro: "Consolação",
    produto: "Botijão P20",
    quantidade: 1,
    status: "entregue",
    horarioPrevisto: "09:00",
    valorTotal: 180.0,
    formaPagamento: "Dinheiro",
    veiculo: "DEF-5678",
    kmInicial: 62100,
  },
];

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-muted text-muted-foreground", icon: Clock },
  aceita: { label: "Aceita", color: "bg-info/10 text-info", icon: Package },
  em_rota: { label: "Em Rota", color: "bg-warning/10 text-warning", icon: Truck },
  entregue: { label: "Entregue", color: "bg-success/10 text-success", icon: CheckCircle },
};

export default function EntregadorEntregas() {
  const [entregas, setEntregas] = useState<Entrega[]>(entregasIniciais);
  const [tabAtiva, setTabAtiva] = useState("pendentes");
  const [modalIniciarRota, setModalIniciarRota] = useState(false);
  const [entregaParaIniciar, setEntregaParaIniciar] = useState<Entrega | null>(null);
  const { toast } = useToast();

  const aceitarEntrega = (id: number) => {
    setEntregas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "aceita" as const } : e))
    );
    toast({
      title: "Entrega aceita!",
      description: "A entrega foi adicionada à sua rota.",
    });
  };

  const handleIniciarRota = (id: number) => {
    const entrega = entregas.find(e => e.id === id);
    if (entrega) {
      setEntregaParaIniciar(entrega);
      setModalIniciarRota(true);
    }
  };

  const confirmarInicioRota = (veiculoId: number, veiculoPlaca: string, kmInicial: number) => {
    if (entregaParaIniciar) {
      setEntregas((prev) =>
        prev.map((e) => 
          e.id === entregaParaIniciar.id 
            ? { 
                ...e, 
                status: "em_rota" as const,
                veiculo: veiculoPlaca,
                kmInicial: kmInicial
              } 
            : e
        )
      );
      toast({
        title: "Rota iniciada!",
        description: `Veículo ${veiculoPlaca} - KM Inicial: ${kmInicial.toLocaleString("pt-BR")}`,
      });
      setModalIniciarRota(false);
      setEntregaParaIniciar(null);
    }
  };

  const abrirMapa = (endereco: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, "_blank");
  };

  const ligar = (telefone: string) => {
    window.open(`tel:${telefone}`, "_self");
  };

  const getEntregasByStatus = (status: string) => {
    if (status === "pendentes") return entregas.filter((e) => e.status === "pendente");
    if (status === "aceitas") return entregas.filter((e) => e.status === "aceita" || e.status === "em_rota");
    if (status === "finalizadas") return entregas.filter((e) => e.status === "entregue");
    return entregas;
  };

  const renderEntrega = (entrega: Entrega) => {
    const StatusIcon = statusConfig[entrega.status].icon;

    return (
      <Card key={entrega.id} className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Header do card */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{entrega.cliente}</p>
                <p className="text-xs text-muted-foreground">Pedido #{entrega.pedidoId}</p>
              </div>
            </div>
            <Badge className={statusConfig[entrega.status].color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[entrega.status].label}
            </Badge>
          </div>

          {/* Detalhes */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{entrega.endereco}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {entrega.bairro}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>
                  {entrega.quantidade}x {entrega.produto}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{entrega.horarioPrevisto}</span>
              </div>
            </div>

            {/* Info do veículo se em rota */}
            {entrega.veiculo && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs">
                <Truck className="h-4 w-4 text-primary" />
                <span className="font-medium">{entrega.veiculo}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  KM: {entrega.kmInicial?.toLocaleString("pt-BR")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">{entrega.formaPagamento}</p>
                <p className="font-bold text-lg text-primary">
                  R$ {entrega.valorTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex border-t border-border">
            {entrega.status === "pendente" && (
              <Button
                onClick={() => aceitarEntrega(entrega.id)}
                className="flex-1 rounded-none gradient-primary text-white h-12"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceitar Entrega
              </Button>
            )}

            {entrega.status === "aceita" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => abrirMapa(entrega.endereco)}
                  className="flex-1 rounded-none h-12"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Mapa
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => ligar(entrega.telefone)}
                  className="flex-1 rounded-none h-12 border-l border-border"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button
                  onClick={() => handleIniciarRota(entrega.id)}
                  className="flex-1 rounded-none gradient-primary text-white h-12"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              </>
            )}

            {entrega.status === "em_rota" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => abrirMapa(entrega.endereco)}
                  className="flex-1 rounded-none h-12"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Mapa
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => ligar(entrega.telefone)}
                  className="flex-1 rounded-none h-12 border-l border-border"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Link to={`/entregador/entregas/${entrega.id}/finalizar`} className="flex-1">
                  <Button className="w-full rounded-none gradient-primary text-white h-12">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </Link>
              </>
            )}

            {entrega.status === "entregue" && (
              <div className="flex-1 flex items-center justify-center h-12 text-success text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Entrega concluída
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <EntregadorLayout title="Entregas">
      <div className="p-4">
        <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="pendentes" className="relative">
              Pendentes
              {getEntregasByStatus("pendentes").length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {getEntregasByStatus("pendentes").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="aceitas">Em Andamento</TabsTrigger>
            <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="space-y-4 mt-0">
            {getEntregasByStatus("pendentes").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma entrega pendente</p>
              </div>
            ) : (
              getEntregasByStatus("pendentes").map(renderEntrega)
            )}
          </TabsContent>

          <TabsContent value="aceitas" className="space-y-4 mt-0">
            {getEntregasByStatus("aceitas").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma entrega em andamento</p>
              </div>
            ) : (
              getEntregasByStatus("aceitas").map(renderEntrega)
            )}
          </TabsContent>

          <TabsContent value="finalizadas" className="space-y-4 mt-0">
            {getEntregasByStatus("finalizadas").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma entrega finalizada hoje</p>
              </div>
            ) : (
              getEntregasByStatus("finalizadas").map(renderEntrega)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Iniciar Rota */}
      <IniciarRotaModal
        isOpen={modalIniciarRota}
        onClose={() => {
          setModalIniciarRota(false);
          setEntregaParaIniciar(null);
        }}
        onConfirm={confirmarInicioRota}
        entregaNome={entregaParaIniciar?.cliente}
      />
    </EntregadorLayout>
  );
}
