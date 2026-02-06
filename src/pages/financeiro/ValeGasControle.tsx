import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useValeGas, StatusVale } from "@/contexts/ValeGasContext";
import { 
  Search, 
  QrCode,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  Filter
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ValeGasControle() {
  const { vales, parceiros, getValeByNumero, getValeByCodigo, registrarVendaConsumidor, utilizarVale } = useValeGas();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParceiro, setFilterParceiro] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedVale, setSelectedVale] = useState<string | null>(null);
  const [vendaDialogOpen, setVendaDialogOpen] = useState(false);
  const [utilizacaoDialogOpen, setUtilizacaoDialogOpen] = useState(false);
  
  const [consumidorData, setConsumidorData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
  });

  // Filtrar vales
  const valesFiltrados = useMemo(() => {
    return vales.filter(vale => {
      // Filtro por parceiro
      if (filterParceiro !== "todos" && vale.parceiroId !== filterParceiro) return false;
      
      // Filtro por status
      if (filterStatus !== "todos" && vale.status !== filterStatus) return false;
      
      // Filtro por busca
      if (searchTerm) {
        const termo = searchTerm.toLowerCase();
        const matchNumero = vale.numero.toString().includes(termo);
        const matchCodigo = vale.codigo.toLowerCase().includes(termo);
        const matchConsumidor = vale.consumidorNome?.toLowerCase().includes(termo);
        if (!matchNumero && !matchCodigo && !matchConsumidor) return false;
      }
      
      return true;
    });
  }, [vales, filterParceiro, filterStatus, searchTerm]);

  const estatisticas = useMemo(() => ({
    total: vales.length,
    disponiveis: vales.filter(v => v.status === "disponivel").length,
    vendidos: vales.filter(v => v.status === "vendido").length,
    utilizados: vales.filter(v => v.status === "utilizado").length,
  }), [vales]);

  const handleBuscarVale = () => {
    const numero = parseInt(searchTerm);
    let vale = null;
    
    if (!isNaN(numero)) {
      vale = getValeByNumero(numero);
    } else {
      vale = getValeByCodigo(searchTerm);
    }
    
    if (vale) {
      setSelectedVale(vale.id);
      toast.success(`Vale ${vale.numero} encontrado!`);
    } else {
      toast.error("Vale não encontrado");
    }
  };

  const handleRegistrarVenda = () => {
    if (!selectedVale || !consumidorData.nome) {
      toast.error("Preencha os dados do consumidor");
      return;
    }
    
    registrarVendaConsumidor(selectedVale, consumidorData);
    toast.success("Venda registrada! Vale está pronto para entrega.");
    setVendaDialogOpen(false);
    setConsumidorData({ nome: "", endereco: "", telefone: "" });
    setSelectedVale(null);
  };

  const handleUtilizarVale = () => {
    if (!selectedVale) return;
    
    const resultado = utilizarVale(selectedVale, "ent-demo", "Entregador Demo", "venda-demo");
    
    if (resultado.sucesso) {
      toast.success(resultado.mensagem);
    } else {
      toast.error(resultado.mensagem);
    }
    
    setUtilizacaoDialogOpen(false);
    setSelectedVale(null);
  };

  const getStatusIcon = (status: StatusVale) => {
    switch (status) {
      case "disponivel": return <Package className="h-4 w-4 text-blue-500" />;
      case "vendido": return <Clock className="h-4 w-4 text-amber-500" />;
      case "utilizado": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelado": return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: StatusVale) => {
    switch (status) {
      case "disponivel": return <Badge variant="secondary">Disponível</Badge>;
      case "vendido": return <Badge className="bg-amber-500">Vendido</Badge>;
      case "utilizado": return <Badge className="bg-green-600">Utilizado</Badge>;
      case "cancelado": return <Badge variant="destructive">Cancelado</Badge>;
    }
  };

  const valeAtual = vales.find(v => v.id === selectedVale);
  const parceiroValeAtual = valeAtual ? parceiros.find(p => p.id === valeAtual.parceiroId) : null;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Controle de Vales Gás</h1>
          <p className="text-muted-foreground">Gerencie a numeração e status dos vales</p>
        </div>

        {/* Cards resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                  <p className="text-sm text-muted-foreground">Total Vales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.disponiveis}</p>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.vendidos}</p>
                  <p className="text-sm text-muted-foreground">Vendidos (aguardando)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.utilizados}</p>
                  <p className="text-sm text-muted-foreground">Utilizados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca e filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Buscar Vale
            </CardTitle>
            <CardDescription>
              Digite o número ou código do vale para buscar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Número ou código do vale (ex: 28 ou VG-2024-00028)"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleBuscarVale()}
                />
              </div>
              <Button onClick={handleBuscarVale} className="gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
            
            <div className="flex gap-4 mt-4">
              <div className="w-48">
                <Select value={filterParceiro} onValueChange={setFilterParceiro}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Parceiros</SelectItem>
                    {parceiros.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="utilizado">Utilizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de vales */}
        <Card>
          <CardHeader>
            <CardTitle>Vales ({valesFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Nº</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Consumidor</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valesFiltrados.slice(0, 50).map(vale => {
                    const parceiro = parceiros.find(p => p.id === vale.parceiroId);
                    return (
                      <TableRow key={vale.id}>
                        <TableCell className="font-mono font-bold">{vale.numero}</TableCell>
                        <TableCell className="font-mono text-xs">{vale.codigo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{parceiro?.nome}</p>
                            <Badge variant="outline" className="text-xs">
                              {parceiro?.tipo === "prepago" ? "Pré-pago" : "Consignado"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vale.consumidorNome ? (
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{vale.consumidorNome}</p>
                              {vale.consumidorEndereco && (
                                <p className="text-xs text-muted-foreground">{vale.consumidorEndereco}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">R$ {vale.valor.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(vale.status)}
                            {getStatusBadge(vale.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {vale.status === "disponivel" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedVale(vale.id);
                                  setVendaDialogOpen(true);
                                }}
                              >
                                Vender
                              </Button>
                            )}
                            {vale.status === "vendido" && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedVale(vale.id);
                                  setUtilizacaoDialogOpen(true);
                                }}
                              >
                                Utilizar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {valesFiltrados.length > 50 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Mostrando 50 de {valesFiltrados.length} vales. Use os filtros para refinar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog de venda */}
        <Dialog open={vendaDialogOpen} onOpenChange={setVendaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Venda do Vale</DialogTitle>
            </DialogHeader>
            {valeAtual && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-mono font-bold">Vale Nº {valeAtual.numero}</p>
                      <p className="text-sm text-muted-foreground">{parceiroValeAtual?.nome}</p>
                    </div>
                    <p className="text-xl font-bold">R$ {valeAtual.valor.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome do Consumidor
                  </Label>
                  <Input
                    value={consumidorData.nome}
                    onChange={e => setConsumidorData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço de Entrega
                  </Label>
                  <Input
                    value={consumidorData.endereco}
                    onChange={e => setConsumidorData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, número, bairro..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    value={consumidorData.telefone}
                    onChange={e => setConsumidorData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setVendaDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleRegistrarVenda}>
                    Registrar Venda
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de utilização */}
        <Dialog open={utilizacaoDialogOpen} onOpenChange={setUtilizacaoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Utilização do Vale</DialogTitle>
            </DialogHeader>
            {valeAtual && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-mono font-bold">Vale Nº {valeAtual.numero}</p>
                      <p className="text-sm text-muted-foreground">{valeAtual.codigo}</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">R$ {valeAtual.valor.toFixed(2)}</p>
                  </div>
                  
                  <div className="border-t pt-3 space-y-1">
                    <p className="text-sm"><strong>Parceiro:</strong> {parceiroValeAtual?.nome}</p>
                    <p className="text-sm"><strong>Consumidor:</strong> {valeAtual.consumidorNome}</p>
                    <p className="text-sm"><strong>Endereço:</strong> {valeAtual.consumidorEndereco}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Ao confirmar, o vale será marcado como utilizado e o valor será registrado 
                  {parceiroValeAtual?.tipo === "consignado" 
                    ? " para acerto de conta com o parceiro."
                    : " como recebido."}
                </p>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setUtilizacaoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUtilizarVale} className="bg-green-600 hover:bg-green-700">
                    Confirmar Utilização
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
