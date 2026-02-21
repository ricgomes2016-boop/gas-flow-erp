import { useState, useEffect } from "react";
import { parseLocalDate } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Send, Search, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listarNotas, criarNota, transmitirParaSefaz, type NotaFiscal } from "@/services/focusNfeService";

export default function EmitirNFCe() {
  const { toast } = useToast();
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarNotas = async () => {
    try {
      const data = await listarNotas("nfce");
      setNotas(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarNotas(); }, []);

  const handleEmitir = async () => {
    try {
      const nota = await criarNota({
        tipo: "nfce",
        status: "rascunho",
        destinatario_nome: "Consumidor Final",
        valor_total: 0,
      });
      const result = await transmitirParaSefaz(nota.id);
      toast({ title: "NFC-e emitida", description: result.message });
      carregarNotas();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <Header title="NFC-e" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
        <Tabs defaultValue="consultar">
          <TabsList>
            <TabsTrigger value="consultar"><Search className="h-4 w-4 mr-2" />Consultar</TabsTrigger>
            <TabsTrigger value="emitir"><Plus className="h-4 w-4 mr-2" />Nova NFC-e</TabsTrigger>
          </TabsList>

          <TabsContent value="consultar">
            <Card>
              <CardHeader><CardTitle className="text-lg">Cupons Fiscais Emitidos (NFC-e)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Input placeholder="Buscar por cliente ou número..." className="max-w-sm" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                    ) : notas.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma NFC-e encontrada</TableCell></TableRow>
                    ) : notas.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.numero || "—"}</TableCell>
                        <TableCell>{parseLocalDate(c.data_emissao).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{c.destinatario_nome || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">{c.destinatario_cpf_cnpj || "—"}</TableCell>
                        <TableCell className="text-right font-semibold">R$ {Number(c.valor_total).toFixed(2)}</TableCell>
                        <TableCell><Badge variant={c.status === "autorizada" ? "default" : "destructive"}>{c.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" title="Reimprimir"><Printer className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emitir">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Dados do Consumidor (opcional)</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div><Label>CPF</Label><Input placeholder="000.000.000-00" /></div>
                    <div><Label>Nome</Label><Input placeholder="Consumidor Final" /></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Itens da Venda</CardTitle>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>UN</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Valor Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Adicione itens à venda</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Pagamento</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Forma de Pagamento</Label>
                      <Select defaultValue="dinheiro">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="credito">Cartão Crédito</SelectItem>
                          <SelectItem value="debito">Cartão Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>R$ 0,00</span>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleEmitir}><Send className="h-4 w-4 mr-2" />Emitir NFC-e</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
