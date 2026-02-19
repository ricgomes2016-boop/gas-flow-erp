import { useState, useEffect } from "react";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCliente } from "@/contexts/ClienteContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Minus, ShoppingCart, Flame, Droplets, Package, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ProdutoDB {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  image_url: string | null;
  estoque: number | null;
}

const categoryIcons: Record<string, typeof Flame> = {
  gas: Flame,
  agua: Droplets,
};

const categories = ["Todos", "gas", "agua", "acessorios"];
const categoryLabels: Record<string, string> = {
  Todos: "Todos",
  gas: "Gás",
  agua: "Água",
  acessorios: "Acessórios",
};

interface UltimoPedido {
  id: string;
  valor_total: number;
  created_at: string;
  itens: { nome: string; quantidade: number; produto_id: string; preco: number }[];
}

export default function ClienteHome() {
  const { addToCart, cartItemsCount, cart } = useCliente();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [produtos, setProdutos] = useState<ProdutoDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ultimoPedido, setUltimoPedido] = useState<UltimoPedido | null>(null);

  const { lojaSelecionadaId } = useCliente();

  useEffect(() => {
    setIsLoading(true);
    const fetchProdutos = async () => {
      try {
        let query = supabase
          .from("produtos")
          .select("id, nome, descricao, preco, categoria, image_url, estoque")
          .eq("ativo", true)
          .or("tipo_botijao.is.null,tipo_botijao.neq.vazio")
          .order("nome");

        if (lojaSelecionadaId) {
          query = query.eq("unidade_id", lojaSelecionadaId);
        }

        const { data, error } = await query;

        if (!error && data) {
          setProdutos(data);
        }
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProdutos();
  }, [lojaSelecionadaId]);

  // Fetch último pedido do cliente
  useEffect(() => {
    const fetchUltimoPedido = async () => {
      if (!user) return;

      const { data: clienteData } = await supabase
        .from("clientes")
        .select("id")
        .eq("email", user.email || "")
        .maybeSingle();

      if (!clienteData) return;

      const { data } = await supabase
        .from("pedidos")
        .select(`
          id, valor_total, created_at,
          pedido_itens (quantidade, preco_unitario, produto_id, produtos:produto_id (nome))
        `)
        .eq("cliente_id", clienteData.id)
        .eq("status", "entregue")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setUltimoPedido({
          id: data.id,
          valor_total: data.valor_total || 0,
          created_at: data.created_at,
          itens: ((data as any).pedido_itens || []).map((i: any) => ({
            nome: i.produtos?.nome || "Produto",
            quantidade: i.quantidade,
            produto_id: i.produto_id,
            preco: i.preco_unitario,
          })),
        });
      }
    };
    fetchUltimoPedido();
  }, [user]);

  const filteredProducts = produtos.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(search.toLowerCase()) ||
      (product.descricao || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, qty: number) => {
    if (qty < 1) qty = 1;
    if (qty > 10) qty = 10;
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = (product: ProdutoDB) => {
    const qty = getQuantity(product.id);
    addToCart({
      id: product.id,
      name: product.nome,
      description: product.descricao || "",
      price: product.preco,
      image: product.image_url || "📦",
      category: product.categoria || "outros"
    }, qty);
    toast.success(`${qty}x ${product.nome} adicionado ao carrinho!`);
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    return item?.quantity || 0;
  };

  const handleRepetirUltimoPedido = () => {
    if (!ultimoPedido) return;
    ultimoPedido.itens.forEach(item => {
      addToCart({
        id: item.produto_id,
        name: item.nome,
        description: "",
        price: item.preco,
        image: "📦",
        category: "",
      }, item.quantidade);
    });
    toast.success("Itens do último pedido adicionados ao carrinho!");
  };

  const ProductIcon = (cat: string | null) => categoryIcons[cat || ""] || Package;

  return (
    <ClienteLayout cartItemsCount={cartItemsCount}>
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-4">
            <h1 className="text-xl font-bold">Olá! 👋</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Peça seu gás e receba em casa rapidinho!
            </p>
          </CardContent>
        </Card>

        {/* Repetir último pedido */}
        {ultimoPedido && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 text-primary" />
                    Pedir de novo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {ultimoPedido.itens.map(i => `${i.quantidade}x ${i.nome}`).join(", ")}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">
                    R$ {ultimoPedido.valor_total.toFixed(2)}
                  </p>
                </div>
                <Button size="sm" onClick={handleRepetirUltimoPedido} className="shrink-0 gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {categoryLabels[category] || category}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => {
              const cartQty = getCartQuantity(product.id);
              const Icon = ProductIcon(product.categoria);
              
              return (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.nome} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Icon className="h-10 w-10 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{product.nome}</h3>
                            <p className="text-sm text-muted-foreground">{product.descricao}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {categoryLabels[product.categoria || ""] || product.categoria || "Outros"}
                            </Badge>
                          </div>
                          {cartQty > 0 && (
                            <Badge className="bg-primary shrink-0">
                              {cartQty} no carrinho
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-primary">
                            R$ {product.preco.toFixed(2)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {getQuantity(product.id)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              className="gap-1"
                              disabled={(product.estoque ?? 0) === 0}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
