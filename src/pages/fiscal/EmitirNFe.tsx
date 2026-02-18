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
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Plus, Trash2, Send, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const notasEmitidas = [
  { id: "1", numero: "000.124.587", serie: "1", destinatario: "Distribuidora Central Gás Ltda", cnpj: "12.345.678/0001-90", valor: 4850.00, status: "autorizada", data: "2026-02-18", chave: "35260212345678000190550010001245871234567890" },
  { id: "2", numero: "000.124.586", serie: "1", destinatario: "Comercial Fogão & Cia", cnpj: "98.765.432/0001-10", valor: 2300.00, status: "autorizada", data: "2026-02-17", chave: "35260298765432000110550010001245861234567891" },
  { id: "3", numero: "000.124.585", serie: "1", destinatario: "Supermercado Bom Preço", cnpj: "11.222.333/0001-44", valor: 7200.00, status: "cancelada", data: "2026-02-16", chave: "35260211222333000144550010001245851234567892" },
  { id: "4", numero: "000.124.584", serie: "1", destinatario: "Posto Estrela Azul", cnpj: "55.666.777/0001-88", valor: 1580.00, status: "denegada", data: "2026-02-15", chave: "35260255666777000188550010001245841234567893" },
  { id: "5", numero: "000.124.583", serie: "1", destinatario: "Padaria Pão Quente", cnpj: "33.444.555/0001-22", valor: 960.00, status: "autorizada", data: "2026-02-14", chave: "35260233444555000122550010001245831234567894" },
];

const produtosMock = [
  { id: "1", nome: "Gás GLP P13", ncm: "2711.19.10", cfop: "5102", un: "UN", qtd: 50, valor: 95.00 },
  { id: "2", nome: "Gás GLP P45", ncm: "2711.19.10", cfop: "5102", un: "UN", qtd: 10, valor: 350.00 },
];

export default function EmitirNFe() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"emitir" | "consultar">("consultar");
  const [itens, setItens] = useState(produtosMock);

  const statusColor = (s: string) => {
    if (s === "autorizada") return "default";
    if (s === "cancelada") return "destructive";
    return "secondary";
  };

  const handleEmitir = () => {
    toast({ title: "NF-e enviada para SEFAZ", description: "Aguardando autorização..." });
  };

  return (
    <MainLayout>
      <Header title="Emitir NF-e" subtitle="Gestão Fiscal" />
      <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          Emitir NF-e
        </h1>
        <div className="flex gap-2">
          <Button variant={tab === "consultar" ? "default" : "outline"} onClick={() => setTab("consultar")}>
            <Search className="h-4 w-4 mr-2" />Consultar
          </Button>
          <Button variant={tab === "emitir" ? "default" : "outline"} onClick={() => setTab("emitir")}>
            <Plus className="h-4 w-4 mr-2" />Nova NF-e
          </Button>
        </div>
      </div>

      {tab === "consultar" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas Fiscais Eletrônicas Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <Input placeholder="Buscar por destinatário ou número..." className="max-w-sm" />
              <Select defaultValue="todas">
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="autorizada">Autorizadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                  <SelectItem value="denegada">Denegadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasEmitidas.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-sm">{n.numero}</TableCell>
                    <TableCell>{new Date(n.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">{n.destinatario}</TableCell>
                    <TableCell className="font-mono text-sm">{n.cnpj}</TableCell>
                    <TableCell className="text-right font-semibold">R$ {n.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell><Badge variant={statusColor(n.status)}>{n.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Ver XML"><FileText className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Dados do Destinatário</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>CNPJ / CPF</Label><Input defaultValue="12.345.678/0001-90" /></div>
              <div className="md:col-span-2"><Label>Razão Social</Label><Input defaultValue="Distribuidora Central Gás Ltda" /></div>
              <div className="md:col-span-2"><Label>Endereço</Label><Input defaultValue="Rua das Indústrias, 450 - Distrito Industrial" /></div>
              <div><Label>Cidade / UF</Label><Input defaultValue="São Paulo / SP" /></div>
              <div><Label>Inscrição Estadual</Label><Input defaultValue="123.456.789.000" /></div>
              <div><Label>CEP</Label><Input defaultValue="01234-567" /></div>
              <div><Label>Telefone</Label><Input defaultValue="(11) 3456-7890" /></div>
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
                  {itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="font-mono text-sm">{item.ncm}</TableCell>
                      <TableCell className="font-mono text-sm">{item.cfop}</TableCell>
                      <TableCell>{item.un}</TableCell>
                      <TableCell className="text-right">{item.qtd}</TableCell>
                      <TableCell className="text-right">R$ {item.valor.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">R$ {(item.qtd * item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4 text-lg font-bold">
                Total: R$ {itens.reduce((s, i) => s + i.qtd * i.valor, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
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
              <div className="md:col-span-2"><Label>Observações</Label><Textarea defaultValue="Venda de GLP conforme pedido nº 12345." /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Salvar Rascunho</Button>
            <Button onClick={handleEmitir}><Send className="h-4 w-4 mr-2" />Transmitir para SEFAZ</Button>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}
