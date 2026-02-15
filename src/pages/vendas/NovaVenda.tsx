import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, ShoppingBag, Sparkles, Loader2, Send, Mic, MicOff, Camera, ImageIcon, RotateCcw, Check, User, Package as PackageIcon, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateReceiptPdf, EmpresaConfig } from "@/services/receiptPdfService";
import { atualizarEstoqueVenda } from "@/services/estoqueService";
import { useUnidade } from "@/contexts/UnidadeContext";
import { cn } from "@/lib/utils";

import { CustomerSearch } from "@/components/vendas/CustomerSearch";
import { ProductSearch, ItemVenda } from "@/components/vendas/ProductSearch";
import { PaymentSection, Pagamento } from "@/components/vendas/PaymentSection";
import { OrderSummary } from "@/components/vendas/OrderSummary";
import { CustomerHistory } from "@/components/vendas/CustomerHistory";
import { DeliveryPersonSelect } from "@/components/vendas/DeliveryPersonSelect";

interface CustomerData {
  id: string | null;
  nome: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  observacao: string;
}

const initialCustomerData: CustomerData = {
  id: null,
  nome: "",
  telefone: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cep: "",
  observacao: "",
};

const DRAFT_KEY = "nova-venda-rascunho";

function saveDraft(data: { customer: CustomerData; itens: ItemVenda[]; pagamentos: Pagamento[]; canalVenda: string; entregador: { id: string | null; nome: string | null } }) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// Stepper component
function VendaStepper({ customer, itens, pagamentos, totalVenda }: {
  customer: CustomerData;
  itens: ItemVenda[];
  pagamentos: Pagamento[];
  totalVenda: number;
}) {
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const steps = [
    { label: "Cliente", done: !!customer.nome, icon: User },
    { label: "Produtos", done: itens.length > 0, icon: PackageIcon },
    { label: "Pagamento", done: totalPago >= totalVenda && totalVenda > 0, icon: CreditCard },
    { label: "Confirmar", done: totalPago >= totalVenda && totalVenda > 0 && itens.length > 0, icon: CheckCircle },
  ];

  return (
    <div className="flex items-center justify-between gap-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
              step.done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {step.done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1 rounded", step.done ? "bg-primary/30" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NovaVenda() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unidadeAtual } = useUnidade();

  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split("T")[0]);
  const [canalVenda, setCanalVenda] = useState("telefone");
  const [customer, setCustomer] = useState<CustomerData>(initialCustomerData);
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [entregador, setEntregador] = useState<{ id: string | null; nome: string | null }>({
    id: null,
    nome: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [aiCommand, setAiCommand] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const draftLoaded = useRef(false);

  // #5 - Load draft on mount
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;
    const draft = loadDraft();
    if (draft && (draft.itens?.length > 0 || draft.customer?.nome)) {
      setCustomer(draft.customer || initialCustomerData);
      setItens(draft.itens || []);
      setPagamentos(draft.pagamentos || []);
      setCanalVenda(draft.canalVenda || "telefone");
      setEntregador(draft.entregador || { id: null, nome: null });
      toast({ title: "Rascunho restaurado", description: "Sua venda em andamento foi recuperada." });
    }
  }, []);

  // #5 - Auto-save draft
  useEffect(() => {
    if (!draftLoaded.current) return;
    if (customer.nome || itens.length > 0) {
      saveDraft({ customer, itens, pagamentos, canalVenda, entregador });
    }
  }, [customer, itens, pagamentos, canalVenda, entregador]);

  // Fetch dynamic sales channels
  const { data: canaisVenda = [] } = useQuery({
    queryKey: ["canais-venda"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canais_venda")
        .select("id, nome, tipo")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data || [];
    },
  });


  // Fixed channels + dynamic ones
  const fixedChannels = [
    { value: "telefone", label: "📞 Telefone" },
    { value: "whatsapp", label: "💬 WhatsApp" },
    { value: "portaria", label: "🏢 Portaria" },
    { value: "balcao", label: "🏪 Balcão" },
  ];

  const dynamicChannels = canaisVenda
    .filter((c) => !fixedChannels.some((f) => f.value === c.nome.toLowerCase()))
    .map((c) => ({ value: c.nome, label: `🏷️ ${c.nome}` }));

  const allChannels = [...fixedChannels, ...dynamicChannels];

  // Voice recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAiCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast({
          title: "Microfone bloqueado",
          description: "Permita o acesso ao microfone nas configurações do navegador.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => {
        const btn = document.getElementById("ai-send-btn");
        if (btn) btn.click();
      }, 300);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-sales-command", {
        body: { comando: aiCommand },
      });

      if (error) throw error;

      if (data.cliente_id) {
        const { data: clienteData } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", data.cliente_id)
          .single();
        if (clienteData) {
          setCustomer({
            id: clienteData.id,
            nome: clienteData.nome,
            telefone: clienteData.telefone || "",
            endereco: data.endereco || clienteData.endereco || "",
            numero: data.numero || "",
            complemento: data.complemento || "",
            bairro: data.bairro || clienteData.bairro || "",
            cep: data.cep || clienteData.cep || "",
            observacao: data.observacoes || "",
          });
        }
      } else if (data.cliente_nome) {
        const novoCliente: any = {
          nome: data.cliente_nome,
          endereco: data.endereco || null,
          bairro: data.bairro || null,
          cep: data.cep || null,
          cidade: data.cidade || null,
          telefone: data.cliente_telefone || null,
          ativo: true,
        };

        const { data: clienteCriado, error: createError } = await supabase
          .from("clientes")
          .insert(novoCliente)
          .select("id")
          .single();

        if (createError) {
          setCustomer({
            ...initialCustomerData,
            nome: data.cliente_nome,
            telefone: data.cliente_telefone || "",
            endereco: data.endereco || "",
            numero: data.numero || "",
            complemento: data.complemento || "",
            bairro: data.bairro || "",
            cep: data.cep || "",
            observacao: data.observacoes || "",
          });
        } else {
          setCustomer({
            id: clienteCriado.id,
            nome: data.cliente_nome,
            telefone: data.cliente_telefone || "",
            endereco: data.endereco || "",
            numero: data.numero || "",
            complemento: data.complemento || "",
            bairro: data.bairro || "",
            cep: data.cep || "",
            observacao: data.observacoes || "",
          });
          toast({
            title: "Novo cliente cadastrado!",
            description: `${data.cliente_nome} foi adicionado automaticamente ao sistema.`,
          });
        }
      }

      if (data.itens && data.itens.length > 0) {
        const newItens: ItemVenda[] = data.itens.map((item: any) => ({
          id: crypto.randomUUID(),
          produto_id: item.produto_id,
          nome: item.nome,
          quantidade: item.quantidade || 1,
          preco_unitario: item.preco_unitario,
          total: (item.quantidade || 1) * item.preco_unitario,
        }));
        setItens(newItens);
      }

      if (data.forma_pagamento) {
        const totalItens = (data.itens || []).reduce((a: number, i: any) => a + (i.quantidade || 1) * i.preco_unitario, 0);
        setPagamentos([{ id: crypto.randomUUID(), forma: data.forma_pagamento, valor: totalItens }]);
      }

      if (data.canal_venda) {
        setCanalVenda(data.canal_venda);
      }

      setAiCommand("");
      toast({
        title: "Comando interpretado!",
        description: `Venda pré-preenchida para ${data.cliente_nome || "cliente não identificado"}.`,
      });
    } catch (error: any) {
      console.error("Erro IA:", error);
      toast({
        title: "Erro ao interpretar",
        description: error.message || "Não foi possível processar o comando.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Photo OCR handler
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1600;
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSales = async (file: File) => {
    setPhotoLoading(true);
    try {
      const imageData = await compressImage(file);

      const { data, error } = await supabase.functions.invoke("parse-sales-photo", {
        body: { image: imageData },
      });

      if (error) throw error;

      const vendas = data.vendas || [data];
      if (!vendas.length) {
        toast({ title: "Nenhuma venda encontrada", description: "Não foi possível identificar vendas na imagem.", variant: "destructive" });
        return;
      }

      let successCount = 0;
      for (const venda of vendas) {
        try {
          let clienteId = venda.cliente_id;
          if (!clienteId && venda.cliente_nome) {
            const { data: found } = await supabase
              .from("clientes")
              .select("id")
              .ilike("nome", `%${venda.cliente_nome}%`)
              .limit(1)
              .single();

            if (found) {
              clienteId = found.id;
            } else {
              const { data: created } = await supabase
                .from("clientes")
                .insert({
                  nome: venda.cliente_nome,
                  endereco: venda.endereco || null,
                  bairro: venda.bairro || null,
                  cep: venda.cep || null,
                  cidade: venda.cidade || null,
                  telefone: venda.cliente_telefone || null,
                  ativo: true,
                })
                .select("id")
                .single();
              if (created) clienteId = created.id;
            }
          }

          const enderecoCompleto = [
            venda.endereco,
            venda.numero && `Nº ${venda.numero}`,
            venda.complemento,
            venda.bairro,
          ].filter(Boolean).join(", ");

          const valorTotal = (venda.itens || []).reduce((a: number, i: any) => a + (i.quantidade || 1) * i.preco_unitario, 0);

          const { data: pedido, error: pedidoError } = await supabase
            .from("pedidos")
            .insert({
              cliente_id: clienteId,
              endereco_entrega: enderecoCompleto,
              valor_total: valorTotal,
              forma_pagamento: venda.forma_pagamento || null,
              canal_venda: venda.canal_venda || "telefone",
              observacoes: venda.observacoes || null,
              status: "pendente",
              unidade_id: unidadeAtual?.id,
            })
            .select("id")
            .single();

          if (pedidoError) throw pedidoError;

          if (venda.itens?.length) {
            const itensInsert = venda.itens.map((item: any) => ({
              pedido_id: pedido.id,
              produto_id: item.produto_id,
              quantidade: item.quantidade || 1,
              preco_unitario: item.preco_unitario,
            }));
            await supabase.from("pedido_itens").insert(itensInsert);
          }

          // #4 - Use shared stock update service
          await atualizarEstoqueVenda(
            (venda.itens || []).map((item: any) => ({
              produto_id: item.produto_id,
              quantidade: item.quantidade || 1,
            }))
          );

          successCount++;
        } catch (err: any) {
          console.error(`Erro ao lançar venda para ${venda.cliente_nome}:`, err);
        }
      }

      toast({
        title: `${successCount} venda(s) lançada(s)!`,
        description: `${successCount} de ${vendas.length} vendas foram criadas com sucesso a partir da foto.`,
      });

      if (successCount > 0) {
        clearDraft();
        navigate("/vendas/pedidos");
      }
    } catch (error: any) {
      console.error("Erro OCR:", error);
      toast({
        title: "Erro ao processar foto",
        description: error.message || "Não foi possível interpretar a anotação.",
        variant: "destructive",
      });
    } finally {
      setPhotoLoading(false);
    }
  };

  const totalVenda = itens.reduce((acc, item) => acc + item.total, 0);


  // #7 - Repeat last sale
  const handleRepetirUltimaVenda = async () => {
    try {
      const { data: ultimoPedido } = await supabase
        .from("pedidos")
        .select(`
          *,
          clientes (id, nome, telefone, endereco, bairro, cep),
          pedido_itens (produto_id, quantidade, preco_unitario, produtos (id, nome))
        `)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!ultimoPedido) {
        toast({ title: "Nenhuma venda anterior", variant: "destructive" });
        return;
      }

      const cliente = ultimoPedido.clientes;
      if (cliente) {
        setCustomer({
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone || "",
          endereco: cliente.endereco || "",
          numero: "",
          complemento: "",
          bairro: cliente.bairro || "",
          cep: cliente.cep || "",
          observacao: ultimoPedido.observacoes || "",
        });
      }

      const itensUltimo: ItemVenda[] = (ultimoPedido.pedido_itens || []).map((item: any) => ({
        id: crypto.randomUUID(),
        produto_id: item.produto_id,
        nome: item.produtos?.nome || "Produto",
        quantidade: item.quantidade,
        preco_unitario: Number(item.preco_unitario),
        total: item.quantidade * Number(item.preco_unitario),
      }));
      setItens(itensUltimo);

      if (ultimoPedido.forma_pagamento) {
        const totalItens = itensUltimo.reduce((a, i) => a + i.total, 0);
        setPagamentos([{ id: crypto.randomUUID(), forma: ultimoPedido.forma_pagamento.split(",")[0].trim(), valor: totalItens }]);
      }

      if (ultimoPedido.canal_venda) setCanalVenda(ultimoPedido.canal_venda);

      toast({ title: "Última venda carregada!", description: `Dados de ${cliente?.nome || "cliente"} foram preenchidos.` });
    } catch (error: any) {
      console.error("Erro ao repetir venda:", error);
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar a última venda.", variant: "destructive" });
    }
  };

  const handleSelecionarEntregador = (id: string, nome: string) => {
    setEntregador({ id, nome });
    toast({
      title: "Entregador selecionado!",
      description: `${nome} foi atribuído a esta venda.`,
    });
  };

  const handleFinalizar = async () => {
    if (itens.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos um produto.", variant: "destructive" });
      return;
    }

    const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
    if (totalPago < totalVenda) {
      toast({ title: "Pagamento incompleto", description: `Falta pagar R$ ${(totalVenda - totalPago).toFixed(2)}`, variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const enderecoCompleto = [
        customer.endereco,
        customer.numero && `Nº ${customer.numero}`,
        customer.complemento,
        customer.bairro,
      ].filter(Boolean).join(", ");

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          cliente_id: customer.id,
          entregador_id: entregador.id,
          endereco_entrega: enderecoCompleto,
          valor_total: totalVenda,
          forma_pagamento: pagamentos.map((p) => p.forma).join(", "),
          canal_venda: canalVenda,
          observacoes: customer.observacao,
          status: "pendente",
          unidade_id: unidadeAtual?.id,
        })
        .select("id")
        .single();

      if (pedidoError) throw pedidoError;

      const itensInsert = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));

      const { error: itensError } = await supabase.from("pedido_itens").insert(itensInsert);
      if (itensError) throw itensError;

      // #4 - Use shared stock update service
      await atualizarEstoqueVenda(itens.map((item) => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      })));

      // Receipt
      let empresaConfig: EmpresaConfig | undefined;
      try {
        const { data: configData } = await supabase
          .from("configuracoes_empresa")
          .select("nome_empresa, cnpj, telefone, endereco, mensagem_cupom")
          .limit(1)
          .single();
        if (configData) empresaConfig = configData;
      } catch (e) {
        console.warn("Não foi possível carregar configurações da empresa");
      }

      generateReceiptPdf({
        pedidoId: pedido.id,
        data: new Date(),
        cliente: { nome: customer.nome, telefone: customer.telefone, endereco: enderecoCompleto },
        itens,
        pagamentos,
        entregadorNome: entregador.nome,
        canalVenda,
        observacoes: customer.observacao,
        empresa: empresaConfig,
      });

      // #5 - Clear draft after successful sale
      clearDraft();

      toast({
        title: "Venda finalizada!",
        description: `Pedido #${pedido.id.slice(0, 6)} criado com sucesso. Comprovante gerado.`,
      });

      navigate("/vendas/pedidos");
    } catch (error: any) {
      console.error("Erro ao salvar venda:", error);
      toast({ title: "Erro ao salvar", description: error.message || "Ocorreu um erro ao finalizar a venda.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    if (itens.length > 0 || pagamentos.length > 0) {
      if (!confirm("Deseja realmente cancelar esta venda? Os dados serão perdidos.")) return;
    }
    clearDraft();
    navigate("/vendas/pedidos");
  };

  return (
    <MainLayout>
      {/* #1 - Single header, no duplicate */}
      <Header title="Nova Venda" subtitle={unidadeAtual?.nome || "Carregando..."} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">

        {/* #8 - Progress stepper */}
        <VendaStepper customer={customer} itens={itens} pagamentos={pagamentos} totalVenda={totalVenda} />

        {/* #7 - Repeat last sale button + badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            #{new Date().getTime().toString().slice(-6)}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRepetirUltimaVenda} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Repetir última venda
          </Button>
        </div>

        {/* #2 - AI Command Bar responsive */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <Input
                placeholder='Ex: "2 P13 para Maria, Rua Ceará 30, Centro"'
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !aiLoading && handleAiCommand()}
                className="bg-background flex-1 min-w-[200px]"
                disabled={aiLoading || isListening}
              />
              <div className="flex items-center gap-1">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={isListening ? stopListening : startListening}
                  disabled={aiLoading}
                  className={`shrink-0 h-9 w-9 ${isListening ? "animate-pulse" : ""}`}
                  title={isListening ? "Parar gravação" : "Comando por voz"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={aiLoading || photoLoading}
                  className="shrink-0 h-9 w-9"
                  title="Lançar vendas por foto"
                >
                  {photoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={aiLoading || photoLoading}
                  className="shrink-0 h-9 w-9"
                  title="Tirar foto da anotação"
                >
                  {photoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                <Button
                  id="ai-send-btn"
                  onClick={handleAiCommand}
                  disabled={aiLoading || !aiCommand.trim()}
                  size="sm"
                  className="shrink-0 gap-1"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="hidden sm:inline">{aiLoading ? "..." : "Enviar"}</span>
                </Button>
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoSales(file);
                e.target.value = "";
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoSales(file);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 ml-7">
              {photoLoading 
                ? "📸 Processando foto..."
                : isListening 
                ? "🔴 Ouvindo... Fale o comando."
                : "💡 Digite, 🎤 dite, ou 📷 tire foto de anotações."}
            </p>
          </CardContent>
        </Card>


        {/* Layout Principal */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Data de Entrega
                    </Label>
                    <Input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Canal de Venda</Label>
                    <Select value={canalVenda} onValueChange={setCanalVenda}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {allChannels.map((ch) => (
                          <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CustomerSearch value={customer} onChange={setCustomer} />
            <DeliveryPersonSelect value={entregador.id} onChange={handleSelecionarEntregador} endereco={customer.endereco} />
            <ProductSearch itens={itens} onChange={setItens} />
            <PaymentSection pagamentos={pagamentos} onChange={setPagamentos} totalVenda={totalVenda} />
          </div>

          <div className="space-y-4 md:space-y-6">
            <OrderSummary
              itens={itens}
              pagamentos={pagamentos}
              entregadorNome={entregador.nome}
              canalVenda={canalVenda}
              onFinalizar={handleFinalizar}
              onCancelar={handleCancelar}
              isLoading={isLoading}
            />
            <CustomerHistory clienteId={customer.id} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
