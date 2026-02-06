import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Download,
  FileText,
  TrendingUp,
  Wallet,
  Users,
  BarChart3,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  File,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";

// Dados mock para o relatório
const parceiros = [
  { id: 1, nome: "Supermercado Central", tipo: "Consignado" },
  { id: 2, nome: "Loja de Conveniência Boa Vista", tipo: "Consignado" },
  { id: 3, nome: "Mercado São Paulo", tipo: "Consignado" },
  { id: 4, nome: "Padaria Pão Quente", tipo: "Consignado" },
];

const statusOptions = [
  { value: "todos", label: "Todos os Status" },
  { value: "disponivel", label: "Disponível" },
  { value: "vendido", label: "Vendido" },
  { value: "utilizado", label: "Utilizado" },
  { value: "cancelado", label: "Cancelado" },
];

const periodoPresets = [
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Este mês", days: 0, preset: "thisMonth" },
  { label: "Mês anterior", days: 0, preset: "lastMonth" },
  { label: "Últimos 3 meses", days: 90 },
];

// Dados mock para gráficos
const dadosMensais = [
  { mes: "Set", emitidos: 45, vendidos: 38, utilizados: 32, valor: 4560 },
  { mes: "Out", emitidos: 52, vendidos: 48, utilizados: 41, valor: 5280 },
  { mes: "Nov", emitidos: 60, vendidos: 55, utilizados: 48, valor: 6300 },
  { mes: "Dez", emitidos: 75, vendidos: 68, utilizados: 62, valor: 7875 },
  { mes: "Jan", emitidos: 65, vendidos: 58, utilizados: 52, valor: 6825 },
  { mes: "Fev", emitidos: 48, vendidos: 42, utilizados: 35, valor: 5040 },
];

const dadosPorParceiro = [
  { nome: "Supermercado Central", quantidade: 85, valor: 8925, percentual: 35 },
  { nome: "Loja Boa Vista", quantidade: 62, valor: 6510, percentual: 26 },
  { nome: "Mercado São Paulo", quantidade: 48, valor: 5040, percentual: 20 },
  { nome: "Padaria Pão Quente", quantidade: 45, valor: 4725, percentual: 19 },
];

const dadosPorStatus = [
  { name: "Disponível", value: 42, color: "#3b82f6" },
  { name: "Vendido", value: 68, color: "#f59e0b" },
  { name: "Utilizado", value: 125, color: "#22c55e" },
  { name: "Cancelado", value: 5, color: "#ef4444" },
];

// Dados mock para tabela detalhada
const valesDetalhados = [
  {
    id: 1,
    numero: "VG-2024-000125",
    parceiro: "Supermercado Central",
    dataEmissao: "2024-01-15",
    dataVenda: "2024-01-18",
    dataUtilizacao: "2024-01-22",
    status: "Utilizado",
    valor: 105.0,
    consumidor: "Maria Silva",
  },
  {
    id: 2,
    numero: "VG-2024-000126",
    parceiro: "Loja de Conveniência Boa Vista",
    dataEmissao: "2024-01-16",
    dataVenda: "2024-01-20",
    dataUtilizacao: null,
    status: "Vendido",
    valor: 105.0,
    consumidor: "João Souza",
  },
  {
    id: 3,
    numero: "VG-2024-000127",
    parceiro: "Mercado São Paulo",
    dataEmissao: "2024-01-17",
    dataVenda: null,
    dataUtilizacao: null,
    status: "Disponível",
    valor: 105.0,
    consumidor: null,
  },
  {
    id: 4,
    numero: "VG-2024-000128",
    parceiro: "Supermercado Central",
    dataEmissao: "2024-01-18",
    dataVenda: "2024-01-19",
    dataUtilizacao: "2024-01-25",
    status: "Utilizado",
    valor: 105.0,
    consumidor: "Ana Costa",
  },
  {
    id: 5,
    numero: "VG-2024-000129",
    parceiro: "Padaria Pão Quente",
    dataEmissao: "2024-01-19",
    dataVenda: null,
    dataUtilizacao: null,
    status: "Cancelado",
    valor: 105.0,
    consumidor: null,
  },
];

export default function ValeGasRelatorio() {
  const { toast } = useToast();
  const [dataInicio, setDataInicio] = useState<Date>(subDays(new Date(), 30));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [parceiroSelecionado, setParceiroSelecionado] = useState("todos");
  const [statusSelecionado, setStatusSelecionado] = useState("todos");

  const aplicarPreset = (preset: (typeof periodoPresets)[0]) => {
    const hoje = new Date();
    if (preset.preset === "thisMonth") {
      setDataInicio(startOfMonth(hoje));
      setDataFim(endOfMonth(hoje));
    } else if (preset.preset === "lastMonth") {
      const mesAnterior = subMonths(hoje, 1);
      setDataInicio(startOfMonth(mesAnterior));
      setDataFim(endOfMonth(mesAnterior));
    } else {
      setDataInicio(subDays(hoje, preset.days));
      setDataFim(hoje);
    }
  };

  const limparFiltros = () => {
    setDataInicio(subDays(new Date(), 30));
    setDataFim(new Date());
    setParceiroSelecionado("todos");
    setStatusSelecionado("todos");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Disponível: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Vendido: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      Utilizado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <Badge className={cn("font-medium", variants[status] || "")}>
        {status}
      </Badge>
    );
  };

  // Calcular totais
  const totalEmitidos = dadosMensais.reduce((acc, d) => acc + d.emitidos, 0);
  const totalVendidos = dadosMensais.reduce((acc, d) => acc + d.vendidos, 0);
  const totalUtilizados = dadosMensais.reduce((acc, d) => acc + d.utilizados, 0);
  const totalValor = dadosMensais.reduce((acc, d) => acc + d.valor, 0);
  const taxaConversao = ((totalUtilizados / totalEmitidos) * 100).toFixed(1);

  // Exportar para Excel
  const exportarExcel = () => {
    try {
      // Preparar dados para Excel
      const dadosVales = valesDetalhados.map((vale) => ({
        Número: vale.numero,
        Parceiro: vale.parceiro,
        "Data Emissão": vale.dataEmissao
          ? format(new Date(vale.dataEmissao), "dd/MM/yyyy", { locale: ptBR })
          : "-",
        "Data Venda": vale.dataVenda
          ? format(new Date(vale.dataVenda), "dd/MM/yyyy", { locale: ptBR })
          : "-",
        "Data Utilização": vale.dataUtilizacao
          ? format(new Date(vale.dataUtilizacao), "dd/MM/yyyy", { locale: ptBR })
          : "-",
        Consumidor: vale.consumidor || "-",
        Valor: `R$ ${vale.valor.toFixed(2)}`,
        Status: vale.status,
      }));

      const dadosResumo = [
        { Indicador: "Total Emitidos", Valor: totalEmitidos },
        { Indicador: "Total Vendidos", Valor: totalVendidos },
        { Indicador: "Total Utilizados", Valor: totalUtilizados },
        { Indicador: "Valor Total", Valor: `R$ ${totalValor.toLocaleString("pt-BR")}` },
        { Indicador: "Taxa de Conversão", Valor: `${taxaConversao}%` },
      ];

      const dadosParceiros = dadosPorParceiro.map((p) => ({
        Parceiro: p.nome,
        Quantidade: p.quantidade,
        Valor: `R$ ${p.valor.toLocaleString("pt-BR")}`,
        Percentual: `${p.percentual}%`,
      }));

      // Criar workbook com múltiplas abas
      const wb = XLSX.utils.book_new();

      const wsResumo = XLSX.utils.json_to_sheet(dadosResumo);
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

      const wsVales = XLSX.utils.json_to_sheet(dadosVales);
      XLSX.utils.book_append_sheet(wb, wsVales, "Detalhamento");

      const wsParceiros = XLSX.utils.json_to_sheet(dadosParceiros);
      XLSX.utils.book_append_sheet(wb, wsParceiros, "Por Parceiro");

      const wsMensal = XLSX.utils.json_to_sheet(
        dadosMensais.map((d) => ({
          Mês: d.mes,
          Emitidos: d.emitidos,
          Vendidos: d.vendidos,
          Utilizados: d.utilizados,
          Valor: `R$ ${d.valor.toLocaleString("pt-BR")}`,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsMensal, "Evolução Mensal");

      // Gerar arquivo
      const nomeArquivo = `relatorio-vale-gas-${format(dataInicio, "dd-MM-yyyy")}-a-${format(dataFim, "dd-MM-yyyy")}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      toast({
        title: "Excel exportado!",
        description: `Arquivo ${nomeArquivo} gerado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  // Exportar para PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Vale Gás", pageWidth / 2, 20, { align: "center" });

      // Período
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} a ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}`,
        pageWidth / 2,
        28,
        { align: "center" }
      );

      // Resumo
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Geral", 14, 40);

      autoTable(doc, {
        startY: 45,
        head: [["Indicador", "Valor"]],
        body: [
          ["Total Emitidos", String(totalEmitidos)],
          ["Total Vendidos", String(totalVendidos)],
          ["Total Utilizados", String(totalUtilizados)],
          ["Valor Total", `R$ ${totalValor.toLocaleString("pt-BR")}`],
          ["Taxa de Conversão", `${taxaConversao}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
      });

      // Desempenho por Parceiro
      const finalY1 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Desempenho por Parceiro", 14, finalY1 + 15);

      autoTable(doc, {
        startY: finalY1 + 20,
        head: [["Parceiro", "Quantidade", "Valor", "%"]],
        body: dadosPorParceiro.map((p) => [
          p.nome,
          String(p.quantidade),
          `R$ ${p.valor.toLocaleString("pt-BR")}`,
          `${p.percentual}%`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
      });

      // Nova página para detalhamento
      doc.addPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhamento de Vales", 14, 20);

      autoTable(doc, {
        startY: 25,
        head: [["Número", "Parceiro", "Emissão", "Venda", "Utilização", "Status", "Valor"]],
        body: valesDetalhados.map((vale) => [
          vale.numero,
          vale.parceiro.substring(0, 20),
          vale.dataEmissao
            ? format(new Date(vale.dataEmissao), "dd/MM/yy", { locale: ptBR })
            : "-",
          vale.dataVenda
            ? format(new Date(vale.dataVenda), "dd/MM/yy", { locale: ptBR })
            : "-",
          vale.dataUtilizacao
            ? format(new Date(vale.dataUtilizacao), "dd/MM/yy", { locale: ptBR })
            : "-",
          vale.status,
          `R$ ${vale.valor.toFixed(2)}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Salvar arquivo
      const nomeArquivo = `relatorio-vale-gas-${format(dataInicio, "dd-MM-yyyy")}-a-${format(dataFim, "dd-MM-yyyy")}.pdf`;
      doc.save(nomeArquivo);

      toast({
        title: "PDF exportado!",
        description: `Arquivo ${nomeArquivo} gerado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <Header title="Relatório de Vale Gás" subtitle="Análise gerencial de emissão, vendas e utilização" />
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Relatório de Vale Gás
            </h1>
            <p className="text-muted-foreground">
              Análise gerencial de emissão, vendas e utilização de vales
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gradient-primary text-white">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportarExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Exportar para Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportarPDF}>
                <File className="h-4 w-4 mr-2 text-red-600" />
                Exportar para PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Presets de período */}
            <div className="flex flex-wrap gap-2">
              {periodoPresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => aplicarPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Data Início */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? (
                      format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Data início</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* Data Fim */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? (
                      format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Data fim</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => date && setDataFim(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* Parceiro */}
              <Select
                value={parceiroSelecionado}
                onValueChange={setParceiroSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os parceiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os parceiros</SelectItem>
                  {parceiros.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={statusSelecionado}
                onValueChange={setStatusSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Emitidos</p>
                  <p className="text-2xl font-bold">{totalEmitidos}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendidos</p>
                  <p className="text-2xl font-bold">{totalVendidos}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilizados</p>
                  <p className="text-2xl font-bold">{totalUtilizados}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    R$ {totalValor.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                  <p className="text-2xl font-bold">{taxaConversao}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosMensais}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="mes" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="emitidos"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Emitidos"
                    />
                    <Line
                      type="monotone"
                      dataKey="vendidos"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Vendidos"
                    />
                    <Line
                      type="monotone"
                      dataKey="utilizados"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Utilizados"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPorStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Desempenho por Parceiro */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Desempenho por Parceiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosPorParceiro} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      dataKey="nome"
                      type="category"
                      width={150}
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        name === "valor"
                          ? `R$ ${value.toLocaleString("pt-BR")}`
                          : value,
                        name === "quantidade" ? "Quantidade" : "Valor",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="quantidade"
                      fill="hsl(var(--primary))"
                      name="Quantidade"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento de Vales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Data Venda</TableHead>
                    <TableHead>Data Utilização</TableHead>
                    <TableHead>Consumidor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valesDetalhados.map((vale) => (
                    <TableRow key={vale.id}>
                      <TableCell className="font-mono text-sm">
                        {vale.numero}
                      </TableCell>
                      <TableCell>{vale.parceiro}</TableCell>
                      <TableCell>
                        {format(new Date(vale.dataEmissao), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {vale.dataVenda
                          ? format(new Date(vale.dataVenda), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {vale.dataUtilizacao
                          ? format(new Date(vale.dataUtilizacao), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>{vale.consumidor || "-"}</TableCell>
                      <TableCell>R$ {vale.valor.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(vale.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
