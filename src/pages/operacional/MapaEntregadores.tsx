import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Truck, RefreshCw, Route, History, User, Clock, Eye, EyeOff } from "lucide-react";
import { DeliveryRoutesMap, Entregador, ClienteEntrega, PercursoPonto } from "@/components/mapa/DeliveryRoutesMap";

// Mock data - entregadores com coordenadas
const entregadoresMock: Entregador[] = [
  {
    id: "e1",
    nome: "Carlos Souza",
    status: "em_rota",
    lat: -23.5605,
    lng: -46.6433,
    ultimaAtualizacao: "há 2 min",
    entregaAtual: "João Silva",
    veiculo: "Fiorino ABC-1234",
    kmInicial: 45230,
  },
  {
    id: "e2",
    nome: "Roberto Lima",
    status: "disponivel",
    lat: -23.5505,
    lng: -46.6333,
    ultimaAtualizacao: "há 5 min",
    veiculo: "Strada DEF-5678",
    kmInicial: 62100,
  },
  {
    id: "e3",
    nome: "Fernando Alves",
    status: "em_rota",
    lat: -23.5405,
    lng: -46.6533,
    ultimaAtualizacao: "há 1 min",
    entregaAtual: "Maria Santos",
    veiculo: "Saveiro JKL-3456",
    kmInicial: 15200,
  },
];

// Mock data - clientes/entregas
const clientesMock: ClienteEntrega[] = [
  {
    id: "c1",
    cliente: "João Silva",
    endereco: "Rua das Flores, 123 - Centro",
    lat: -23.5655,
    lng: -46.6483,
    status: "em_rota",
    entregadorId: "e1",
    horarioPrevisto: "10:30",
  },
  {
    id: "c2",
    cliente: "Ana Oliveira",
    endereco: "Av. Brasil, 456 - Jardim América",
    lat: -23.5555,
    lng: -46.6383,
    status: "pendente",
    horarioPrevisto: "11:00",
  },
  {
    id: "c3",
    cliente: "Maria Santos",
    endereco: "Rua São Paulo, 789 - Vila Nova",
    lat: -23.5355,
    lng: -46.6583,
    status: "em_rota",
    entregadorId: "e3",
    horarioPrevisto: "11:30",
  },
  {
    id: "c4",
    cliente: "Pedro Costa",
    endereco: "Rua Minas Gerais, 321 - Consolação",
    lat: -23.5455,
    lng: -46.6433,
    status: "pendente",
    horarioPrevisto: "12:00",
  },
  {
    id: "c5",
    cliente: "Lucia Ferreira",
    endereco: "Av. Paulista, 1000 - Bela Vista",
    lat: -23.5705,
    lng: -46.6533,
    status: "pendente",
    entregadorId: "e1",
    horarioPrevisto: "12:30",
  },
];

// Mock data - percurso histórico do entregador
const percursoMock: Record<string, PercursoPonto[]> = {
  "e1": [
    { lat: -23.5505, lng: -46.6333, hora: "08:00" },
    { lat: -23.5525, lng: -46.6353, hora: "08:15" },
    { lat: -23.5555, lng: -46.6383, hora: "08:45" },
    { lat: -23.5585, lng: -46.6413, hora: "09:20" },
    { lat: -23.5605, lng: -46.6433, hora: "10:00" },
  ],
  "e3": [
    { lat: -23.5505, lng: -46.6333, hora: "08:00" },
    { lat: -23.5455, lng: -46.6433, hora: "08:30" },
    { lat: -23.5405, lng: -46.6533, hora: "09:15" },
  ],
};

export default function MapaEntregadores() {
  const [selectedEntregador, setSelectedEntregador] = useState<string | null>(null);
  const [showPercurso, setShowPercurso] = useState(false);
  const [tabAtiva, setTabAtiva] = useState("mapa");

  const entregadores = entregadoresMock;
  const clientes = clientesMock;

  const entregadorSelecionado = entregadores.find(e => e.id === selectedEntregador);
  const clientesDoEntregador = clientes.filter(c => c.entregadorId === selectedEntregador);
  const percursoAtual = selectedEntregador ? percursoMock[selectedEntregador] || [] : [];

  return (
    <MainLayout>
      <Header title="Mapa dos Entregadores" subtitle="Acompanhe a localização em tempo real" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {selectedEntregador && (
              <Button
                variant={showPercurso ? "default" : "outline"}
                onClick={() => setShowPercurso(!showPercurso)}
              >
                <History className="h-4 w-4 mr-2" />
                {showPercurso ? "Ocultar Percurso" : "Ver Percurso"}
              </Button>
            )}
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-lg bg-success/10">
                <Truck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entregadores.filter(e => e.status === "em_rota").length}
                </p>
                <p className="text-sm text-muted-foreground">Em Rota</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entregadores.filter(e => e.status === "disponivel").length}
                </p>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-lg bg-warning/10">
                <MapPin className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {clientes.filter(c => c.status === "pendente").length}
                </p>
                <p className="text-sm text-muted-foreground">Entregas Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-lg bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {clientes.filter(c => c.status === "em_rota").length}
                </p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista de Entregadores */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Entregadores
            </h3>
            {entregadores.map((entregador) => (
              <Card 
                key={entregador.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedEntregador === entregador.id 
                    ? "ring-2 ring-primary shadow-lg" 
                    : ""
                }`}
                onClick={() => setSelectedEntregador(
                  selectedEntregador === entregador.id ? null : entregador.id
                )}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      entregador.status === "em_rota" 
                        ? "bg-success/10" 
                        : "bg-primary/10"
                    }`}>
                      <Truck className={`h-5 w-5 ${
                        entregador.status === "em_rota" 
                          ? "text-success" 
                          : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{entregador.nome}</p>
                        <Badge
                          variant={
                            entregador.status === "em_rota" ? "default" : "secondary"
                          }
                        >
                          {entregador.status === "em_rota" ? "Em Rota" : "Disponível"}
                        </Badge>
                      </div>
                      {entregador.veiculo && (
                        <p className="text-sm text-muted-foreground mt-1">
                          🚗 {entregador.veiculo}
                        </p>
                      )}
                      {entregador.entregaAtual && (
                        <p className="text-sm text-primary mt-1">
                          → {entregador.entregaAtual}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Atualizado {entregador.ultimaAtualizacao}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes quando selecionado */}
                  {selectedEntregador === entregador.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">KM Inicial:</span>
                        <span className="text-sm font-medium">
                          {entregador.kmInicial?.toLocaleString("pt-BR")} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Entregas na rota:</span>
                        <span className="text-sm font-medium">
                          {clientesDoEntregador.length}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPercurso(!showPercurso);
                        }}
                      >
                        {showPercurso ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Ocultar Percurso
                          </>
                        ) : (
                          <>
                            <Route className="h-4 w-4 mr-2" />
                            Ver Percurso do Dia
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mapa */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mapa em Tempo Real
                {selectedEntregador && (
                  <Badge variant="outline" className="ml-2">
                    {entregadorSelecionado?.nome}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] rounded-b-lg overflow-hidden">
                <DeliveryRoutesMap
                  entregadores={entregadores}
                  clientes={clientes}
                  percurso={percursoAtual}
                  selectedEntregador={selectedEntregador}
                  onSelectEntregador={setSelectedEntregador}
                  showPercurso={showPercurso}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de clientes pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-warning" />
              Entregas do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {clientes.map((cliente) => {
                const entregadorAssociado = entregadores.find(e => e.id === cliente.entregadorId);
                return (
                  <div
                    key={cliente.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      cliente.status === "pendente" 
                        ? "bg-warning/10" 
                        : cliente.status === "em_rota"
                        ? "bg-primary/10"
                        : "bg-success/10"
                    }`}>
                      <MapPin className={`h-5 w-5 ${
                        cliente.status === "pendente" 
                          ? "text-warning" 
                          : cliente.status === "em_rota"
                          ? "text-primary"
                          : "text-success"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{cliente.cliente}</p>
                        <Badge 
                          variant={cliente.status === "pendente" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {cliente.status === "pendente" ? "Pendente" : cliente.status === "em_rota" ? "Em Rota" : "Entregue"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{cliente.endereco}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          ⏰ {cliente.horarioPrevisto}
                        </span>
                        {entregadorAssociado && (
                          <span className="text-xs text-primary">
                            {entregadorAssociado.nome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
