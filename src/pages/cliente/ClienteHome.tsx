import { useState } from "react";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCliente } from "@/contexts/ClienteContext";
import { Search, Plus, Minus, ShoppingCart, Flame, Droplets, Package } from "lucide-react";
import { toast } from "sonner";

const products = [
  { id: "1", name: "Gás P13", description: "Botijão 13kg - Residencial", price: 110.00, image: "🔵", category: "Botijão", icon: Flame },
  { id: "2", name: "Gás P45", description: "Cilindro 45kg - Comercial", price: 380.00, image: "🟢", category: "Cilindro", icon: Flame },
  { id: "3", name: "Gás P20", description: "Cilindro 20kg - Comercial", price: 180.00, image: "🟡", category: "Cilindro", icon: Flame },
  { id: "4", name: "Água Mineral 20L", description: "Galão 20 litros", price: 12.00, image: "💧", category: "Água", icon: Droplets },
  { id: "5", name: "Água Mineral 10L", description: "Galão 10 litros", price: 8.00, image: "💧", category: "Água", icon: Droplets },
  { id: "6", name: "Registro Regulador", description: "Regulador de pressão", price: 45.00, image: "⚙️", category: "Acessórios", icon: Package },
  { id: "7", name: "Mangueira 1,5m", description: "Mangueira para gás", price: 35.00, image: "🔧", category: "Acessórios", icon: Package },
];

const categories = ["Todos", "Botijão", "Cilindro", "Água", "Acessórios"];

export default function ClienteHome() {
  const { addToCart, cartItemsCount, cart } = useCliente();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, qty: number) => {
    if (qty < 1) qty = 1;
    if (qty > 10) qty = 10;
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const qty = getQuantity(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category
    }, qty);
    toast.success(`${qty}x ${product.name} adicionado ao carrinho!`);
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    return item?.quantity || 0;
  };

  return (
    <ClienteLayout cartItemsCount={cartItemsCount}>
      <div className="space-y-4">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-4">
            <h1 className="text-xl font-bold">Olá! 👋</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Peça seu gás e receba em casa rapidinho!
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(product => {
            const cartQty = getCartQuantity(product.id);
            const ProductIcon = product.icon;
            
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image/Icon */}
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl shrink-0">
                      <ProductIcon className="h-10 w-10 text-primary" />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {product.category}
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
                          R$ {product.price.toFixed(2)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {/* Quantity Selector */}
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
                          
                          {/* Add Button */}
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="gap-1"
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
