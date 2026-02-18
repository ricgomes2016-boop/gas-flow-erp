import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Route, Plus, Send, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ctes = [
  { id: "1", numero: "000.012.450", serie: "1", remetente: "Nacional Gás Distribuidora", destinatario: "Distribuidora Central Gás Ltda", ufOrig: "SP", ufDest: "RJ", valorFrete: 1250.00, pesoKg: 2500, status: "autorizado", data: "2026-02-18" },
  { id: "2", numero: "000.012.449", serie: "1", remetente: "Nacional Gás Distribuidora", destinatario: "Comercial Fogão & Cia", ufOrig: "SP", ufDest: "MG", valorFrete: 890.00, pesoKg: 1800, status: "autorizado", data: "2026-02-17" },
  { id: "3", numero: "000.012.448", serie: "1", remetente: "Nacional Gás Distribuidora", destinatario: "Supermercado Bom Preço", ufOrig: "SP", ufDest: "PR", valorFrete: 1580.00, pesoKg: 3200, status: "cancelado", data: "2026-02-16" },
  { id: "4", numero: "000.012.447", serie: "1", remetente: "Nacional Gás Distribuidora", destinatario: "Posto Estrela Azul", ufOrig: "SP", ufDest: "SP", valorFrete: 450.00, pesoKg: 900, status: "autorizado", data: "2026-02-15" },
];

export default function EmitirCTe() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"emitir" | "consultar">("consultar");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          Emitir CT-e
        </h1>
        <div className="flex gap-2">
          <Button variant={tab === "consultar" ? "default" : "outline"} onClick={() => setTab("consultar")}>
            <Search className="h-4 w-4 mr-2" />Consultar
          </Button>
          <Button variant={tab === "emitir" ? "default" : "outline"} onClick={() => setTab("emitir")}>
            <Plus className="h-4 w-4 mr-2" />Novo CT-e
          </Button>
        </div>
      </div>

      {tab === "consultar" ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">Conhecimentos de Transporte Emitidos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead className="text-right">Peso (kg)</TableHead>
                  <TableHead className="text-right">Valor Frete</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ctes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.numero}</TableCell>
                    <TableCell>{new Date(c.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{c.remetente}</TableCell>
                    <TableCell className="font-medium">{c.destinatario}</TableCell>
                    <TableCell>{c.ufOrig} → {c.ufDest}</TableCell>
                    <TableCell className="text-right">{c.pesoKg.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-right font-semibold">R$ {c.valorFrete.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell><Badge variant={c.status === "autorizado" ? "default" : "destructive"}>{c.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Remetente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>CNPJ</Label><Input defaultValue="11.222.333/0001-44" /></div>
                <div><Label>Razão Social</Label><Input defaultValue="Nacional Gás Distribuidora Ltda" /></div>
                <div><Label>Endereço</Label><Input defaultValue="Av. Paulista, 1000 - São Paulo/SP" /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Destinatário</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
                <div><Label>Razão Social</Label><Input defaultValue="Distribuidora Central Gás Ltda" /></div>
                <div><Label>Endereço</Label><Input defaultValue="Rua das Indústrias, 450 - Rio de Janeiro/RJ" /></div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-lg">Dados do Transporte</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><Label>Modal</Label>
                <Select defaultValue="rodoviario"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="rodoviario">Rodoviário</SelectItem><SelectItem value="aereo">Aéreo</SelectItem><SelectItem value="aquaviario">Aquaviário</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Peso Bruto (kg)</Label><Input type="number" defaultValue="2500" /></div>
              <div><Label>Valor da Mercadoria</Label><Input defaultValue="4850.00" /></div>
              <div><Label>Valor do Frete</Label><Input defaultValue="1250.00" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Observações</CardTitle></CardHeader>
            <CardContent>
              <Textarea defaultValue="Transporte de GLP conforme contrato nº 2026-001." />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline">Salvar Rascunho</Button>
            <Button onClick={() => toast({ title: "CT-e transmitido", description: "Conhecimento de transporte enviado para SEFAZ." })}><Send className="h-4 w-4 mr-2" />Transmitir CT-e</Button>
          </div>
        </div>
      )}
    </div>
  );
}
