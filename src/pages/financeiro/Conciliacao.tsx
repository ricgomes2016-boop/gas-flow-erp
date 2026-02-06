import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Link2 } from "lucide-react";

const extratoBancario = [
  { id: 1, data: "2024-01-16", descricao: "PIX RECEBIDO - JOAO SILVA", valor: 110.00, tipo: "credito", conciliado: true },
  { id: 2, data: "2024-01-16", descricao: "PIX RECEBIDO - MARIA SANTOS", valor: 180.00, tipo: "credito", conciliado: true },
  { id: 3, data: "2024-01-16", descricao: "PAGTO BOLETO - DISTRIBUIDORA ABC", valor: -5200.00, tipo: "debito", conciliado: true },
  { id: 4, data: "2024-01-15", descricao: "TED RECEBIDA - EMPRESA XYZ", valor: 3500.00, tipo: "credito", conciliado: false },
  { id: 5, data: "2024-01-15", descricao: "TARIFA BANCARIA", valor: -45.00, tipo: "debito", conciliado: false },
];

export default function Conciliacao() {
  const conciliados = extratoBancario.filter(e => e.conciliado).length;
  const pendentes = extratoBancario.filter(e => !e.conciliado).length;

  return (
    <MainLayout>
      <Header title="Conciliação Bancária" subtitle="Importe e concilie extratos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conciliação Bancária</h1>
            <p className="text-muted-foreground">Importe e concilie extratos OFX/CSV</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar OFX
            </Button>
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lançamentos</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{extratoBancario.length}</div>
              <p className="text-xs text-muted-foreground">Total importados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conciliados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{conciliados}</div>
              <p className="text-xs text-muted-foreground">{Math.round(conciliados/extratoBancario.length*100)}% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
              <p className="text-xs text-muted-foreground">Aguardando vínculo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Extrato</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ 45.680</div>
              <p className="text-xs text-muted-foreground">Confere com sistema</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Extrato Importado</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extratoBancario.map((lancamento) => (
                  <TableRow key={lancamento.id}>
                    <TableCell>{new Date(lancamento.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                    <TableCell>
                      <Badge variant={lancamento.tipo === "credito" ? "default" : "secondary"}>
                        {lancamento.tipo === "credito" ? "Crédito" : "Débito"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-medium ${lancamento.valor > 0 ? "text-green-600" : "text-red-600"}`}>
                      R$ {Math.abs(lancamento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lancamento.conciliado ? "default" : "secondary"}>
                        {lancamento.conciliado ? "Conciliado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!lancamento.conciliado && (
                        <Button size="sm" className="gap-1">
                          <Link2 className="h-3 w-3" />
                          Vincular
                        </Button>
                      )}
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
