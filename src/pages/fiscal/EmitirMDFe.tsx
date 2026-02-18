import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Plus, Send, Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const manifestos = [
  { id: "1", numero: "000.005.412", serie: "1", ufOrigem: "SP", ufDestino: "RJ", motorista: "Carlos Silva", placa: "ABC-1D23", nfes: 5, peso: 2500, status: "autorizado", data: "2026-02-18" },
  { id: "2", numero: "000.005.411", serie: "1", ufOrigem: "SP", ufDestino: "MG", motorista: "José Santos", placa: "DEF-4G56", nfes: 8, peso: 4200, status: "encerrado", data: "2026-02-17" },
  { id: "3", numero: "000.005.410", serie: "1", ufOrigem: "SP", ufDestino: "PR", motorista: "Pedro Oliveira", placa: "GHI-7J89", nfes: 3, peso: 1800, status: "autorizado", data: "2026-02-16" },
  { id: "4", numero: "000.005.409", serie: "1", ufOrigem: "SP", ufDestino: "SC", motorista: "Marcos Lima", placa: "JKL-0M12", nfes: 6, peso: 3100, status: "cancelado", data: "2026-02-15" },
];

export default function EmitirMDFe() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"emitir" | "consultar">("consultar");

  const statusColor = (s: string) => {
    if (s === "autorizado") return "default" as const;
    if (s === "encerrado") return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <MainLayout>
      <Header title="Emitir MDF-e" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Emitir MDF-e
        </h1>
        <div className="flex gap-2">
          <Button variant={tab === "consultar" ? "default" : "outline"} onClick={() => setTab("consultar")}>
            <Search className="h-4 w-4 mr-2" />Consultar
          </Button>
          <Button variant={tab === "emitir" ? "default" : "outline"} onClick={() => setTab("emitir")}>
            <Plus className="h-4 w-4 mr-2" />Novo MDF-e
          </Button>
        </div>
      </div>

      {tab === "consultar" ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">Manifestos Eletrônicos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead className="text-right">NF-es</TableHead>
                  <TableHead className="text-right">Peso (kg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manifestos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm">{m.numero}</TableCell>
                    <TableCell>{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.ufOrigem} → {m.ufDestino}</TableCell>
                    <TableCell className="font-medium">{m.motorista}</TableCell>
                    <TableCell className="font-mono">{m.placa}</TableCell>
                    <TableCell className="text-right">{m.nfes}</TableCell>
                    <TableCell className="text-right">{m.peso.toLocaleString("pt-BR")}</TableCell>
                    <TableCell><Badge variant={statusColor(m.status)}>{m.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Dados do Manifesto</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>UF Carregamento</Label>
                <Select defaultValue="SP"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="SP">SP - São Paulo</SelectItem><SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem><SelectItem value="MG">MG - Minas Gerais</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>UF Descarregamento</Label>
                <Select defaultValue="RJ"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="SP">SP - São Paulo</SelectItem><SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem><SelectItem value="MG">MG - Minas Gerais</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Data de Viagem</Label><Input type="date" defaultValue="2026-02-18" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Veículo e Motorista</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><Label>Placa</Label><Input defaultValue="ABC-1D23" /></div>
              <div><Label>RNTRC</Label><Input defaultValue="12345678" /></div>
              <div><Label>Motorista</Label><Input defaultValue="Carlos Silva" /></div>
              <div><Label>CPF do Motorista</Label><Input defaultValue="123.456.789-00" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">NF-es Vinculadas</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Vincular NF-e</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Chave de Acesso</TableHead><TableHead>Destinatário</TableHead><TableHead className="text-right">Valor</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">3526021234567800019055001000124587...</TableCell>
                    <TableCell>Distribuidora Central Gás Ltda</TableCell>
                    <TableCell className="text-right font-semibold">R$ 4.850,00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">3526029876543200011055001000124586...</TableCell>
                    <TableCell>Comercial Fogão & Cia</TableCell>
                    <TableCell className="text-right font-semibold">R$ 2.300,00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button variant="outline">Salvar Rascunho</Button>
            <Button onClick={() => toast({ title: "MDF-e transmitido", description: "Manifesto enviado para SEFAZ." })}><Send className="h-4 w-4 mr-2" />Transmitir MDF-e</Button>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}
