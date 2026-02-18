import jsPDF from "jspdf";

interface EmpresaConfig {
  nome_empresa: string;
  cnpj?: string | null;
  telefone?: string | null;
  endereco?: string | null;
}

const formatCurrency = (value: number): string =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

const formatDate = (date: Date): string =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function createBaseDoc(empresa: EmpresaConfig, titulo: string): { doc: jsPDF; yPos: number } {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  let yPos = 20;

  // Header empresa
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(empresa.nome_empresa.toUpperCase(), pageWidth / 2, yPos, { align: "center" });
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (empresa.cnpj) {
    doc.text(`CNPJ: ${empresa.cnpj}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 4;
  }
  if (empresa.endereco) {
    doc.text(empresa.endereco, pageWidth / 2, yPos, { align: "center" });
    yPos += 4;
  }
  if (empresa.telefone) {
    doc.text(`Tel: ${empresa.telefone}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 4;
  }

  yPos += 4;
  doc.setLineWidth(0.5);
  doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos);
  yPos += 8;

  // Título do documento
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  return { doc, yPos };
}

// ==================== RECIBO DE FOLHA DE PAGAMENTO ====================
export interface FolhaReciboData {
  empresa: EmpresaConfig;
  funcionario: string;
  cargo: string;
  mesReferencia: string;
  salarioBase: number;
  horasExtras: number;
  descontos: number;
  liquido: number;
}

export function generateFolhaRecibo(data: FolhaReciboData): void {
  const { doc, yPos: y } = createBaseDoc(data.empresa, "RECIBO DE PAGAMENTO");
  const marginLeft = 15;
  const pageWidth = 210;
  let yPos = y;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Funcionário: ${data.funcionario}`, marginLeft, yPos);
  doc.text(`Cargo: ${data.cargo}`, pageWidth / 2, yPos);
  yPos += 6;
  doc.text(`Mês Referência: ${data.mesReferencia}`, marginLeft, yPos);
  doc.text(`Data Emissão: ${formatDate(new Date())}`, pageWidth / 2, yPos);
  yPos += 10;

  // Tabela de proventos
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIÇÃO", marginLeft, yPos);
  doc.text("PROVENTOS", 130, yPos, { align: "right" });
  doc.text("DESCONTOS", pageWidth - marginLeft, yPos, { align: "right" });
  yPos += 2;
  doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.text("Salário Base", marginLeft, yPos);
  doc.text(formatCurrency(data.salarioBase), 130, yPos, { align: "right" });
  yPos += 6;

  if (data.horasExtras > 0) {
    doc.text("Horas Extras", marginLeft, yPos);
    doc.text(formatCurrency(data.horasExtras), 130, yPos, { align: "right" });
    yPos += 6;
  }

  doc.text("INSS / IR / Descontos", marginLeft, yPos);
  doc.text(formatCurrency(data.descontos), pageWidth - marginLeft, yPos, { align: "right" });
  yPos += 8;

  doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos);
  yPos += 6;

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PROVENTOS:", marginLeft, yPos);
  doc.text(formatCurrency(data.salarioBase + data.horasExtras), 130, yPos, { align: "right" });
  doc.text(formatCurrency(data.descontos), pageWidth - marginLeft, yPos, { align: "right" });
  yPos += 8;

  doc.setFontSize(12);
  doc.text("LÍQUIDO A RECEBER:", marginLeft, yPos);
  doc.text(formatCurrency(data.liquido), pageWidth - marginLeft, yPos, { align: "right" });
  yPos += 20;

  // Assinaturas
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(marginLeft, yPos, 90, yPos);
  doc.line(120, yPos, pageWidth - marginLeft, yPos);
  yPos += 4;
  doc.text("Empregador", marginLeft + 20, yPos);
  doc.text("Funcionário", 145, yPos);

  doc.save(`recibo-folha-${data.funcionario.replace(/\s/g, "-").toLowerCase()}.pdf`);
}

// ==================== RECIBO DE VALE ====================
export interface ValeReciboData {
  empresa: EmpresaConfig;
  funcionario: string;
  tipo: string;
  valor: number;
  data: string;
  desconto_referencia?: string;
  observacoes?: string;
}

export function generateValeRecibo(data: ValeReciboData): void {
  const { doc, yPos: y } = createBaseDoc(data.empresa, "RECIBO DE VALE / ADIANTAMENTO");
  const marginLeft = 15;
  const pageWidth = 210;
  let yPos = y;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Funcionário: ${data.funcionario}`, marginLeft, yPos);
  yPos += 6;
  doc.text(`Tipo: ${data.tipo}`, marginLeft, yPos);
  doc.text(`Data: ${data.data}`, pageWidth / 2, yPos);
  yPos += 6;
  if (data.desconto_referencia) {
    doc.text(`Desconto em: ${data.desconto_referencia}`, marginLeft, yPos);
    yPos += 6;
  }
  yPos += 4;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Valor: ${formatCurrency(data.valor)}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  if (data.observacoes) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Observações: ${data.observacoes}`, marginLeft, yPos);
    yPos += 8;
  }

  yPos += 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(marginLeft, yPos, 90, yPos);
  doc.line(120, yPos, pageWidth - marginLeft, yPos);
  yPos += 4;
  doc.text("Empregador", marginLeft + 20, yPos);
  doc.text("Funcionário", 145, yPos);

  doc.save(`recibo-vale-${data.funcionario.replace(/\s/g, "-").toLowerCase()}.pdf`);
}

// ==================== RECIBO DE BÔNUS ====================
export interface BonusReciboData {
  empresa: EmpresaConfig;
  funcionario: string;
  tipo: string;
  valor: number;
  mesReferencia: string;
  observacoes?: string;
}

export function generateBonusRecibo(data: BonusReciboData): void {
  const { doc, yPos: y } = createBaseDoc(data.empresa, "RECIBO DE BONIFICAÇÃO");
  const marginLeft = 15;
  const pageWidth = 210;
  let yPos = y;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Funcionário: ${data.funcionario}`, marginLeft, yPos);
  yPos += 6;
  doc.text(`Tipo: ${data.tipo}`, marginLeft, yPos);
  doc.text(`Mês Ref.: ${data.mesReferencia}`, pageWidth / 2, yPos);
  yPos += 6;
  doc.text(`Data Emissão: ${formatDate(new Date())}`, marginLeft, yPos);
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Valor: ${formatCurrency(data.valor)}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  if (data.observacoes) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Observações: ${data.observacoes}`, marginLeft, yPos);
    yPos += 8;
  }

  yPos += 15;
  doc.setFontSize(9);
  doc.line(marginLeft, yPos, 90, yPos);
  doc.line(120, yPos, pageWidth - marginLeft, yPos);
  yPos += 4;
  doc.text("Empregador", marginLeft + 20, yPos);
  doc.text("Funcionário", 145, yPos);

  doc.save(`recibo-bonus-${data.funcionario.replace(/\s/g, "-").toLowerCase()}.pdf`);
}

// ==================== RECIBO DE COMISSÃO ====================
export interface ComissaoReciboData {
  empresa: EmpresaConfig;
  entregador: string;
  mesReferencia: string;
  linhas: { produto: string; canal: string; quantidade: number; comissaoUnit: number; total: number }[];
  totalComissao: number;
}

export function generateComissaoRecibo(data: ComissaoReciboData): void {
  const { doc, yPos: y } = createBaseDoc(data.empresa, "RECIBO DE COMISSÃO");
  const marginLeft = 15;
  const pageWidth = 210;
  let yPos = y;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Entregador: ${data.entregador}`, marginLeft, yPos);
  doc.text(`Mês Ref.: ${data.mesReferencia}`, pageWidth / 2, yPos);
  yPos += 6;
  doc.text(`Data Emissão: ${formatDate(new Date())}`, marginLeft, yPos);
  yPos += 10;

  // Tabela
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Produto", marginLeft, yPos);
  doc.text("Canal", 80, yPos);
  doc.text("Qtd", 115, yPos, { align: "right" });
  doc.text("Comissão", 145, yPos, { align: "right" });
  doc.text("Total", pageWidth - marginLeft, yPos, { align: "right" });
  yPos += 2;
  doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  data.linhas.forEach((linha) => {
    doc.text(linha.produto.substring(0, 30), marginLeft, yPos);
    doc.text(linha.canal, 80, yPos);
    doc.text(String(linha.quantidade), 115, yPos, { align: "right" });
    doc.text(formatCurrency(linha.comissaoUnit), 145, yPos, { align: "right" });
    doc.text(formatCurrency(linha.total), pageWidth - marginLeft, yPos, { align: "right" });
    yPos += 5;
  });

  yPos += 3;
  doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos);
  yPos += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL COMISSÃO:", marginLeft, yPos);
  doc.text(formatCurrency(data.totalComissao), pageWidth - marginLeft, yPos, { align: "right" });
  yPos += 20;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(marginLeft, yPos, 90, yPos);
  doc.line(120, yPos, pageWidth - marginLeft, yPos);
  yPos += 4;
  doc.text("Empregador", marginLeft + 20, yPos);
  doc.text("Entregador", 145, yPos);

  doc.save(`recibo-comissao-${data.entregador.replace(/\s/g, "-").toLowerCase()}.pdf`);
}
