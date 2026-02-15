import { createContext, useContext, useState, ReactNode } from "react";

// Tipos de parceiro
export type TipoParceiro = "prepago" | "consignado";

// Status do vale
export type StatusVale = "disponivel" | "vendido" | "utilizado" | "cancelado";

// Parceiro que compra/recebe vales
export interface Parceiro {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  tipo: TipoParceiro;
  ativo: boolean;
  createdAt: Date;
}

// Vale Gás individual
export interface ValeGas {
  id: string;
  numero: number;
  codigo: string; // Código QR/único
  valor: number;
  parceiroId: string;
  loteId: string;
  status: StatusVale;
  descricao?: string;
  clienteId?: string;
  clienteNome?: string;
  produtoId?: string;
  produtoNome?: string;
  // Dados do consumidor (quando vendido)
  consumidorNome?: string;
  consumidorEndereco?: string;
  consumidorTelefone?: string;
  // Dados de utilização
  dataUtilizacao?: Date;
  entregadorId?: string;
  entregadorNome?: string;
  vendaId?: string;
  createdAt: Date;
}

// Lote de vales emitidos
export interface LoteVales {
  id: string;
  parceiroId: string;
  parceiroNome: string;
  tipoParceiro: TipoParceiro;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  numeroInicial: number;
  numeroFinal: number;
  dataEmissao: Date;
  dataVencimentoPagamento?: Date; // Para pré-pago
  statusPagamento: "pendente" | "pago" | "parcial";
  valorPago: number;
  observacao?: string;
  descricao?: string;
  clienteId?: string;
  clienteNome?: string;
  produtoId?: string;
  produtoNome?: string;
  gerarContaReceber?: boolean;
  cancelado?: boolean;
}

// Acerto de conta com parceiro consignado
export interface AcertoConta {
  id: string;
  parceiroId: string;
  parceiroNome: string;
  dataAcerto: Date;
  valesUtilizados: string[]; // IDs dos vales
  quantidade: number;
  valorTotal: number;
  statusPagamento: "pendente" | "pago";
  dataPagamento?: Date;
  formaPagamento?: string;
  observacao?: string;
}

interface ValeGasContextType {
  // Parceiros
  parceiros: Parceiro[];
  addParceiro: (parceiro: Omit<Parceiro, "id" | "createdAt">) => void;
  updateParceiro: (id: string, data: Partial<Parceiro>) => void;
  
  // Vales
  vales: ValeGas[];
  getValeByNumero: (numero: number) => ValeGas | undefined;
  getValeByCodigo: (codigo: string) => ValeGas | undefined;
  registrarVendaConsumidor: (valeId: string, consumidor: { nome: string; endereco: string; telefone: string }) => void;
  utilizarVale: (valeId: string, entregadorId: string, entregadorNome: string, vendaId: string) => { sucesso: boolean; mensagem: string; vale?: ValeGas };
  
  // Lotes
  lotes: LoteVales[];
  emitirLote: (data: { parceiroId: string; quantidade: number; valorUnitario: number; numeroInicial?: number; dataVencimento?: Date; observacao?: string; descricao?: string; clienteId?: string; clienteNome?: string; produtoId?: string; produtoNome?: string; gerarContaReceber?: boolean }) => LoteVales;
  cancelarLote: (loteId: string) => void;
  registrarPagamentoLote: (loteId: string, valor: number) => void;
  
  // Acertos
  acertos: AcertoConta[];
  gerarAcerto: (parceiroId: string) => AcertoConta | null;
  registrarPagamentoAcerto: (acertoId: string, formaPagamento: string) => void;
  
  // Estatísticas
  getEstatisticasParceiro: (parceiroId: string) => {
    totalVales: number;
    valesDisponiveis: number;
    valesVendidos: number;
    valesUtilizados: number;
    valorPendente: number;
  };
  
  // Próximo número disponível
  proximoNumeroVale: number;
}

const ValeGasContext = createContext<ValeGasContextType | undefined>(undefined);

// Gerador de código único
const gerarCodigoVale = (numero: number) => {
  const ano = new Date().getFullYear();
  return `VG-${ano}-${numero.toString().padStart(5, "0")}`;
};

export function ValeGasProvider({ children }: { children: ReactNode }) {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);

  const [lotes, setLotes] = useState<LoteVales[]>([]);

  const [vales, setVales] = useState<ValeGas[]>([]);

  const [acertos, setAcertos] = useState<AcertoConta[]>([]);

  const [proximoNumeroVale, setProximoNumeroVale] = useState(1);

  // Funções de parceiros
  const addParceiro = (parceiro: Omit<Parceiro, "id" | "createdAt">) => {
    const novoParceiro: Parceiro = {
      ...parceiro,
      id: `parc-${Date.now()}`,
      createdAt: new Date(),
    };
    setParceiros(prev => [...prev, novoParceiro]);
  };

  const updateParceiro = (id: string, data: Partial<Parceiro>) => {
    setParceiros(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  // Funções de vales
  const getValeByNumero = (numero: number) => vales.find(v => v.numero === numero);
  
  const getValeByCodigo = (codigo: string) => vales.find(v => v.codigo === codigo);

  const registrarVendaConsumidor = (valeId: string, consumidor: { nome: string; endereco: string; telefone: string }) => {
    setVales(prev => prev.map(v => 
      v.id === valeId 
        ? { ...v, status: "vendido" as StatusVale, consumidorNome: consumidor.nome, consumidorEndereco: consumidor.endereco, consumidorTelefone: consumidor.telefone }
        : v
    ));
  };

  const utilizarVale = (valeId: string, entregadorId: string, entregadorNome: string, vendaId: string) => {
    const vale = vales.find(v => v.id === valeId);
    
    if (!vale) {
      return { sucesso: false, mensagem: "Vale não encontrado" };
    }
    
    if (vale.status === "utilizado") {
      return { sucesso: false, mensagem: "Vale já foi utilizado" };
    }
    
    if (vale.status === "cancelado") {
      return { sucesso: false, mensagem: "Vale cancelado" };
    }
    
    const parceiro = parceiros.find(p => p.id === vale.parceiroId);
    
    setVales(prev => prev.map(v => 
      v.id === valeId
        ? { 
            ...v, 
            status: "utilizado" as StatusVale, 
            dataUtilizacao: new Date(), 
            entregadorId, 
            entregadorNome,
            vendaId 
          }
        : v
    ));
    
    return { 
      sucesso: true, 
      mensagem: `Vale ${vale.numero} (${parceiro?.nome}) utilizado com sucesso!`,
      vale: { ...vale, status: "utilizado" as StatusVale }
    };
  };

  // Funções de lotes
  const emitirLote = (data: { parceiroId: string; quantidade: number; valorUnitario: number; numeroInicial?: number; dataVencimento?: Date; observacao?: string; descricao?: string; clienteId?: string; clienteNome?: string; produtoId?: string; produtoNome?: string; gerarContaReceber?: boolean }) => {
    const parceiro = parceiros.find(p => p.id === data.parceiroId);
    if (!parceiro) throw new Error("Parceiro não encontrado");

    const numeroInicial = data.numeroInicial || proximoNumeroVale;
    const numeroFinal = numeroInicial + data.quantidade - 1;

    const novoLote: LoteVales = {
      id: `lote-${Date.now()}`,
      parceiroId: data.parceiroId,
      parceiroNome: parceiro.nome,
      tipoParceiro: parceiro.tipo,
      quantidade: data.quantidade,
      valorUnitario: data.valorUnitario,
      valorTotal: data.quantidade * data.valorUnitario,
      numeroInicial,
      numeroFinal,
      dataEmissao: new Date(),
      dataVencimentoPagamento: data.dataVencimento,
      statusPagamento: "pendente",
      valorPago: 0,
      observacao: data.observacao,
      descricao: data.descricao,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      produtoId: data.produtoId,
      produtoNome: data.produtoNome,
      gerarContaReceber: data.gerarContaReceber,
    };

    // Criar vales do lote
    const novosVales: ValeGas[] = [];
    for (let i = numeroInicial; i <= numeroFinal; i++) {
      novosVales.push({
        id: `vale-${i}`,
        numero: i,
        codigo: gerarCodigoVale(i),
        valor: data.valorUnitario,
        parceiroId: data.parceiroId,
        loteId: novoLote.id,
        status: "disponivel",
        descricao: data.descricao,
        clienteId: data.clienteId,
        clienteNome: data.clienteNome,
        produtoId: data.produtoId,
        produtoNome: data.produtoNome,
        createdAt: new Date(),
      });
    }

    setLotes(prev => [...prev, novoLote]);
    setVales(prev => [...prev, ...novosVales]);
    setProximoNumeroVale(numeroFinal + 1);

    return novoLote;
  };

  const cancelarLote = (loteId: string) => {
    setLotes(prev => prev.map(l => l.id === loteId ? { ...l, cancelado: true } : l));
    setVales(prev => prev.map(v => v.loteId === loteId && v.status === "disponivel" ? { ...v, status: "cancelado" as StatusVale } : v));
  };

  const registrarPagamentoLote = (loteId: string, valor: number) => {
    setLotes(prev => prev.map(l => {
      if (l.id !== loteId) return l;
      const novoValorPago = l.valorPago + valor;
      return {
        ...l,
        valorPago: novoValorPago,
        statusPagamento: novoValorPago >= l.valorTotal ? "pago" : novoValorPago > 0 ? "parcial" : "pendente",
      };
    }));
  };

  // Funções de acertos
  const gerarAcerto = (parceiroId: string) => {
    const parceiro = parceiros.find(p => p.id === parceiroId);
    if (!parceiro || parceiro.tipo !== "consignado") return null;

    // Buscar vales utilizados que ainda não foram acertados
    const valesAcertados = acertos
      .filter(a => a.parceiroId === parceiroId)
      .flatMap(a => a.valesUtilizados);
    
    const valesParaAcertar = vales.filter(v => 
      v.parceiroId === parceiroId && 
      v.status === "utilizado" && 
      !valesAcertados.includes(v.id)
    );

    if (valesParaAcertar.length === 0) return null;

    const novoAcerto: AcertoConta = {
      id: `acerto-${Date.now()}`,
      parceiroId,
      parceiroNome: parceiro.nome,
      dataAcerto: new Date(),
      valesUtilizados: valesParaAcertar.map(v => v.id),
      quantidade: valesParaAcertar.length,
      valorTotal: valesParaAcertar.reduce((sum, v) => sum + v.valor, 0),
      statusPagamento: "pendente",
    };

    setAcertos(prev => [...prev, novoAcerto]);
    return novoAcerto;
  };

  const registrarPagamentoAcerto = (acertoId: string, formaPagamento: string) => {
    setAcertos(prev => prev.map(a => 
      a.id === acertoId
        ? { ...a, statusPagamento: "pago" as const, dataPagamento: new Date(), formaPagamento }
        : a
    ));
  };

  // Estatísticas
  const getEstatisticasParceiro = (parceiroId: string) => {
    const valesParceiro = vales.filter(v => v.parceiroId === parceiroId);
    const parceiro = parceiros.find(p => p.id === parceiroId);
    
    const valesDisponiveis = valesParceiro.filter(v => v.status === "disponivel").length;
    const valesVendidos = valesParceiro.filter(v => v.status === "vendido").length;
    const valesUtilizados = valesParceiro.filter(v => v.status === "utilizado").length;
    
    // Calcular valor pendente baseado no tipo de parceiro
    let valorPendente = 0;
    if (parceiro?.tipo === "prepago") {
      // Pré-pago: valor pendente é do lote não pago
      const lotesParceiro = lotes.filter(l => l.parceiroId === parceiroId);
      valorPendente = lotesParceiro.reduce((sum, l) => sum + (l.valorTotal - l.valorPago), 0);
    } else {
      // Consignado: valor pendente é dos vales utilizados não acertados
      const valesAcertados = acertos
        .filter(a => a.parceiroId === parceiroId)
        .flatMap(a => a.valesUtilizados);
      const valesNaoAcertados = valesParceiro.filter(v => 
        v.status === "utilizado" && !valesAcertados.includes(v.id)
      );
      valorPendente = valesNaoAcertados.reduce((sum, v) => sum + v.valor, 0);
    }
    
    return {
      totalVales: valesParceiro.length,
      valesDisponiveis,
      valesVendidos,
      valesUtilizados,
      valorPendente,
    };
  };

  return (
    <ValeGasContext.Provider value={{
      parceiros,
      addParceiro,
      updateParceiro,
      vales,
      getValeByNumero,
      getValeByCodigo,
      registrarVendaConsumidor,
      utilizarVale,
      lotes,
      emitirLote,
      cancelarLote,
      registrarPagamentoLote,
      acertos,
      gerarAcerto,
      registrarPagamentoAcerto,
      getEstatisticasParceiro,
      proximoNumeroVale,
    }}>
      {children}
    </ValeGasContext.Provider>
  );
}

export function useValeGas() {
  const context = useContext(ValeGasContext);
  if (!context) {
    throw new Error("useValeGas must be used within ValeGasProvider");
  }
  return context;
}
