import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Barcode, Plus, Search, Eye, Copy, Printer, Send, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const boletosEmitidos = [
  { id: "1", numero: "00001", sacado: "Distribuidora Central Gás Ltda", cpfCnpj: "12.345.678/0001-90", valor: 4850.00, vencimento: "2026-03-05", emissao: "2026-02-18", status: "aberto", linhaDigitavel: "23793.38128 60000.000003 00000.000409 1 92850000485000" },
  { id: "2", numero: "00002", sacado: "Comercial Fogão & Cia", cpfCnpj: "98.765.432/0001-10", valor: 2300.00, vencimento: "2026-02-28", emissao: "2026-02-15", status: "pago", linhaDigitavel: "23793.38128 60000.000003 00000.000409 2 92850000230000" },
  { id: "3", numero: "00003", sacado: "Supermercado Bom Preço", cpfCnpj: "11.222.333/0001-44", valor: 7200.00, vencimento: "2026-02-20", emissao: "2026-02-10", status: "vencido", linhaDigitavel: "23793.38128 60000.000003 00000.000409 3 92850000720000" },
  { id: "4", numero: "00004", sacado: "Posto Estrela Azul", cpfCnpj: "55.666.777/0001-88", valor: 1580.00, vencimento: "2026-03-10", emissao: "2026-02-18", status: "aberto", linhaDigitavel: "23793.38128 60000.000003 00000.000409 4 92850000158000" },
  { id: "5", numero: "00005", sacado: "Padaria Pão Quente", cpfCnpj: "33.444.555/0001-22", valor: 960.00, vencimento: "2026-02-25", emissao: "2026-02-12", status: "cancelado", linhaDigitavel: "23793.38128 60000.000003 00000.000409 5 92850000096000" },
  { id: "6", numero: "00006", sacado: "Restaurante Sabor Caseiro", cpfCnpj: "44.555.666/0001-33", valor: 3450.00, vencimento: "2026-03-15", emissao: "2026-02-18", status: "aberto", linhaDigitavel: "23793.38128 60000.000003 00000.000409 6 92850000345000" },
];

const emptyForm = {
  sacado: "",
  cpfCnpj: "",
  endereco: "",
  valor: "",
  vencimento: "",
  descricao: "",
  juros: "2",
  multa: "2",
  instrucoes: "",
};

export default function EmissaoBoleto() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"emitir" | "consultar">("consultar");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [form, setForm] = useState(emptyForm);
  const [detalheBoleto, setDetalheBoleto] = useState<typeof boletosEmitidos[0] | null>(null);

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
    aberto: { label: "Aberto", variant: "outline", icon: Clock },
    pago: { label: "Pago", variant: "default", icon: CheckCircle2 },
    vencido: { label: "Vencido", variant: "destructive", icon: AlertTriangle },
    cancelado: { label: "Cancelado", variant: "secondary", icon: XCircle },
  };

  const handleEmitir = () => {
    if (!form.sacado || !form.cpfCnpj || !form.valor || !form.vencimento) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    toast({ title: "Boleto emitido com sucesso!", description: `Boleto para ${form.sacado} no valor de R$ ${parseFloat(form.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` });
    setForm(emptyForm);
    setTab("consultar");
  };

  const copiarLinha = (linha: string) => {
    navigator.clipboard.writeText(linha);
    toast({ title: "Linha digitável copiada!" });
  };

  const filtrados = boletosEmitidos.filter((b) => {
    const matchBusca = b.sacado.toLowerCase().includes(busca.toLowerCase()) || b.numero.includes(busca);
    const matchStatus = filtroStatus === "todos" || b.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalAberto = boletosEmitidos.filter((b) => b.status === "aberto").reduce((s, b) => s + b.valor, 0);
  const totalVencido = boletosEmitidos.filter((b) => b.status === "vencido").reduce((s, b) => s + b.valor, 0);
  const totalPago = boletosEmitidos.filter((b) => b.status === "pago").reduce((s, b) => s + b.valor, 0);

  return (
    <MainLayout>
      <Header title="Emissão de Boletos" subtitle="Gestão Financeira" />
      <div className="space-y-6 p-4 md:p-6">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xs text-muted-foreground">Total Emitidos</p>
              <p className="text-2xl font-bold">{boletosEmitidos.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xs text-muted-foreground">Em Aberto</p>
              <p className="text-2xl font-bold text-primary">R$ {totalAberto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xs text-muted-foreground">Vencidos</p>
              <p className="text-2xl font-bold text-destructive">R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xs text-muted-foreground">Recebidos</p>
              <p className="text-2xl font-bold text-green-600">R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <Button variant={tab === "consultar" ? "default" : "outline"} onClick={() => setTab("consultar")}>
            <Search className="h-4 w-4 mr-2" />Boletos Emitidos
          </Button>
          <Button variant={tab === "emitir" ? "default" : "outline"} onClick={() => setTab("emitir")}>
            <Plus className="h-4 w-4 mr-2" />Emitir Boleto
          </Button>
        </div>

        {tab === "consultar" && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-primary" />
                  Boletos Emitidos
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar sacado ou nº..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 w-56" />
                  </div>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Sacado</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((b) => {
                    const sc = statusConfig[b.status];
                    const StatusIcon = sc.icon;
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-sm">{b.numero}</TableCell>
                        <TableCell className="font-medium">{b.sacado}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{b.cpfCnpj}</TableCell>
                        <TableCell className="text-right font-medium">R$ {b.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{new Date(b.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Ver detalhes" onClick={() => setDetalheBoleto(b)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" title="Copiar linha digitável" onClick={() => copiarLinha(b.linhaDigitavel)}><Copy className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" title="Imprimir" onClick={() => toast({ title: "Imprimindo boleto..." })}><Printer className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" title="Enviar por e-mail" onClick={() => toast({ title: "Boleto enviado por e-mail!" })}><Send className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtrados.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum boleto encontrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {tab === "emitir" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5 text-primary" />
                Emitir Novo Boleto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dados do Sacado */}
              <div>
                <h3 className="font-semibold mb-3">Dados do Sacado (Pagador)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome / Razão Social *</Label>
                    <Input value={form.sacado} onChange={(e) => setForm({ ...form, sacado: e.target.value })} placeholder="Nome completo ou razão social" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF / CNPJ *</Label>
                    <Input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} placeholder="000.000.000-00 ou 00.000.000/0001-00" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Endereço</Label>
                    <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, nº, bairro, cidade - UF" />
                  </div>
                </div>
              </div>

              {/* Dados do Boleto */}
              <div>
                <h3 className="font-semibold mb-3">Dados do Boleto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$) *</Label>
                    <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Vencimento *</Label>
                    <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Venda de 50 botijões P13" />
                  </div>
                </div>
              </div>

              {/* Juros e Multa */}
              <div>
                <h3 className="font-semibold mb-3">Juros e Multa por Atraso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Juros ao mês (%)</Label>
                    <Input type="number" step="0.1" value={form.juros} onChange={(e) => setForm({ ...form, juros: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Multa (%)</Label>
                    <Input type="number" step="0.1" value={form.multa} onChange={(e) => setForm({ ...form, multa: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Instruções */}
              <div className="space-y-2">
                <Label>Instruções ao caixa / banco</Label>
                <Textarea value={form.instrucoes} onChange={(e) => setForm({ ...form, instrucoes: e.target.value })} placeholder="Ex: Não aceitar após 30 dias do vencimento" rows={2} />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleEmitir}>
                  <Barcode className="h-4 w-4 mr-2" />Emitir Boleto
                </Button>
                <Button variant="outline" onClick={() => setTab("consultar")}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de detalhes */}
        <Dialog open={!!detalheBoleto} onOpenChange={() => setDetalheBoleto(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Boleto #{detalheBoleto?.numero}</DialogTitle>
            </DialogHeader>
            {detalheBoleto && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Sacado:</span><p className="font-medium">{detalheBoleto.sacado}</p></div>
                  <div><span className="text-muted-foreground">CPF/CNPJ:</span><p className="font-medium">{detalheBoleto.cpfCnpj}</p></div>
                  <div><span className="text-muted-foreground">Valor:</span><p className="font-medium">R$ {detalheBoleto.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
                  <div><span className="text-muted-foreground">Vencimento:</span><p className="font-medium">{new Date(detalheBoleto.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</p></div>
                  <div><span className="text-muted-foreground">Emissão:</span><p className="font-medium">{new Date(detalheBoleto.emissao + "T12:00:00").toLocaleDateString("pt-BR")}</p></div>
                  <div><span className="text-muted-foreground">Status:</span>
                    <Badge variant={statusConfig[detalheBoleto.status].variant} className="mt-1">{statusConfig[detalheBoleto.status].label}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Linha Digitável:</span>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                    <code className="text-xs flex-1 break-all">{detalheBoleto.linhaDigitavel}</code>
                    <Button variant="ghost" size="icon" onClick={() => copiarLinha(detalheBoleto.linhaDigitavel)}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => toast({ title: "Imprimindo boleto..." })}><Printer className="h-4 w-4 mr-2" />Imprimir</Button>
                  <Button className="flex-1" onClick={() => toast({ title: "Boleto enviado por e-mail!" })}><Send className="h-4 w-4 mr-2" />Enviar por E-mail</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
