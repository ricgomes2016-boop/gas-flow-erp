import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gift, Users, Star, Trophy, Heart } from "lucide-react";

const programaFidelidade = [
  { id: 1, cliente: "João Silva", pontos: 450, nivel: "Ouro", indicacoes: 3 },
  { id: 2, cliente: "Maria Santos", pontos: 280, nivel: "Prata", indicacoes: 1 },
  { id: 3, cliente: "Pedro Costa", pontos: 120, nivel: "Bronze", indicacoes: 0 },
];

const niveis = [
  { nome: "Bronze", min: 0, max: 200, beneficio: "5% desconto" },
  { nome: "Prata", min: 201, max: 400, beneficio: "10% desconto" },
  { nome: "Ouro", min: 401, max: 600, beneficio: "15% desconto + entrega grátis" },
];

export default function Fidelidade() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Fidelidade / Indicações
            </h1>
            <p className="text-muted-foreground">
              Programa de fidelidade e indicações
            </p>
          </div>
          <Button>
            <Gift className="h-4 w-4 mr-2" />
            Configurar Programa
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">248</p>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12.450</p>
                  <p className="text-sm text-muted-foreground">Pontos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Heart className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Indicações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Trophy className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-sm text-muted-foreground">Clientes Ouro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Níveis */}
        <Card>
          <CardHeader>
            <CardTitle>Níveis do Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {niveis.map((nivel) => (
                <div
                  key={nivel.nome}
                  className="p-4 rounded-lg border text-center"
                >
                  <Badge
                    className={
                      nivel.nome === "Ouro"
                        ? "bg-yellow-500"
                        : nivel.nome === "Prata"
                        ? "bg-gray-400"
                        : "bg-amber-700"
                    }
                  >
                    {nivel.nome}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {nivel.min} - {nivel.max} pontos
                  </p>
                  <p className="font-medium mt-1">{nivel.beneficio}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes Fidelidade</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Indicações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programaFidelidade.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.cliente}</TableCell>
                    <TableCell>{cliente.pontos}</TableCell>
                    <TableCell className="w-32">
                      <Progress value={(cliente.pontos / 600) * 100} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          cliente.nivel === "Ouro"
                            ? "bg-yellow-500"
                            : cliente.nivel === "Prata"
                            ? "bg-gray-400"
                            : "bg-amber-700"
                        }
                      >
                        {cliente.nivel}
                      </Badge>
                    </TableCell>
                    <TableCell>{cliente.indicacoes}</TableCell>
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
