import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Archive, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listarNotas, type NotaFiscal } from "@/services/focusNfeService";

export default function GerarXML() {
  const { toast } = useToast();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarNotas(tipoFiltro === "todos" ? undefined : tipoFiltro as any)
      .then(setNotas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tipoFiltro]);

  const filtrados = notas;

  const toggle = (id: string) => {
    setSelecionados((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const ids = filtrados.map((x) => x.id);
    setSelecionados((prev) => prev.length === ids.length ? [] : ids);
  };

  const tipoLabel = (t: string) => t.toUpperCase().replace("NFE", "NF-e").replace("NFCE", "NFC-e").replace("CTE", "CT-e").replace("MDFE", "MDF-e");

  const tipoColor = (t: string) => {
    if (t === "nfe") return "default" as const;
    if (t === "nfce") return "secondary" as const;
    if (t === "cte") return "outline" as const;
    return "destructive" as const;
  };

  const contagem = (tipo: string) => notas.filter(n => n.tipo === tipo).length;

  return (
    <MainLayout>
      <Header title="Central de XML" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <Button variant="outline" disabled={selecionados.length === 0} onClick={() => toast({ title: `${selecionados.length} XML(s) baixado(s)` })}>
              <Download className="h-4 w-4 mr-2" />Baixar Selecionados ({selecionados.length})
            </Button>
            <Button disabled={selecionados.length === 0} onClick={() => toast({ title: "Lote ZIP gerado", description: `${selecionados.length} arquivos compactados.` })}>
              <Archive className="h-4 w-4 mr-2" />Gerar Lote ZIP
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["nfe", "nfce", "cte", "mdfe"].map(t => (
            <Card key={t} className="text-center p-4">
              <p className="text-2xl font-bold">{contagem(t)}</p>
              <p className="text-sm text-muted-foreground">{tipoLabel(t)}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Arquivos XML Disponíveis</CardTitle>
            <CardDescription>Selecione os documentos para download individual ou em lote.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <Input placeholder="Buscar por número, chave ou destinatário..." className="max-w-md" />
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nfe">NF-e</SelectItem>
                  <SelectItem value="nfce">NFC-e</SelectItem>
                  <SelectItem value="cte">CT-e</SelectItem>
                  <SelectItem value="mdfe">MDF-e</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" className="w-[160px]" />
              <Input type="date" className="w-[160px]" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selecionados.length === filtrados.length && filtrados.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum documento encontrado</TableCell></TableRow>
                ) : filtrados.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell><Checkbox checked={selecionados.includes(x.id)} onCheckedChange={() => toggle(x.id)} /></TableCell>
                    <TableCell><Badge variant={tipoColor(x.tipo)}>{tipoLabel(x.tipo)}</Badge></TableCell>
                    <TableCell className="font-mono text-sm">{x.numero || "—"}</TableCell>
                    <TableCell>{new Date(x.data_emissao).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">{x.destinatario_nome || "—"}</TableCell>
                    <TableCell className="text-right">{Number(x.valor_total) > 0 ? `R$ ${Number(x.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                    <TableCell><Badge variant={x.status === "autorizada" ? "default" : "secondary"}>{x.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toast({ title: `XML ${x.numero || x.id} baixado` })} disabled={!x.xml_url}><Download className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
