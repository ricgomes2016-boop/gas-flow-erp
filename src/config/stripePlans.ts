export interface PlanConfig {
  name: string;
  key: string;
  priceId: string;
  productId: string;
  price: number; // BRL cents per unit/month
  usersPerUnit: number;
  extraUserPriceId: string | null;
  extraUserPrice: number | null; // BRL cents
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  basico: {
    name: "Básico",
    key: "basico",
    priceId: "price_1T4AxoKFbi1wlhwogq8f5MwU",
    productId: "prod_U2FSsEI6wsrEt4",
    price: 9900,
    usersPerUnit: 5,
    extraUserPriceId: null,
    extraUserPrice: null,
    features: [
      "5 usuários por unidade",
      "Vendas e Estoque",
      "Entregas e Caixa",
      "Relatórios essenciais",
    ],
  },
  standard: {
    name: "Standard",
    key: "standard",
    priceId: "price_1T4Ay3KFbi1wlhwoiwjL8EIw",
    productId: "prod_U2FSEvwNN4s9rb",
    price: 24900,
    usersPerUnit: 10,
    extraUserPriceId: "price_1T4AyWKFbi1wlhwoX0CBW1um",
    extraUserPrice: 2990,
    features: [
      "10 usuários por unidade",
      "Tudo do Básico",
      "Financeiro completo",
      "RH e Comissões",
      "Assistente IA",
      "Dashboards avançados",
      "Usuário extra: R$29,90/mês",
    ],
  },
  enterprise: {
    name: "Enterprise",
    key: "enterprise",
    priceId: "price_1T4AyJKFbi1wlhwonPd0E32i",
    productId: "prod_U2FTkMy6YfFPmF",
    price: 49900,
    usersPerUnit: 20,
    extraUserPriceId: "price_1T4AyiKFbi1wlhwop8fE0vut",
    extraUserPrice: 4990,
    features: [
      "20 usuários por unidade",
      "Tudo do Standard",
      "Fiscal (NF-e, CT-e)",
      "Frota completa",
      "API e Integrações",
      "Suporte prioritário",
      "Usuário extra: R$49,90/mês",
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
