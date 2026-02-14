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

interface MovimentacaoPorProduto {
  vendas: number;
  compras: number;
  entradas_manuais: number;
  saidas_manuais: number;
  avarias: number;
}

interface EstoqueDiaTableProps {
  produtos: Produto[];
  movimentacoes: Record<string, MovimentacaoPorProduto>;
  dataInicio: Date;
  dataFim: Date;
  isLoading: boolean;
}

interface LinhaEstoque {
  nome: string;
  tipoEstoque: string;
  estoqueAtual: number;
  vendas: number;
  compras: number;
  entradasManuais: number;
  saidasManuais: number;
  avarias: number;
  inicial: number;
  total: number;
}

function calcularLinha(
  produto: Produto,
  mov: MovimentacaoPorProduto,
  tipoBotijao: string | null
): LinhaEstoque {
  const nomeBase = produto.nome
    .replace(/\s*\(Vazio\)\s*/i, "")
    .replace(/\s*\(Cheio\)\s*/i, "")
    .trim();

  const estoqueAtual = produto.estoque || 0;
  const { vendas, compras, entradas_manuais, saidas_manuais, avarias } = mov;

  let entradas = 0;
  let saidas = 0;

  if (tipoBotijao === "cheio") {
    // Cheio: compras/entradas manuais somam, vendas/saídas manuais subtraem
    entradas = compras + entradas_manuais;
    saidas = saidas_manuais;
    // Inicial = atual - entradas + saídas + vendas + avarias
    const inicial = estoqueAtual - entradas + saidas + vendas + avarias;
    const total = inicial + entradas - saidas - vendas - avarias;
    return {
      nome: nomeBase,
      tipoEstoque: "Cheio",
      estoqueAtual,
      vendas,
      compras,
      entradasManuais: entradas_manuais,
      saidasManuais: saidas_manuais,
      avarias,
      inicial,
      total,
    };
  } else if (tipoBotijao === "vazio") {
    // Vazio: inverso - compras diminuem vazio, vendas/saídas aumentam vazio
    entradas = saidas_manuais + vendas; // o que entra no vazio
    saidas = compras + entradas_manuais; // o que sai do vazio (troca por cheio)
    const inicial = estoqueAtual - entradas + saidas;
    const total = inicial + entradas - saidas;
    return {
      nome: nomeBase,
      tipoEstoque: "Vazio",
      estoqueAtual,
      vendas: 0,
      compras: 0,
      entradasManuais: entradas, // entradas no vazio
      saidasManuais: saidas, // saídas do vazio
      avarias,
      inicial,
      total,
    };
  } else {
    // Produto único (não botijão)
    entradas = compras + entradas_manuais;
    saidas = saidas_manuais;
    const inicial = estoqueAtual - entradas + saidas + vendas + avarias;
    const total = inicial + entradas - saidas - vendas - avarias;
    return {
      nome: nomeBase,
      tipoEstoque: "Único",
      estoqueAtual,
      vendas,
      compras,
      entradasManuais: entradas_manuais,
      saidasManuais: saidas_manuais,
      avarias,
      inicial,
      total,
    };
  }
}

export function EstoqueDiaTable({ produtos, movimentacoes, dataInicio, dataFim, isLoading }: EstoqueDiaTableProps) {
  const linhas = useMemo(() => {
    const resultado: LinhaEstoque[] = [];

    // Agrupar por nome base para manter cheio/vazio juntos
    const grupoMap: Record<string, { cheio?: Produto; vazio?: Produto; unico?: Produto }> = {};

    produtos.forEach((p) => {
      const nomeBase = p.nome.replace(/\s*\(Vazio\)\s*/i, "").replace(/\s*\(Cheio\)\s*/i, "").trim();
      if (!grupoMap[nomeBase]) grupoMap[nomeBase] = {};

      if (p.tipo_botijao === "cheio") grupoMap[nomeBase].cheio = p;
      else if (p.tipo_botijao === "vazio") grupoMap[nomeBase].vazio = p;
      else grupoMap[nomeBase].unico = p;
    });

    const emptyMov: MovimentacaoPorProduto = { vendas: 0, compras: 0, entradas_manuais: 0, saidas_manuais: 0, avarias: 0 };

    Object.entries(grupoMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([, grupo]) => {
        if (grupo.cheio) {
          const mov = movimentacoes[grupo.cheio.id] || emptyMov;
          resultado.push(calcularLinha(grupo.cheio, mov, "cheio"));
        }
        if (grupo.vazio) {
          // Para vazio, usamos movimentações do PAR cheio (pois vendas/compras são no cheio)
          const parCheioId = grupo.cheio?.id;
          const movCheio = parCheioId ? (movimentacoes[parCheioId] || emptyMov) : emptyMov;
          const movVazio = movimentacoes[grupo.vazio.id] || emptyMov;
          // Combinar: vendas do cheio viram entradas no vazio
          const movCombinado: MovimentacaoPorProduto = {
            vendas: movCheio.vendas,
            compras: movCheio.compras,
            entradas_manuais: movCheio.entradas_manuais,
            saidas_manuais: movCheio.saidas_manuais,
            avarias: movVazio.avarias,
          };
          resultado.push(calcularLinha(grupo.vazio, movCombinado, "vazio"));
        }
        if (grupo.unico && !grupo.cheio && !grupo.vazio) {
          const mov = movimentacoes[grupo.unico.id] || emptyMov;
          resultado.push(calcularLinha(grupo.unico, mov, null));
        }
      });

    return resultado;
  }, [produtos, movimentacoes]);

  const dataInicioFmt = format(dataInicio, "dd/MM/yyyy", { locale: ptBR });
  const dataFimFmt = format(dataFim, "dd/MM/yyyy", { locale: ptBR });

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
          <CardTitle className="text-lg">📦 Estoque do Período</CardTitle>
          <Badge variant="outline" className="text-xs">
            {dataInicioFmt} — {dataFimFmt}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Total = Inicial + Entradas − Saídas − Vendas − Avarias
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold min-w-[160px]">Produto</TableHead>
                <TableHead className="font-semibold min-w-[100px]">Tipo</TableHead>
                <TableHead className="font-semibold text-center">Inicial</TableHead>
                <TableHead className="font-semibold text-center">Entradas</TableHead>
                <TableHead className="font-semibold text-center">Saídas</TableHead>
                <TableHead className="font-semibold text-center">Vendas</TableHead>
                <TableHead className="font-semibold text-center">Avarias</TableHead>
                <TableHead className="font-semibold text-center">Total</TableHead>
                <TableHead className="font-semibold text-center">Estoque Atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                linhas.map((linha, idx) => {
                  const isCheio = linha.tipoEstoque === "Cheio";
                  const isVazio = linha.tipoEstoque === "Vazio";

                  return (
                    <TableRow
                      key={`${linha.nome}-${linha.tipoEstoque}-${idx}`}
                      className={isVazio ? "bg-muted/20" : ""}
                    >
                      <TableCell className="font-medium">{linha.nome}</TableCell>
                      <TableCell>
                        <Badge variant={isCheio ? "default" : isVazio ? "secondary" : "outline"} className="text-xs">
                          {linha.tipoEstoque}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">{linha.inicial}</TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        {linha.entradasManuais > 0 ? `+${linha.entradasManuais}` : "0"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-orange-600">
                        {linha.saidasManuais > 0 ? `-${linha.saidasManuais}` : "0"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-blue-600">
                        {isVazio ? "—" : (linha.vendas > 0 ? `-${linha.vendas}` : "0")}
                      </TableCell>
                      <TableCell className="text-center font-bold text-destructive">
                        {linha.avarias > 0 ? `-${linha.avarias}` : "0"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-lg">{linha.total}</TableCell>
                      <TableCell className="text-center font-bold text-lg border-l">{linha.estoqueAtual}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
