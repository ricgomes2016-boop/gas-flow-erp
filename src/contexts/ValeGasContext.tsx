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
  emitirLote: (data: { parceiroId: string; quantidade: number; valorUnitario: number; dataVencimento?: Date; observacao?: string; descricao?: string; clienteId?: string; clienteNome?: string; produtoId?: string; produtoNome?: string; gerarContaReceber?: boolean }) => LoteVales;
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
  // Parceiros mock
  const [parceiros, setParceiros] = useState<Parceiro[]>([
    {
      id: "parc-1",
      nome: "Supermercado Central",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 3456-7890",
      email: "contato@supermercadocentral.com",
      endereco: "Av. Principal, 1000 - Centro",
      tipo: "prepago",
      ativo: true,
      createdAt: new Date(2024, 0, 1),
    },
    {
      id: "parc-2",
      nome: "Loja de Conveniência Boa Vista",
      cnpj: "98.765.432/0001-10",
      telefone: "(11) 2345-6789",
      email: "contato@boavista.com",
      endereco: "Rua das Flores, 500 - Jardim",
      tipo: "consignado",
      ativo: true,
      createdAt: new Date(2024, 0, 15),
    },
    {
      id: "parc-3",
      nome: "Mercearia do João",
      cnpj: "11.222.333/0001-44",
      telefone: "(11) 9876-5432",
      email: "joao@mercearia.com",
      endereco: "Rua dos Comerciantes, 123",
      tipo: "consignado",
      ativo: true,
      createdAt: new Date(2024, 1, 1),
    },
  ]);

  // Lotes mock
  const [lotes, setLotes] = useState<LoteVales[]>([
    {
      id: "lote-1",
      parceiroId: "parc-1",
      parceiroNome: "Supermercado Central",
      tipoParceiro: "prepago",
      quantidade: 50,
      valorUnitario: 105,
      valorTotal: 5250,
      numeroInicial: 1,
      numeroFinal: 50,
      dataEmissao: new Date(2024, 0, 10),
      dataVencimentoPagamento: new Date(2024, 0, 30),
      statusPagamento: "pago",
      valorPago: 5250,
    },
    {
      id: "lote-2",
      parceiroId: "parc-2",
      parceiroNome: "Loja de Conveniência Boa Vista",
      tipoParceiro: "consignado",
      quantidade: 50,
      valorUnitario: 105,
      valorTotal: 5250,
      numeroInicial: 51,
      numeroFinal: 100,
      dataEmissao: new Date(2024, 1, 1),
      statusPagamento: "pendente",
      valorPago: 0,
    },
    {
      id: "lote-3",
      parceiroId: "parc-3",
      parceiroNome: "Mercearia do João",
      tipoParceiro: "consignado",
      quantidade: 30,
      valorUnitario: 105,
      valorTotal: 3150,
      numeroInicial: 101,
      numeroFinal: 130,
      dataEmissao: new Date(2024, 1, 15),
      statusPagamento: "pendente",
      valorPago: 0,
    },
  ]);

  // Vales mock - baseados nos lotes
  const [vales, setVales] = useState<ValeGas[]>(() => {
    const todosVales: ValeGas[] = [];
    
    // Lote 1 - Supermercado (prepago) - alguns utilizados
    for (let i = 1; i <= 50; i++) {
      const status: StatusVale = i <= 10 ? "utilizado" : i <= 25 ? "vendido" : "disponivel";
      todosVales.push({
        id: `vale-${i}`,
        numero: i,
        codigo: gerarCodigoVale(i),
        valor: 105,
        parceiroId: "parc-1",
        loteId: "lote-1",
        status,
        consumidorNome: status !== "disponivel" ? `Cliente ${i}` : undefined,
        consumidorEndereco: status !== "disponivel" ? `Rua ${i}, ${i * 10}` : undefined,
        consumidorTelefone: status !== "disponivel" ? `(11) 9${i}000-0000` : undefined,
        dataUtilizacao: status === "utilizado" ? new Date(2024, 0, 15 + i) : undefined,
        entregadorId: status === "utilizado" ? "ent-1" : undefined,
        entregadorNome: status === "utilizado" ? "Carlos Silva" : undefined,
        createdAt: new Date(2024, 0, 10),
      });
    }
    
    // Lote 2 - Boa Vista (consignado)
    for (let i = 51; i <= 100; i++) {
      const status: StatusVale = i <= 60 ? "utilizado" : i <= 75 ? "vendido" : "disponivel";
      todosVales.push({
        id: `vale-${i}`,
        numero: i,
        codigo: gerarCodigoVale(i),
        valor: 105,
        parceiroId: "parc-2",
        loteId: "lote-2",
        status,
        consumidorNome: status !== "disponivel" ? `Cliente ${i}` : undefined,
        consumidorEndereco: status !== "disponivel" ? `Av. ${i}, ${i * 5}` : undefined,
        consumidorTelefone: status !== "disponivel" ? `(11) 8${i}00-0000` : undefined,
        dataUtilizacao: status === "utilizado" ? new Date(2024, 1, i - 50) : undefined,
        entregadorId: status === "utilizado" ? "ent-2" : undefined,
        entregadorNome: status === "utilizado" ? "Pedro Santos" : undefined,
        createdAt: new Date(2024, 1, 1),
      });
    }
    
    // Lote 3 - Mercearia do João (consignado)
    for (let i = 101; i <= 130; i++) {
      const status: StatusVale = i <= 105 ? "utilizado" : i <= 110 ? "vendido" : "disponivel";
      todosVales.push({
        id: `vale-${i}`,
        numero: i,
        codigo: gerarCodigoVale(i),
        valor: 105,
        parceiroId: "parc-3",
        loteId: "lote-3",
        status,
        consumidorNome: status !== "disponivel" ? `Cliente ${i}` : undefined,
        consumidorEndereco: status !== "disponivel" ? `Rua B, ${i}` : undefined,
        dataUtilizacao: status === "utilizado" ? new Date(2024, 1, 20) : undefined,
        entregadorId: status === "utilizado" ? "ent-1" : undefined,
        entregadorNome: status === "utilizado" ? "Carlos Silva" : undefined,
        createdAt: new Date(2024, 1, 15),
      });
    }
    
    return todosVales;
  });

  // Acertos mock
  const [acertos, setAcertos] = useState<AcertoConta[]>([
    {
      id: "acerto-1",
      parceiroId: "parc-2",
      parceiroNome: "Loja de Conveniência Boa Vista",
      dataAcerto: new Date(2024, 1, 15),
      valesUtilizados: ["vale-51", "vale-52", "vale-53", "vale-54", "vale-55"],
      quantidade: 5,
      valorTotal: 525,
      statusPagamento: "pago",
      dataPagamento: new Date(2024, 1, 20),
      formaPagamento: "PIX",
    },
  ]);

  const [proximoNumeroVale, setProximoNumeroVale] = useState(131);

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
  const emitirLote = (data: { parceiroId: string; quantidade: number; valorUnitario: number; dataVencimento?: Date; observacao?: string; descricao?: string; clienteId?: string; clienteNome?: string; produtoId?: string; produtoNome?: string; gerarContaReceber?: boolean }) => {
    const parceiro = parceiros.find(p => p.id === data.parceiroId);
    if (!parceiro) throw new Error("Parceiro não encontrado");

    const numeroInicial = proximoNumeroVale;
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
