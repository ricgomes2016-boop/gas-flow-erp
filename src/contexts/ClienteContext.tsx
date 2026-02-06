import { createContext, useContext, useState, ReactNode } from "react";

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
}

const ClienteContext = createContext<ClienteContextType | undefined>(undefined);

// Mock products
const mockProducts: Product[] = [
  { id: "1", name: "Gás P13", description: "Botijão 13kg - Residencial", price: 110.00, image: "🔵", category: "Botijão" },
  { id: "2", name: "Gás P45", description: "Cilindro 45kg - Comercial", price: 380.00, image: "🟢", category: "Cilindro" },
  { id: "3", name: "Água Mineral 20L", description: "Galão 20 litros", price: 12.00, image: "💧", category: "Água" },
];

export function ClienteProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(25.00);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([
    {
      id: "1",
      type: "credit",
      amount: 15.00,
      description: "Bônus de indicação",
      date: new Date(2024, 0, 15),
      referralName: "Maria Silva"
    },
    {
      id: "2",
      type: "credit",
      amount: 10.00,
      description: "Bônus de indicação",
      date: new Date(2024, 0, 20),
      referralName: "João Santos"
    }
  ]);
  
  const [referralCode] = useState("CLIENTE" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [referralCount] = useState(2);
  
  const [valesGas, setValesGas] = useState<ValeGas[]>([
    {
      id: "1",
      code: "VG-2024-001",
      value: 50.00,
      partner: "Supermercado Central",
      expiryDate: new Date(2024, 5, 30),
      used: false
    },
    {
      id: "2",
      code: "VG-2024-002",
      value: 110.00,
      partner: "GásExpress",
      expiryDate: new Date(2024, 11, 31),
      used: false
    }
  ]);
  
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: "order-001",
      date: new Date(),
      items: [{ ...mockProducts[0], quantity: 1 }, { ...mockProducts[2], quantity: 2 }],
      total: 134.00,
      paymentMethod: "PIX",
      status: "confirmed"
    },
    {
      id: "1",
      date: new Date(2024, 0, 10),
      items: [{ ...mockProducts[0], quantity: 1 }],
      total: 110.00,
      paymentMethod: "PIX",
      status: "delivered"
    },
    {
      id: "2",
      date: new Date(2024, 0, 25),
      items: [{ ...mockProducts[0], quantity: 1 }, { ...mockProducts[2], quantity: 2 }],
      total: 134.00,
      paymentMethod: "Dinheiro",
      status: "delivered"
    }
  ]);

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
      "VERAO2024": { discount: 15, message: "15% de desconto de verão!" }
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
      applyCoupon
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
