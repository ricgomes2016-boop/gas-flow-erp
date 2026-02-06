import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Search,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateReceiptPdf, EmpresaConfig } from "@/services/receiptPdfService";

import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";
import { PDVProductList, PDVItem } from "@/components/pdv/PDVProductList";
import { PDVPayment } from "@/components/pdv/PDVPayment";
import { PDVQuickProducts } from "@/components/pdv/PDVQuickProducts";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number | null;
  categoria?: string | null;
  tipo_botijao?: string | null;
  botijao_par_id?: string | null;
}

export default function PDV() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [itens, setItens] = useState<PDVItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Produto[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const total = itens.reduce((acc, item) => acc + item.total, 0);
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  // Focus search input on mount and handle keyboard shortcuts
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 - Finalizar venda
      if (e.key === "F12") {
        e.preventDefault();
        if (itens.length > 0) {
          setPaymentOpen(true);
        }
      }
      // Escape - Cancelar/Fechar
      if (e.key === "Escape") {
        if (paymentOpen) {
          setPaymentOpen(false);
        } else if (showResults) {
          setShowResults(false);
          setSearchResults([]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itens.length, paymentOpen, showResults]);

  // Search products
  const searchProdutos = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, preco, estoque, categoria, tipo_botijao, botijao_par_id")
        .eq("ativo", true)
        .or("tipo_botijao.is.null,tipo_botijao.neq.vazio")
        .ilike("nome", `%${term}%`)
        .limit(8);

      if (!error && data) {
        setSearchResults(data);
        setShowResults(data.length > 0);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  // Add product to cart
  const addProduct = useCallback((produto: Produto) => {
    setItens((prev) => {
      const existingIndex = prev.findIndex((i) => i.produto_id === produto.id);

      if (existingIndex >= 0) {
        const newItens = [...prev];
        newItens[existingIndex].quantidade += 1;
        newItens[existingIndex].total =
          newItens[existingIndex].quantidade * newItens[existingIndex].preco_unitario;
        return newItens;
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          produto_id: produto.id,
          nome: produto.nome,
          quantidade: 1,
          preco_unitario: produto.preco,
          total: produto.preco,
        },
      ];
    });

    setSearchTerm("");
    setShowResults(false);
    setSearchResults([]);
    searchInputRef.current?.focus();

    // Play beep sound
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQgAHoTPxaR2J...")
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  // Handle barcode scan
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    try {
      // Try to find product by barcode field first, then fallback to nome/ID
      let { data, error } = await supabase
        .from("produtos")
        .select("id, nome, preco, estoque, categoria, tipo_botijao, botijao_par_id")
        .eq("ativo", true)
        .eq("codigo_barras", barcode)
        .limit(1);

      // If not found by barcode, try nome/ID
      if (!data || data.length === 0) {
        const result = await supabase
          .from("produtos")
          .select("id, nome, preco, estoque, categoria, tipo_botijao, botijao_par_id")
          .eq("ativo", true)
          .or(`nome.ilike.%${barcode}%`)
          .limit(1);
        data = result.data;
        error = result.error;
      }

      if (error || !data || data.length === 0) {
        toast({
          title: "Produto não encontrado",
          description: `Código: ${barcode}`,
          variant: "destructive",
        });
        return;
      }

      addProduct(data[0]);
      toast({
        title: "Produto adicionado",
        description: data[0].nome,
      });
    } catch (error) {
      console.error("Erro ao buscar produto por código:", error);
    }
  }, [addProduct, toast]);

  // Update quantity
  const updateQuantity = (index: number, delta: number) => {
    setItens((prev) => {
      const newItens = [...prev];
      const newQtd = newItens[index].quantidade + delta;
      if (newQtd < 1) return prev;
      newItens[index].quantidade = newQtd;
      newItens[index].total = newQtd * newItens[index].preco_unitario;
      return newItens;
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear cart
  const clearCart = () => {
    if (itens.length > 0 && !confirm("Limpar todos os itens?")) return;
    setItens([]);
    searchInputRef.current?.focus();
  };

  // Finalize sale
  const finalizeSale = async (formaPagamento: string, valorRecebido: number) => {
    if (itens.length === 0) return;

    setIsLoading(true);

    try {
      // Create order
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          valor_total: total,
          forma_pagamento: formaPagamento,
          canal_venda: "portaria",
          status: "entregue", // PDV is immediate
          endereco_entrega: "Retirada no local",
        })
        .select("id")
        .single();

      if (pedidoError) throw pedidoError;

      // Create order items
      const itensInsert = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));

      const { error: itensError } = await supabase.from("pedido_itens").insert(itensInsert);
      if (itensError) throw itensError;

      // Update stock
      for (const item of itens) {
        const { data: produto } = await supabase
          .from("produtos")
          .select("id, estoque, categoria, tipo_botijao, botijao_par_id")
          .eq("id", item.produto_id)
          .single();

        if (produto) {
          const novoEstoque = Math.max(0, (produto.estoque || 0) - item.quantidade);
          await supabase
            .from("produtos")
            .update({ estoque: novoEstoque })
            .eq("id", item.produto_id);

          // If gas, increment empty cylinder
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

      // Get company config for receipt
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
      } catch {
        console.warn("Não foi possível carregar configurações da empresa");
      }

      // Generate receipt
      generateReceiptPdf({
        pedidoId: pedido.id,
        data: new Date(),
        cliente: {
          nome: "Consumidor Final",
          telefone: "",
          endereco: "Retirada no local",
        },
        itens,
        pagamentos: [{ id: "1", forma: formaPagamento, valor: total }],
        entregadorNome: null,
        canalVenda: "portaria",
        observacoes: "",
        empresa: empresaConfig,
      });

      toast({
        title: "Venda finalizada!",
        description: `Pedido #${pedido.id.slice(0, 6)} - R$ ${total.toFixed(2)}`,
      });

      // Reset
      setItens([]);
      setPaymentOpen(false);
      searchInputRef.current?.focus();
    } catch (error: any) {
      console.error("Erro ao finalizar venda:", error);
      toast({
        title: "Erro ao finalizar",
        description: error.message || "Ocorreu um erro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/vendas")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PDV - Portaria</h1>
              <p className="text-xs text-muted-foreground">Venda rápida para retirada no local</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Left: Products */}
          <Card className="lg:col-span-2 flex flex-col min-h-0">
            <CardHeader className="pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchProdutos(e.target.value);
                    }}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchResults.length > 0) {
                        addProduct(searchResults[0]);
                      }
                    }}
                  />
                  
                  {/* Search Results Dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
                      {searchResults.map((produto) => (
                        <button
                          key={produto.id}
                          className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-0 flex justify-between items-center"
                          onClick={() => addProduct(produto)}
                        >
                          <div>
                            <p className="font-medium text-sm">{produto.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              Estoque: {produto.estoque ?? 0}
                            </p>
                          </div>
                          <span className="font-semibold text-primary">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <BarcodeScanner
                  isActive={scannerActive}
                  onToggle={() => setScannerActive(!scannerActive)}
                  onScan={handleBarcodeScan}
                />
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col min-h-0 pt-2">
              {/* Quick Products Grid */}
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Produtos Rápidos</p>
                <PDVQuickProducts onSelectProduct={addProduct} />
              </div>

              <Separator className="my-2" />

              {/* Cart Items */}
              <PDVProductList
                itens={itens}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            </CardContent>
          </Card>

          {/* Right: Summary */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Itens</span>
                  <span className="font-medium">{totalItens}</span>
                </div>
                
                <Separator />

                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-5xl font-bold text-primary">
                    R$ {total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-auto">
                <Button
                  className="w-full h-14 text-lg"
                  size="lg"
                  disabled={itens.length === 0}
                  onClick={() => setPaymentOpen(true)}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Finalizar (F12)
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                  disabled={itens.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => navigate("/vendas")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <PDVPayment
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          total={total}
          onConfirm={finalizeSale}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  );
}
