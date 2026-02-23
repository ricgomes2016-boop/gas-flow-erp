export interface PlanConfig {
  name: string;
  priceId: string;
  productId: string;
  price: number; // BRL cents
  maxUsuarios: number;
  maxUnidades: number;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    name: "Starter",
    priceId: "price_1T4889KFbi1wlhwo1T6C87MW",
    productId: "prod_U2CX9CLMCiDpub",
    price: 9900,
    maxUsuarios: 5,
    maxUnidades: 1,
    features: [
      "1 unidade",
      "5 usuários",
      "Vendas e Estoque",
      "Entregas básicas",
      "Relatórios essenciais",
    ],
  },
  pro: {
    name: "Pro",
    priceId: "price_1T488TKFbi1wlhwoCnnQEgUk",
    productId: "prod_U2CXsJiGAM15xk",
    price: 24900,
    maxUsuarios: 15,
    maxUnidades: 3,
    features: [
      "3 unidades",
      "15 usuários",
      "Tudo do Starter",
      "Financeiro completo",
      "RH e Comissões",
      "Assistente IA",
      "Dashboards avançados",
    ],
  },
  enterprise: {
    name: "Enterprise",
    priceId: "price_1T488iKFbi1wlhwoDPrN38cn",
    productId: "prod_U2CXWIn1WU9ct0",
    price: 49900,
    maxUsuarios: 50,
    maxUnidades: 10,
    features: [
      "10 unidades",
      "50 usuários",
      "Tudo do Pro",
      "Fiscal (NF-e, CT-e)",
      "Frota completa",
      "API e Integrações",
      "Suporte prioritário",
    ],
  },
};

export function getPlanByProductId(productId: string): PlanConfig | null {
  return Object.values(PLANS).find((p) => p.productId === productId) || null;
}

export function getPlanKey(productId: string): string | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.productId === productId) return key;
  }
  return null;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
