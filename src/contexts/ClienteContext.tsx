import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: Date;
  referralName?: string;
}

interface ValeGas {
  id: string;
  code: string;
  value: number;
  partner: string;
  expiryDate: Date;
  used: boolean;
}

interface Purchase {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: "pending" | "confirmed" | "delivered";
  discountApplied?: number;
}

export interface LojaOption {
  id: string;
  nome: string;
  cidade: string | null;
  bairro: string | null;
}

interface ClienteContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;
  
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  useWalletBalance: (amount: number) => void;
  
  referralCode: string;
  referralCount: number;
  
  valesGas: ValeGas[];
  
  purchases: Purchase[];
  addPurchase: (purchase: Omit<Purchase, "id">) => void;
  
  applyCoupon: (code: string) => { valid: boolean; discount: number; message: string };

  // Loja selecionada
  lojas: LojaOption[];
  lojaSelecionadaId: string | null;
  setLojaSelecionadaId: (id: string) => void;
  lojasLoading: boolean;
}

const ClienteContext = createContext<ClienteContextType | undefined>(undefined);

export function ClienteProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  
  const [referralCode] = useState("CLIENTE" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [referralCount] = useState(0);
  
  const [valesGas] = useState<ValeGas[]>([]);
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Loja
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [lojaSelecionadaId, setLojaSelecionadaIdState] = useState<string | null>(
    localStorage.getItem("cliente_loja_id")
  );
  const [lojasLoading, setLojasLoading] = useState(true);

  useEffect(() => {
    const fetchLojas = async () => {
      const { data } = await supabase
        .from("unidades")
        .select("id, nome, cidade, bairro")
        .eq("ativo", true)
        .order("nome");
      if (data && data.length > 0) {
        setLojas(data);
        // Auto-select if only one or if saved is valid
        const saved = localStorage.getItem("cliente_loja_id");
        if (saved && data.some(l => l.id === saved)) {
          setLojaSelecionadaIdState(saved);
        } else if (data.length === 1) {
          setLojaSelecionadaIdState(data[0].id);
          localStorage.setItem("cliente_loja_id", data[0].id);
        }
      }
      setLojasLoading(false);
    };
    fetchLojas();
  }, []);

  const setLojaSelecionadaId = (id: string) => {
    setLojaSelecionadaIdState(id);
    localStorage.setItem("cliente_loja_id", id);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const useWalletBalance = (amount: number) => {
    if (amount > walletBalance) return;
    setWalletBalance(prev => prev - amount);
    setWalletTransactions(prev => [
      {
        id: Date.now().toString(),
        type: "debit",
        amount,
        description: "Usado em compra",
        date: new Date()
      },
      ...prev
    ]);
  };

  const addPurchase = (purchase: Omit<Purchase, "id">) => {
    setPurchases(prev => [
      { ...purchase, id: Date.now().toString() },
      ...prev
    ]);
    clearCart();
  };

  const applyCoupon = (code: string) => {
    const coupons: Record<string, { discount: number; message: string }> = {
      "PRIMEIRACOMPRA": { discount: 10, message: "10% de desconto na primeira compra!" },
      "FIDELIDADE": { discount: 5, message: "5% de desconto para cliente fiel!" },
    };
    
    const coupon = coupons[code.toUpperCase()];
    if (coupon) {
      return { valid: true, ...coupon };
    }
    return { valid: false, discount: 0, message: "Cupom inválido ou expirado" };
  };

  return (
    <ClienteContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemsCount,
      walletBalance,
      walletTransactions,
      useWalletBalance,
      referralCode,
      referralCount,
      valesGas,
      purchases,
      addPurchase,
      applyCoupon,
      lojas,
      lojaSelecionadaId,
      setLojaSelecionadaId,
      lojasLoading,
    }}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error("useCliente must be used within ClienteProvider");
  }
  return context;
}
