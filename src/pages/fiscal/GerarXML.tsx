import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Download, FileText, Archive, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const xmlsDisponiveis = [
  { id: "1", tipo: "NF-e", numero: "000.124.587", chave: "35260212345678000190550010001245871234567890", destinatario: "Distribuidora Central Gás Ltda", valor: 4850.00, data: "2026-02-18", tamanho: "12 KB" },
  { id: "2", tipo: "NF-e", numero: "000.124.586", chave: "35260298765432000110550010001245861234567891", destinatario: "Comercial Fogão & Cia", valor: 2300.00, data: "2026-02-17", tamanho: "11 KB" },
  { id: "3", tipo: "NFC-e", numero: "000.098.201", chave: "35260212345678000190650010000982011234567895", destinatario: "Consumidor Final", valor: 95.00, data: "2026-02-18", tamanho: "8 KB" },
  { id: "4", tipo: "CT-e", numero: "000.012.450", chave: "35260212345678000190570010000124501234567896", destinatario: "Distribuidora Central Gás Ltda", valor: 1250.00, data: "2026-02-18", tamanho: "14 KB" },
  { id: "5", tipo: "MDF-e", numero: "000.005.412", chave: "35260212345678000190580010000054121234567897", destinatario: "—", valor: 0, data: "2026-02-18", tamanho: "18 KB" },
  { id: "6", tipo: "NF-e", numero: "000.124.585", chave: "35260211222333000144550010001245851234567892", destinatario: "Supermercado Bom Preço", valor: 7200.00, data: "2026-02-16", tamanho: "13 KB" },
  { id: "7", tipo: "NFC-e", numero: "000.098.200", chave: "35260212345678000190650010000982001234567898", destinatario: "Maria Silva", valor: 190.00, data: "2026-02-18", tamanho: "9 KB" },
];

export default function GerarXML() {
  const { toast } = useToast();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");

  const toggle = (id: string) => {
    setSelecionados((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const filtered = filtrados.map((x) => x.id);
    setSelecionados((prev) => prev.length === filtered.length ? [] : filtered);
  };

  const filtrados = tipoFiltro === "todos" ? xmlsDisponiveis : xmlsDisponiveis.filter((x) => x.tipo === tipoFiltro);

  const tipoColor = (t: string) => {
    if (t === "NF-e") return "default" as const;
    if (t === "NFC-e") return "secondary" as const;
    if (t === "CT-e") return "outline" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          Gerar XML
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled={selecionados.length === 0} onClick={() => toast({ title: `${selecionados.length} XML(s) baixado(s)` })}>
            <Download className="h-4 w-4 mr-2" />Baixar Selecionados ({selecionados.length})
          </Button>
          <Button disabled={selecionados.length === 0} onClick={() => toast({ title: "Lote ZIP gerado", description: `${selecionados.length} arquivos compactados.` })}>
            <Archive className="h-4 w-4 mr-2" />Gerar Lote ZIP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold">{xmlsDisponiveis.filter((x) => x.tipo === "NF-e").length}</p>
          <p className="text-sm text-muted-foreground">NF-e</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold">{xmlsDisponiveis.filter((x) => x.tipo === "NFC-e").length}</p>
          <p className="text-sm text-muted-foreground">NFC-e</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold">{xmlsDisponiveis.filter((x) => x.tipo === "CT-e").length}</p>
          <p className="text-sm text-muted-foreground">CT-e</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold">{xmlsDisponiveis.filter((x) => x.tipo === "MDF-e").length}</p>
          <p className="text-sm text-muted-foreground">MDF-e</p>
        </Card>
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
                <SelectItem value="NF-e">NF-e</SelectItem>
                <SelectItem value="NFC-e">NFC-e</SelectItem>
                <SelectItem value="CT-e">CT-e</SelectItem>
                <SelectItem value="MDF-e">MDF-e</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="w-[160px]" defaultValue="2026-02-01" />
            <Input type="date" className="w-[160px]" defaultValue="2026-02-18" />
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
                <TableHead>Tamanho</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((x) => (
                <TableRow key={x.id}>
                  <TableCell><Checkbox checked={selecionados.includes(x.id)} onCheckedChange={() => toggle(x.id)} /></TableCell>
                  <TableCell><Badge variant={tipoColor(x.tipo)}>{x.tipo}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{x.numero}</TableCell>
                  <TableCell>{new Date(x.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{x.destinatario}</TableCell>
                  <TableCell className="text-right">{x.valor > 0 ? `R$ ${x.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{x.tamanho}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => toast({ title: `XML ${x.numero} baixado` })}><Download className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
