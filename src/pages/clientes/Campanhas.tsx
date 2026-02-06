import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Megaphone, Plus, Users, Send, Calendar, Eye } from "lucide-react";

const campanhas = [
  {
    id: 1,
    nome: "Promoção de Verão",
    tipo: "WhatsApp",
    alcance: 450,
    enviados: 420,
    status: "ativa",
    data: "01/02/2026",
  },
  {
    id: 2,
    nome: "Clientes Inativos",
    tipo: "SMS",
    alcance: 120,
    enviados: 120,
    status: "concluida",
    data: "28/01/2026",
  },
  {
    id: 3,
    nome: "Fidelidade - Bônus",
    tipo: "WhatsApp",
    alcance: 80,
    enviados: 0,
    status: "rascunho",
    data: "-",
  },
];

export default function Campanhas() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campanhas</h1>
            <p className="text-muted-foreground">
              Gerenciar campanhas de marketing
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Campanhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">650</p>
                  <p className="text-sm text-muted-foreground">Alcance Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Send className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">540</p>
                  <p className="text-sm text-muted-foreground">Mensagens Enviadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Ativas Agora</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Alcance</TableHead>
                  <TableHead>Enviados</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campanhas.map((campanha) => (
                  <TableRow key={campanha.id}>
                    <TableCell className="font-medium">{campanha.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campanha.tipo}</Badge>
                    </TableCell>
                    <TableCell>{campanha.alcance}</TableCell>
                    <TableCell>{campanha.enviados}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          campanha.status === "ativa"
                            ? "default"
                            : campanha.status === "concluida"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {campanha.status === "ativa"
                          ? "Ativa"
                          : campanha.status === "concluida"
                          ? "Concluída"
                          : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {campanha.data}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
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
