import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Plus, Trash2, Send, Printer, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cuponsEmitidos = [
  { id: "1", numero: "000.098.201", serie: "1", cliente: "Consumidor Final", cpf: "", valor: 95.00, status: "autorizada", data: "2026-02-18 14:32" },
  { id: "2", numero: "000.098.200", serie: "1", cliente: "Maria Silva", cpf: "123.456.789-00", valor: 190.00, status: "autorizada", data: "2026-02-18 13:15" },
  { id: "3", numero: "000.098.199", serie: "1", cliente: "Consumidor Final", cpf: "", valor: 350.00, status: "autorizada", data: "2026-02-18 11:45" },
  { id: "4", numero: "000.098.198", serie: "1", cliente: "João Pereira", cpf: "987.654.321-00", valor: 95.00, status: "cancelada", data: "2026-02-18 10:20" },
  { id: "5", numero: "000.098.197", serie: "1", cliente: "Consumidor Final", cpf: "", valor: 285.00, status: "autorizada", data: "2026-02-17 17:50" },
  { id: "6", numero: "000.098.196", serie: "1", cliente: "Ana Costa", cpf: "456.789.012-33", valor: 445.00, status: "autorizada", data: "2026-02-17 16:30" },
];

const itensPdv = [
  { id: "1", nome: "Gás GLP P13", un: "UN", qtd: 2, valor: 95.00 },
];

export default function EmitirNFCe() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"emitir" | "consultar">("consultar");

  const handleEmitir = () => {
    toast({ title: "NFC-e emitida com sucesso!", description: "Cupom fiscal nº 000.098.202 autorizado." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="h-6 w-6 text-primary" />
          Emitir NFC-e
        </h1>
        <div className="flex gap-2">
          <Button variant={tab === "consultar" ? "default" : "outline"} onClick={() => setTab("consultar")}>
            <Search className="h-4 w-4 mr-2" />Consultar
          </Button>
          <Button variant={tab === "emitir" ? "default" : "outline"} onClick={() => setTab("emitir")}>
            <Plus className="h-4 w-4 mr-2" />Nova NFC-e
          </Button>
        </div>
      </div>

      {tab === "consultar" ? (
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
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuponsEmitidos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.numero}</TableCell>
                    <TableCell>{c.data}</TableCell>
                    <TableCell className="font-medium">{c.cliente}</TableCell>
                    <TableCell className="font-mono text-sm">{c.cpf || "—"}</TableCell>
                    <TableCell className="text-right font-semibold">R$ {c.valor.toFixed(2)}</TableCell>
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
      ) : (
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
                    {itensPdv.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.un}</TableCell>
                        <TableCell className="text-right">{item.qtd}</TableCell>
                        <TableCell className="text-right">R$ {item.valor.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">R$ {(item.qtd * item.valor).toFixed(2)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
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
                    <span>R$ 190,00</span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleEmitir}><Send className="h-4 w-4 mr-2" />Emitir NFC-e</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
