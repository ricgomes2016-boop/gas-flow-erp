import { useState, useEffect } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Gauge,
  Package,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string | null;
  km_atual: number | null;
}

interface RotaDefinida {
  id: string;
  nome: string;
  bairros: string[];
  distancia_km: number | null;
  tempo_estimado: string | null;
}

interface Escala {
  id: string;
  data: string;
  turno_inicio: string;
  turno_fim: string;
  status: string;
  rota_definida_id: string | null;
  rotas_definidas: RotaDefinida | null;
}

interface ProdutoEstoque {
  id: string;
  nome: string;
  estoque: number | null;
  categoria: string | null;
}

export default function EntregadorIniciarJornada() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [rotasDefinidas, setRotasDefinidas] = useState<RotaDefinida[]>([]);
  const [escalaHoje, setEscalaHoje] = useState<Escala | null>(null);
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [entregadorId, setEntregadorId] = useState<string | null>(null);
  
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [rotaSelecionada, setRotaSelecionada] = useState("");
  const [estoqueCarga, setEstoqueCarga] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isIniciando, setIsIniciando] = useState(false);
  const [isEncerrando, setIsEncerrando] = useState(false);
  const [rotaAtiva, setRotaAtiva] = useState(false);
  const [rotaAtivaId, setRotaAtivaId] = useState<string | null>(null);
  const [rotaAtivaKmInicial, setRotaAtivaKmInicial] = useState<number | null>(null);
  const [kmFinal, setKmFinal] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get entregador
      const { data: entregador } = await supabase
        .from("entregadores")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (entregador) {
        setEntregadorId(entregador.id);

        // Check if already has active route today
        const { data: rotaAtual } = await supabase
          .from("rotas")
          .select("id, km_inicial")
          .eq("entregador_id", entregador.id)
          .eq("status", "em_andamento")
          .maybeSingle();

        if (rotaAtual) {
          setRotaAtiva(true);
          setRotaAtivaId(rotaAtual.id);
          setRotaAtivaKmInicial(rotaAtual.km_inicial);
        }

        // Get today's schedule
        const hoje = new Date().toISOString().split("T")[0];
        const { data: escala } = await supabase
          .from("escalas_entregador")
          .select(`
            id, data, turno_inicio, turno_fim, status, rota_definida_id,
            rotas_definidas:rota_definida_id (id, nome, bairros, distancia_km, tempo_estimado)
          `)
          .eq("entregador_id", entregador.id)
          .eq("data", hoje)
          .maybeSingle();

        if (escala) {
          setEscalaHoje(escala as unknown as Escala);
          if (escala.rota_definida_id) {
            setRotaSelecionada(escala.rota_definida_id);
          }
        }
      }

      // Fetch vehicles, routes, products in parallel
      const [veiculosRes, rotasRes, produtosRes] = await Promise.all([
        supabase.from("veiculos").select("id, placa, modelo, marca, km_atual").eq("ativo", true),
        supabase.from("rotas_definidas").select("id, nome, bairros, distancia_km, tempo_estimado").eq("ativo", true),
        supabase.from("produtos").select("id, nome, estoque, categoria").eq("ativo", true).order("nome"),
      ]);

      if (veiculosRes.data) setVeiculos(veiculosRes.data);
      if (rotasRes.data) setRotasDefinidas(rotasRes.data as unknown as RotaDefinida[]);
      if (produtosRes.data) setProdutos(produtosRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstoqueChange = (produtoId: string, qtd: number) => {
    setEstoqueCarga((prev) => ({ ...prev, [produtoId]: qtd }));
  };

  const veiculoInfo = veiculos.find((v) => v.id === veiculoSelecionado);
  const rotaInfo = rotasDefinidas.find((r) => r.id === rotaSelecionada);

  const handleIniciarJornada = async () => {
    if (!entregadorId) {
      toast({ title: "Erro", description: "Você não está cadastrado como entregador.", variant: "destructive" });
      return;
    }
    if (!veiculoSelecionado) {
      toast({ title: "Atenção", description: "Selecione um veículo.", variant: "destructive" });
      return;
    }
    if (!kmInicial || parseInt(kmInicial) < 0) {
      toast({ title: "Atenção", description: "Informe a quilometragem inicial.", variant: "destructive" });
      return;
    }

    setIsIniciando(true);
    try {
      // Create route record
      const { error: rotaError } = await supabase.from("rotas").insert({
        entregador_id: entregadorId,
        veiculo_id: veiculoSelecionado,
        km_inicial: parseInt(kmInicial),
        status: "em_andamento",
      });

      if (rotaError) throw rotaError;

      // Update entregador status
      await supabase
        .from("entregadores")
        .update({ status: "em_rota" })
        .eq("id", entregadorId);

      // Update escala if exists
      if (escalaHoje) {
        await supabase
          .from("escalas_entregador")
          .update({ status: "ativo" })
          .eq("id", escalaHoje.id);
      }

      toast({
        title: "Jornada iniciada! 🚀",
        description: `Veículo ${veiculoInfo?.placa} - KM: ${parseInt(kmInicial).toLocaleString("pt-BR")}`,
      });

      navigate("/entregador/entregas");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsIniciando(false);
    }
  };

  if (isLoading) {
    return (
      <EntregadorLayout title="Iniciar Jornada">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </EntregadorLayout>
    );
  }

  if (!entregadorId) {
    return (
      <EntregadorLayout title="Iniciar Jornada">
        <div className="p-4 space-y-4">
          <Card className="border-none shadow-md bg-destructive/5 border-l-4 border-l-destructive">
            <CardContent className="p-6 text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Cadastro não encontrado</h2>
              <p className="text-muted-foreground">
                Sua conta não está vinculada a um cadastro de entregador. Contate o administrador.
              </p>
            </CardContent>
          </Card>
        </div>
      </EntregadorLayout>
    );
  }

  const handleEncerrarJornada = async () => {
    if (!entregadorId || !rotaAtivaId) return;
    if (!kmFinal || parseInt(kmFinal) < 0) {
      toast({ title: "Atenção", description: "Informe a quilometragem final.", variant: "destructive" });
      return;
    }
    if (rotaAtivaKmInicial !== null && parseInt(kmFinal) < rotaAtivaKmInicial) {
      toast({ title: "Atenção", description: "KM final não pode ser menor que o KM inicial.", variant: "destructive" });
      return;
    }

    setIsEncerrando(true);
    try {
      await supabase.from("rotas").update({
        status: "finalizada",
        km_final: parseInt(kmFinal),
        data_fim: new Date().toISOString(),
      }).eq("id", rotaAtivaId);

      await supabase.from("entregadores").update({ status: "indisponivel" }).eq("id", entregadorId);

      if (escalaHoje) {
        await supabase.from("escalas_entregador").update({ status: "finalizado" }).eq("id", escalaHoje.id);
      }

      toast({
        title: "Jornada encerrada! 🏁",
        description: `KM Final: ${parseInt(kmFinal).toLocaleString("pt-BR")} - Status: Não Disponível`,
      });
      navigate("/entregador");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsEncerrando(false);
    }
  };

  if (rotaAtiva) {
    return (
      <EntregadorLayout title="Jornada">
        <div className="p-4 space-y-4">
          <Card className="border-none shadow-md bg-success/5 border-l-4 border-l-success">
            <CardContent className="p-6 text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h2 className="text-xl font-bold">Jornada em andamento</h2>
              <p className="text-muted-foreground">Você possui uma rota ativa.</p>
              {rotaAtivaKmInicial !== null && (
                <Badge variant="outline">KM Inicial: {rotaAtivaKmInicial.toLocaleString("pt-BR")}</Badge>
              )}
              <Button onClick={() => navigate("/entregador/entregas")} className="w-full">
                Ver Entregas
              </Button>
            </CardContent>
          </Card>

          {/* Encerrar Jornada */}
          <Card className="border-none shadow-md border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Encerrar Jornada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Quilometragem Final</Label>
                <Input
                  type="number"
                  placeholder="Ex: 45350"
                  value={kmFinal}
                  onChange={(e) => setKmFinal(e.target.value)}
                  min={rotaAtivaKmInicial ?? 0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Informe a quilometragem atual do hodômetro
                </p>
              </div>
              <Button
                onClick={handleEncerrarJornada}
                disabled={isEncerrando || !kmFinal}
                variant="destructive"
                className="w-full h-12"
              >
                {isEncerrando ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                Encerrar Jornada - Ficar Indisponível
              </Button>
            </CardContent>
          </Card>
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Iniciar Jornada">
      <div className="p-4 space-y-4 pb-24">
        {/* Header */}
        <div className="gradient-primary rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-bold">Iniciar Jornada de Trabalho</h2>
              <p className="text-sm text-white/80">Preencha os dados para começar</p>
            </div>
          </div>
        </div>

        {/* Escala de hoje */}
        {escalaHoje ? (
          <Card className="border-none shadow-md border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Sua Escala de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {escalaHoje.turno_inicio.slice(0, 5)} - {escalaHoje.turno_fim.slice(0, 5)}
                  </span>
                </div>
                {escalaHoje.rotas_definidas && (
                  <Badge variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {escalaHoje.rotas_definidas.nome}
                  </Badge>
                )}
              </div>
              {escalaHoje.rotas_definidas?.bairros && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(escalaHoje.rotas_definidas.bairros as string[]).map((b) => (
                    <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-md bg-warning/5 border-l-4 border-l-warning">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm text-muted-foreground">
                Nenhuma escala definida para hoje. Selecione uma rota manualmente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Veículo */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              1. Selecionar Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={veiculoSelecionado} onValueChange={setVeiculoSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} - {v.modelo} {v.marca ? `(${v.marca})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {veiculoInfo && (
              <div className="flex items-center gap-2 p-2 bg-success/5 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">{veiculoInfo.placa} - {veiculoInfo.modelo}</span>
                {veiculoInfo.km_atual != null && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    KM atual: {veiculoInfo.km_atual.toLocaleString("pt-BR")}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* KM Inicial */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              2. Quilometragem Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              placeholder="Ex: 45230"
              value={kmInicial}
              onChange={(e) => setKmInicial(e.target.value)}
              min={0}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Informe a quilometragem atual do hodômetro
            </p>
          </CardContent>
        </Card>

        {/* Rota */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              3. Rota de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={rotaSelecionada} onValueChange={setRotaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a rota" />
              </SelectTrigger>
              <SelectContent>
                {rotasDefinidas.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rotaInfo && (
              <div className="p-3 bg-primary/5 rounded-lg space-y-2">
                <p className="font-medium text-sm">{rotaInfo.nome}</p>
                <div className="flex flex-wrap gap-1">
                  {(rotaInfo.bairros as string[]).map((b) => (
                    <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {rotaInfo.distancia_km && (
                    <span>{rotaInfo.distancia_km} km</span>
                  )}
                  {rotaInfo.tempo_estimado && (
                    <span>{rotaInfo.tempo_estimado}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque / Carga */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              4. Estoque / Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Informe a quantidade de cada produto que está levando (opcional)
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {produtos.filter(p => p.categoria === "Gás" || p.categoria === "Água").map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Estoque: {p.estoque ?? 0}
                    </p>
                  </div>
                  <Input
                    type="number"
                    className="w-20 h-8 text-center"
                    placeholder="0"
                    min={0}
                    value={estoqueCarga[p.id] || ""}
                    onChange={(e) => handleEstoqueChange(p.id, parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
              {produtos.filter(p => p.categoria === "Gás" || p.categoria === "Água").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum produto de Gás/Água cadastrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão Iniciar */}
        <Button
          onClick={handleIniciarJornada}
          disabled={isIniciando || !veiculoSelecionado || !kmInicial}
          className="w-full h-14 text-lg gradient-primary text-white shadow-lg"
          size="lg"
        >
          {isIniciando ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <PlayCircle className="h-5 w-5 mr-2" />
          )}
          Iniciar Jornada
        </Button>
      </div>
    </EntregadorLayout>
  );
}
