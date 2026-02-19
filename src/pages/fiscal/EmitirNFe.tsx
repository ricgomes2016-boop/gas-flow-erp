import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Send, Search, FileText, XCircle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listarNotas, criarNota, transmitirParaSefaz, cancelarNaSefaz, enviarCartaCorrecao, type NotaFiscal } from "@/services/focusNfeService";

export default function EmitirNFe() {
  const { toast } = useToast();
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");

  const carregarNotas = async () => {
    try {
      const data = await listarNotas("nfe", { busca, status: filtroStatus });
      setNotas(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarNotas(); }, [busca, filtroStatus]);

  const statusColor = (s: string) => {
    if (s === "autorizada") return "default" as const;
    if (s === "cancelada") return "destructive" as const;
    return "secondary" as const;
  };

  const handleEmitir = async () => {
    try {
      const nota = await criarNota({
        tipo: "nfe",
        status: "rascunho",
        destinatario_nome: "Novo destinatário",
        natureza_operacao: "Venda de mercadoria",
        valor_total: 0,
      });
      const result = await transmitirParaSefaz(nota.id);
      toast({ title: "NF-e enviada", description: result.message });
      carregarNotas();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleCancelar = async (id: string) => {
    try {
      const result = await cancelarNaSefaz(id, "Cancelamento solicitado pelo operador");
      toast({ title: "NF-e cancelada", description: result.message });
      carregarNotas();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <Header title="NF-e" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
        <Tabs defaultValue="consultar">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="consultar"><Search className="h-4 w-4 mr-2" />Consultar</TabsTrigger>
              <TabsTrigger value="emitir"><Plus className="h-4 w-4 mr-2" />Nova NF-e</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="consultar">
            <Card>
              <CardHeader><CardTitle className="text-lg">Notas Fiscais Eletrônicas</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Input placeholder="Buscar por destinatário ou número..." className="max-w-sm" value={busca} onChange={e => setBusca(e.target.value)} />
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="autorizada">Autorizadas</SelectItem>
                      <SelectItem value="cancelada">Canceladas</SelectItem>
                      <SelectItem value="rejeitada">Rejeitadas</SelectItem>
                      <SelectItem value="rascunho">Rascunhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                    ) : notas.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma NF-e encontrada</TableCell></TableRow>
                    ) : notas.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-mono text-sm">{n.numero || "—"}</TableCell>
                        <TableCell>{new Date(n.data_emissao).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{n.destinatario_nome || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">{n.destinatario_cpf_cnpj || "—"}</TableCell>
                        <TableCell className="text-right font-semibold">R$ {Number(n.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell><Badge variant={statusColor(n.status)}>{n.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" title="Ver XML"><FileText className="h-4 w-4" /></Button>
                            {n.status === "autorizada" && (
                              <Button variant="ghost" size="icon" title="Cancelar" onClick={() => handleCancelar(n.id)}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emitir">
            <div className="grid gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Dados do Destinatário</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>CNPJ / CPF</Label><Input placeholder="00.000.000/0000-00" /></div>
                  <div className="md:col-span-2"><Label>Razão Social</Label><Input placeholder="Nome do destinatário" /></div>
                  <div className="md:col-span-2"><Label>Endereço</Label><Input placeholder="Endereço completo" /></div>
                  <div><Label>Cidade / UF</Label><Input placeholder="São Paulo / SP" /></div>
                  <div><Label>Inscrição Estadual</Label><Input placeholder="000.000.000.000" /></div>
                  <div><Label>CEP</Label><Input placeholder="00000-000" /></div>
                  <div><Label>Telefone</Label><Input placeholder="(00) 0000-0000" /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Produtos / Serviços</CardTitle>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar Item</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>NCM</TableHead>
                        <TableHead>CFOP</TableHead>
                        <TableHead>UN</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">Adicione itens à nota fiscal</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Informações Complementares</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Natureza da Operação</Label><Input defaultValue="Venda de mercadoria" /></div>
                  <div>
                    <Label>Forma de Pagamento</Label>
                    <Select defaultValue="vista">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vista">À Vista</SelectItem>
                        <SelectItem value="prazo">A Prazo</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2"><Label>Observações</Label><Textarea placeholder="Informações adicionais da nota fiscal..." /></div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Salvar Rascunho</Button>
                <Button onClick={handleEmitir}><Send className="h-4 w-4 mr-2" />Transmitir para SEFAZ</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
