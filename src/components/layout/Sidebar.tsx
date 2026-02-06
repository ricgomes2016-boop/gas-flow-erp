import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Settings2,
  Users,
  Package,
  FolderOpen,
  CreditCard,
  Truck,
  HardHat,
  Settings,
  LogOut,
  Flame,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      { label: "Nova Venda", path: "/vendas/nova" },
      { label: "Pedidos", path: "/vendas/pedidos" },
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
      { label: "Conselhos IA", path: "/operacional/ia" },
      { label: "Dashboard Executivo", path: "/operacional/executivo" },
      { label: "Dashboard Avançado", path: "/operacional/avancado" },
      { label: "Dashboard Trabalhista", path: "/operacional/trabalhista" },
      { label: "Dashboard Logístico", path: "/operacional/logistico" },
      { label: "DRE", path: "/operacional/dre" },
      { label: "Metas e Desafios", path: "/operacional/metas" },
      { label: "Mapa dos Entregadores", path: "/operacional/mapa" },
      { label: "Planejamento Anual", path: "/operacional/anual" },
      { label: "Planejamento Financeiro - Mês", path: "/operacional/mensal" },
    ],
  },
  {
    icon: Users,
    label: "Gestão de Clientes",
    submenu: [
      { label: "Cadastro de Clientes", path: "/clientes/cadastro" },
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
      { label: "Compras", path: "/estoque/compras" },
      { label: "Comodatos", path: "/estoque/comodatos" },
      { label: "Estoque em Rota", path: "/estoque/rota" },
      { label: "MCMM", path: "/estoque/mcmm" },
    ],
  },
  {
    icon: FolderOpen,
    label: "Cadastros",
    submenu: [
      { label: "Clientes", path: "/cadastros/clientes" },
      { label: "Fornecedores", path: "/cadastros/fornecedores" },
      { label: "Veículos", path: "/cadastros/veiculos" },
      { label: "Funcionários", path: "/cadastros/funcionarios" },
      { label: "Produtos", path: "/cadastros/produtos" },
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
    ],
  },
  {
    icon: Truck,
    label: "Gestão de Frota",
    submenu: [
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
      { label: "Auditoria", path: "/config/auditoria" },
      { label: "Permissões", path: "/config/permissoes" },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isSubmenuOpen = (label: string) => openMenus.includes(label);

  const isActive = (path?: string) => path && location.pathname === path;

  const isSubmenuActive = (submenu?: { label: string; path: string }[]) =>
    submenu?.some((item) => location.pathname === item.path);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              Gas Express25
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 flex-shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Store Selector */}
      {!collapsed && (
        <div className="border-b border-sidebar-border p-3">
          <Select defaultValue="matriz">
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <Store className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Selecione a loja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matriz">Matriz</SelectItem>
              <SelectItem value="filial1">Filial 1</SelectItem>
              <SelectItem value="filial2">Filial 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const hasSubmenu = !!item.submenu;
            const isOpen = isSubmenuOpen(item.label);
            const isItemActive = isActive(item.path);
            const isChildActive = isSubmenuActive(item.submenu);

            return (
              <div key={item.label}>
                {/* Menu Item */}
                {item.path ? (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isItemActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                ) : (
                  <button
                    onClick={() => !collapsed && toggleSubmenu(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isChildActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {hasSubmenu && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                        )}
                      </>
                    )}
                  </button>
                )}

                {/* Submenu */}
                {hasSubmenu && !collapsed && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={cn(
                            "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                            isActive(subItem.path)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer - Logout */}
      <div className="border-t border-sidebar-border p-2">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-foreground/70">Logado como</p>
            <p className="text-sm font-medium text-sidebar-foreground">
              Administrador
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
