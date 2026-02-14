import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Settings2,
  Users,
  Package,
  
  CreditCard,
  Truck,
  HardHat,
  Settings,
  LogOut,
  Flame,
  Menu,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  submenu?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  {
    icon: ShoppingCart,
    label: "Vendas",
    submenu: [
      { label: "PDV", path: "/vendas/pdv" },
      { label: "Nova Venda", path: "/vendas/nova" },
      { label: "Pedidos", path: "/vendas/pedidos" },
      { label: "Relatório de Vendas", path: "/vendas/relatorio" },
    ],
  },
  {
    icon: Wallet,
    label: "Caixa",
    submenu: [
      { label: "Acerto Diário Entregador", path: "/caixa/acerto" },
      { label: "Caixa do Dia", path: "/caixa/dia" },
      { label: "Despesas (Sangria)", path: "/caixa/despesas" },
    ],
  },
  {
    icon: Settings2,
    label: "Gestão Operacional",
    submenu: [
      { label: "Cockpit do Gestor", path: "/operacional/cockpit" },
      { label: "Central de Indicadores", path: "/operacional/indicadores" },
      { label: "Centro de Operações", path: "/operacional/centro" },
      { label: "Alertas Inteligentes", path: "/operacional/alertas" },
      { label: "Rotas de Entrega", path: "/operacional/rotas" },
      { label: "Escalas de Entregadores", path: "/operacional/escalas" },
      { label: "Análise de Concorrência", path: "/operacional/concorrencia" },
      { label: "Conselhos IA", path: "/operacional/ia" },
      { label: "DRE", path: "/operacional/dre" },
      { label: "Metas e Desafios", path: "/operacional/metas" },
      { label: "Planejamento Anual", path: "/operacional/anual" },
      { label: "Planejamento Financeiro - Mês", path: "/operacional/mensal" },
      { label: "Canais de Venda", path: "/operacional/canais-venda" },
      { label: "Fornecedores", path: "/cadastros/fornecedores" },
    ],
  },
  {
    icon: Users,
    label: "Gestão de Clientes",
    submenu: [
      { label: "Clientes", path: "/clientes/cadastro" },
      { label: "Campanhas", path: "/clientes/campanhas" },
      { label: "Fidelidade / Indicações", path: "/clientes/fidelidade" },
      { label: "CRM", path: "/clientes/crm" },
      { label: "Ranking dos Clientes", path: "/clientes/ranking" },
    ],
  },
  {
    icon: Package,
    label: "Gestão de Estoque",
    submenu: [
      { label: "Produtos", path: "/cadastros/produtos" },
      { label: "Compras", path: "/estoque/compras" },
      { label: "Comodatos", path: "/estoque/comodatos" },
      { label: "Estoque em Rota", path: "/estoque/rota" },
      { label: "MCMM", path: "/estoque/mcmm" },
    ],
  },
  {
    icon: CreditCard,
    label: "Gestão Financeira",
    submenu: [
      { label: "Fluxo de Caixa", path: "/financeiro/fluxo" },
      { label: "Previsão de Caixa", path: "/financeiro/previsao" },
      { label: "Contas a Pagar", path: "/financeiro/pagar" },
      { label: "Contas a Receber", path: "/financeiro/receber" },
      { label: "Aprovar Despesas", path: "/financeiro/aprovar" },
      { label: "Conciliação (OFX / CSV)", path: "/financeiro/conciliacao" },
      { label: "Contador", path: "/financeiro/contador" },
      { label: "Vale Gás - Parceiros", path: "/financeiro/vale-gas/parceiros" },
      { label: "Vale Gás - Emissão", path: "/financeiro/vale-gas/emissao" },
      { label: "Vale Gás - Controle", path: "/financeiro/vale-gas/controle" },
      { label: "Vale Gás - Acerto", path: "/financeiro/vale-gas/acerto" },
      { label: "Vale Gás - Relatório", path: "/financeiro/vale-gas/relatorio" },
    ],
  },
  {
    icon: Truck,
    label: "Gestão de Frota",
    submenu: [
      { label: "Veículos", path: "/cadastros/veiculos" },
      { label: "Controle de Combustível", path: "/frota/combustivel" },
      { label: "Manutenção", path: "/frota/manutencao" },
      { label: "Relatórios", path: "/frota/relatorios" },
      { label: "Gamificação", path: "/frota/gamificacao" },
    ],
  },
  {
    icon: HardHat,
    label: "Gestão de RH",
    submenu: [
      { label: "Funcionários", path: "/cadastros/funcionarios" },
      { label: "Entregadores", path: "/cadastros/entregadores" },
      { label: "Folha de Pagamento", path: "/rh/folha" },
      { label: "Vale Funcionário", path: "/rh/vale" },
      { label: "Comissão do Entregador", path: "/rh/comissao" },
      { label: "Premiação", path: "/rh/premiacao" },
      { label: "Bônus", path: "/rh/bonus" },
      { label: "Alerta Jornada", path: "/rh/jornada" },
      { label: "Banco de Horas", path: "/rh/banco-horas" },
      { label: "Horários", path: "/rh/horarios" },
      { label: "Prevenção Trabalhista - IA", path: "/rh/prevencao-ia" },
      { label: "Produtividade - IA", path: "/rh/produtividade-ia" },
    ],
  },
  {
    icon: Settings,
    label: "Configurações",
    submenu: [
      { label: "Usuários", path: "/config/usuarios" },
      { label: "Unidades / Lojas", path: "/config/unidades" },
      { label: "Auditoria", path: "/config/auditoria" },
      { label: "Permissões", path: "/config/permissoes" },
    ],
  },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    setOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 border-none">
        <div className="bg-slate-900 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-700">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Gas Express25</h2>
              <p className="text-xs text-slate-400">Gestão de Gás</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.submenu) {
                const isSubmenuOpen = openMenus.includes(item.label);
                const hasActiveItem = item.submenu.some((sub) => isActive(sub.path));

                return (
                  <Collapsible
                    key={item.label}
                    open={isSubmenuOpen}
                    onOpenChange={() => toggleMenu(item.label)}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                          hasActiveItem
                            ? "bg-amber-500/20 text-amber-400"
                            : "text-slate-300 hover:bg-slate-800"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isSubmenuOpen && "rotate-180"
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm transition-colors",
                            isActive(sub.path)
                              ? "bg-amber-500 text-white"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive(item.path!)
                      ? "bg-amber-500 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
