import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar, ShoppingBag, Sparkles, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateReceiptPdf, EmpresaConfig } from "@/services/receiptPdfService";
import { useUnidade } from "@/contexts/UnidadeContext";

// Componentes refatorados
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

export default function NovaVenda() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unidadeAtual } = useUnidade();

  // Estados
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

  const handleAiCommand = async () => {
    if (!aiCommand.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-sales-command", {
        body: { comando: aiCommand },
      });

      if (error) throw error;

      // Set customer
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
            endereco: clienteData.endereco || "",
            numero: "",
            complemento: "",
            bairro: clienteData.bairro || "",
            cep: clienteData.cep || "",
            observacao: data.observacoes || "",
          });
        }
      } else if (data.cliente_nome) {
        setCustomer({ ...initialCustomerData, nome: data.cliente_nome, observacao: data.observacoes || "" });
      }

      // Set items
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

      // Set payment
      if (data.forma_pagamento) {
        const totalItens = (data.itens || []).reduce((a: number, i: any) => a + (i.quantidade || 1) * i.preco_unitario, 0);
        setPagamentos([{ id: crypto.randomUUID(), forma: data.forma_pagamento, valor: totalItens }]);
      }

      // Set channel
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

  const totalVenda = itens.reduce((acc, item) => acc + item.total, 0);

  const handleSelecionarEntregador = (id: string, nome: string) => {
    setEntregador({ id, nome });
    toast({
      title: "Entregador selecionado!",
      description: `${nome} foi atribuído a esta venda.`,
    });
  };

  const handleFinalizar = async () => {
    if (itens.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }

    const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
    if (totalPago < totalVenda) {
      toast({
        title: "Pagamento incompleto",
        description: `Falta pagar R$ ${(totalVenda - totalPago).toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar o pedido
      const enderecoCompleto = [
        customer.endereco,
        customer.numero && `Nº ${customer.numero}`,
        customer.complemento,
        customer.bairro,
      ]
        .filter(Boolean)
        .join(", ");

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

      // Criar os itens do pedido
      const itensInsert = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));

      const { error: itensError } = await supabase.from("pedido_itens").insert(itensInsert);

      if (itensError) throw itensError;

      // Atualizar estoque dos produtos
      for (const item of itens) {
        // Buscar dados do produto para verificar se é gás
        const { data: produto } = await supabase
          .from("produtos")
          .select("id, estoque, categoria, tipo_botijao, botijao_par_id")
          .eq("id", item.produto_id)
          .single();

        if (produto) {
          // Decrementar estoque do produto vendido
          const novoEstoque = Math.max(0, (produto.estoque || 0) - item.quantidade);
          await supabase
            .from("produtos")
            .update({ estoque: novoEstoque })
            .eq("id", item.produto_id);

          // Se for botijão de gás cheio, incrementar o estoque do vazio correspondente
          if (produto.categoria === "gas" && produto.tipo_botijao === "cheio" && produto.botijao_par_id) {
            const { data: produtoVazio } = await supabase
              .from("produtos")
              .select("id, estoque")
              .eq("id", produto.botijao_par_id)
              .single();

            if (produtoVazio) {
              await supabase
                .from("produtos")
                .update({ estoque: (produtoVazio.estoque || 0) + item.quantidade })
                .eq("id", produtoVazio.id);
            }
          }
        }
      }

      // Buscar configurações da empresa para o comprovante
      let empresaConfig: EmpresaConfig | undefined;
      try {
        const { data: configData } = await supabase
          .from("configuracoes_empresa")
          .select("nome_empresa, cnpj, telefone, endereco, mensagem_cupom")
          .limit(1)
          .single();
        
        if (configData) {
          empresaConfig = configData;
        }
      } catch (e) {
        console.warn("Não foi possível carregar configurações da empresa, usando padrão");
      }

      // Gerar comprovante PDF
      generateReceiptPdf({
        pedidoId: pedido.id,
        data: new Date(),
        cliente: {
          nome: customer.nome,
          telefone: customer.telefone,
          endereco: enderecoCompleto,
        },
        itens,
        pagamentos,
        entregadorNome: entregador.nome,
        canalVenda,
        observacoes: customer.observacao,
        empresa: empresaConfig,
      });

      toast({
        title: "Venda finalizada!",
        description: `Pedido #${pedido.id.slice(0, 6)} criado com sucesso. Comprovante gerado.`,
      });

      navigate("/vendas/pedidos");
    } catch (error: any) {
      console.error("Erro ao salvar venda:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao finalizar a venda.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    if (itens.length > 0 || pagamentos.length > 0) {
      if (!confirm("Deseja realmente cancelar esta venda? Os dados serão perdidos.")) {
        return;
      }
    }
    navigate("/vendas/pedidos");
  };

  return (
    <MainLayout>
      <Header title="Nova Venda" subtitle="Registrar nova venda" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nova Venda</h1>
              <p className="text-sm text-muted-foreground">{unidadeAtual?.nome || "Carregando..."}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            #{new Date().getTime().toString().slice(-6)}
          </Badge>
        </div>

        {/* AI Command Bar */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <Input
                placeholder='Ex: "Lançar 2 P13 para Maria Silva no pix" ou "venda para João, botijão P45, dinheiro"'
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !aiLoading && handleAiCommand()}
                className="bg-background"
                disabled={aiLoading}
              />
              <Button onClick={handleAiCommand} disabled={aiLoading || !aiCommand.trim()} size="sm" className="shrink-0 gap-1">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {aiLoading ? "Interpretando..." : "Enviar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 ml-7">
              💡 Digite um comando em linguagem natural para pré-preencher a venda automaticamente com IA
            </p>
          </CardContent>
        </Card>
        {/* Layout Principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data e Canal */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Data de Entrega
                    </Label>
                    <Input
                      type="date"
                      value={dataEntrega}
                      onChange={(e) => setDataEntrega(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Canal de Venda</Label>
                    <Select value={canalVenda} onValueChange={setCanalVenda}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telefone">📞 Telefone</SelectItem>
                        <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                        <SelectItem value="portaria">🏢 Portaria</SelectItem>
                        <SelectItem value="balcao">🏪 Balcão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cliente */}
            <CustomerSearch value={customer} onChange={setCustomer} />

            {/* Entregador */}
            <DeliveryPersonSelect
              value={entregador.id}
              onChange={handleSelecionarEntregador}
              endereco={customer.endereco}
            />

            {/* Produtos */}
            <ProductSearch itens={itens} onChange={setItens} />

            {/* Pagamento */}
            <PaymentSection
              pagamentos={pagamentos}
              onChange={setPagamentos}
              totalVenda={totalVenda}
            />
          </div>

          {/* Coluna Direita - Resumo e Histórico */}
          <div className="space-y-6">
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
