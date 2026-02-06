import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateReceiptPdf, EmpresaConfig } from "@/services/receiptPdfService";

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

      navigate("/vendas");
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
    navigate("/vendas");
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nova Venda</h1>
              <p className="text-sm text-muted-foreground">Matriz</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            #{new Date().getTime().toString().slice(-6)}
          </Badge>
        </div>

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
