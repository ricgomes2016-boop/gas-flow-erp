import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Produto {
  id: string;
  nome: string;
  tipo_botijao: string | null;
  estoque: number;
  preco: number;
  categoria: string | null;
  botijao_par_id: string | null;
}

interface VendaDia {
  produto_id: string | null;
  quantidade: number;
}

interface EstoqueDiaTableProps {
  produtos: Produto[];
  vendasDia: VendaDia[];
  isLoading: boolean;
}

interface ProdutoAgrupado {
  nome: string;
  cheio: { estoque: number; id: string } | null;
  vazio: { estoque: number; id: string } | null;
  unico: { estoque: number; id: string } | null;
  vendasCheio: number;
  vendasVazio: number;
  vendasUnico: number;
}

export function EstoqueDiaTable({ produtos, vendasDia, isLoading }: EstoqueDiaTableProps) {
  const hoje = new Date();

  const vendasMap = useMemo(() => {
    const map: Record<string, number> = {};
    vendasDia.forEach((v) => {
      if (v.produto_id) {
        map[v.produto_id] = (map[v.produto_id] || 0) + v.quantidade;
      }
    });
    return map;
  }, [vendasDia]);

  const produtosAgrupados = useMemo(() => {
    const grupoMap: Record<string, ProdutoAgrupado> = {};

    produtos.forEach((p) => {
      // Normalize name: remove " (Vazio)" or " (Cheio)" suffixes
      const nomeBase = p.nome.replace(/\s*\(Vazio\)\s*/i, "").replace(/\s*\(Cheio\)\s*/i, "").trim();

      if (!grupoMap[nomeBase]) {
        grupoMap[nomeBase] = {
          nome: nomeBase,
          cheio: null,
          vazio: null,
          unico: null,
          vendasCheio: 0,
          vendasVazio: 0,
          vendasUnico: 0,
        };
      }

      const vendas = vendasMap[p.id] || 0;

      if (p.tipo_botijao === "cheio") {
        grupoMap[nomeBase].cheio = { estoque: p.estoque || 0, id: p.id };
        grupoMap[nomeBase].vendasCheio = vendas;
      } else if (p.tipo_botijao === "vazio") {
        grupoMap[nomeBase].vazio = { estoque: p.estoque || 0, id: p.id };
        grupoMap[nomeBase].vendasVazio = vendas;
      } else {
        grupoMap[nomeBase].unico = { estoque: p.estoque || 0, id: p.id };
        grupoMap[nomeBase].vendasUnico = vendas;
      }
    });

    return Object.values(grupoMap).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, vendasMap]);

  const dataFormatada = format(hoje, "dd/MM/yyyy", { locale: ptBR });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando estoque do dia...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">📦 Estoques do dia {dataFormatada}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {format(hoje, "HH:mm")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Informações referentes à data de {dataFormatada} 00:00 a {dataFormatada} 23:59
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold min-w-[180px]">Produto</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Tipo de Estoque</TableHead>
                <TableHead className="font-semibold text-center">Inicial</TableHead>
                <TableHead className="font-semibold text-center">Entradas</TableHead>
                <TableHead className="font-semibold text-center">Saídas</TableHead>
                <TableHead className="font-semibold text-center">Vendas</TableHead>
                <TableHead className="font-semibold text-center">Avarias (S)</TableHead>
                <TableHead className="font-semibold text-center">Avarias (E)</TableHead>
                <TableHead className="font-semibold text-center">Total</TableHead>
                <TableHead className="font-semibold text-center">Final</TableHead>
                <TableHead className="font-semibold text-right min-w-[140px]">Data Movimentação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosAgrupados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                produtosAgrupados.map((grupo) => {
                  const rows: React.ReactNode[] = [];

                  // Row for Cheio
                  if (grupo.cheio) {
                    const estoqueAtual = grupo.cheio.estoque;
                    const vendas = grupo.vendasCheio;
                    // Estoque inicial = atual + vendas (approximation)
                    const inicial = estoqueAtual + vendas;
                    const total = -vendas;

                    rows.push(
                      <TableRow key={`${grupo.nome}-cheio`} className="border-b-0">
                        <TableCell rowSpan={grupo.vazio ? 2 : 1} className="font-medium align-middle border-r">
                          {grupo.nome}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground">Estoque Cheio</span>
                        </TableCell>
                        <TableCell className="text-center font-bold">{inicial}</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">{vendas}</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">{total}</TableCell>
                        <TableCell rowSpan={grupo.vazio ? 2 : 1} className="text-center font-bold text-lg align-middle border-l">
                          {estoqueAtual + (grupo.vazio?.estoque || 0)}
                        </TableCell>
                        <TableCell rowSpan={grupo.vazio ? 2 : 1} className="text-right text-xs text-muted-foreground align-middle border-l">
                          {dataFormatada}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // Row for Vazio
                  if (grupo.vazio) {
                    const estoqueVazio = grupo.vazio.estoque;
                    const vendasVazio = grupo.vendasVazio;

                    rows.push(
                      <TableRow key={`${grupo.nome}-vazio`} className="bg-muted/20">
                        {!grupo.cheio && (
                          <TableCell rowSpan={1} className="font-medium align-middle border-r">
                            {grupo.nome}
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="text-muted-foreground">Estoque Vazio</span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{estoqueVazio}</TableCell>
                        <TableCell className="text-center text-muted-foreground">0</TableCell>
                        <TableCell className="text-center text-muted-foreground">0</TableCell>
                        <TableCell className="text-center text-muted-foreground">{vendasVazio}</TableCell>
                        <TableCell className="text-center text-muted-foreground">0</TableCell>
                        <TableCell className="text-center text-muted-foreground">0</TableCell>
                        <TableCell className="text-center text-muted-foreground">{estoqueVazio}</TableCell>
                        {!grupo.cheio && (
                          <>
                            <TableCell className="text-center font-bold text-lg align-middle border-l">
                              {estoqueVazio}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground align-middle border-l">
                              {dataFormatada}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  }

                  // Row for Único (sem cheio/vazio)
                  if (grupo.unico && !grupo.cheio && !grupo.vazio) {
                    const estoqueAtual = grupo.unico.estoque;
                    const vendas = grupo.vendasUnico;
                    const inicial = estoqueAtual + vendas;

                    rows.push(
                      <TableRow key={`${grupo.nome}-unico`}>
                        <TableCell className="font-medium border-r">{grupo.nome}</TableCell>
                        <TableCell>
                          <span className="text-foreground">Estoque Único</span>
                        </TableCell>
                        <TableCell className="text-center font-bold">{inicial}</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">{vendas}</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">0</TableCell>
                        <TableCell className="text-center font-bold">{-vendas}</TableCell>
                        <TableCell className="text-center font-bold text-lg border-l">{estoqueAtual}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground border-l">{dataFormatada}</TableCell>
                      </TableRow>
                    );
                  }

                  return rows;
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
