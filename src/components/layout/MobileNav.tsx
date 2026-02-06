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
      { label: "Relatório", path: "/vendas/relatorio" },
    ],
  },
  {
    icon: Wallet,
    label: "Caixa",
    submenu: [
      { label: "Acerto Entregador", path: "/caixa/acerto" },
      { label: "Caixa do Dia", path: "/caixa/dia" },
      { label: "Despesas", path: "/caixa/despesas" },
    ],
  },
  {
    icon: Package,
    label: "Estoque",
    submenu: [
      { label: "Compras", path: "/estoque/compras" },
      { label: "Comodatos", path: "/estoque/comodatos" },
      { label: "Estoque Rota", path: "/estoque/rota" },
    ],
  },
  {
    icon: Users,
    label: "Clientes",
    submenu: [
      { label: "Cadastro", path: "/clientes/cadastro" },
      { label: "Campanhas", path: "/clientes/campanhas" },
      { label: "Fidelidade", path: "/clientes/fidelidade" },
    ],
  },
  {
    icon: FolderOpen,
    label: "Cadastros",
    submenu: [
      { label: "Clientes", path: "/cadastros/clientes" },
      { label: "Produtos", path: "/cadastros/produtos" },
      { label: "Funcionários", path: "/cadastros/funcionarios" },
      { label: "Veículos", path: "/cadastros/veiculos" },
      { label: "Fornecedores", path: "/cadastros/fornecedores" },
    ],
  },
  {
    icon: CreditCard,
    label: "Financeiro",
    submenu: [
      { label: "Fluxo de Caixa", path: "/financeiro/fluxo" },
      { label: "Contas a Pagar", path: "/financeiro/pagar" },
      { label: "Contas a Receber", path: "/financeiro/receber" },
      { label: "Conciliação", path: "/financeiro/conciliacao" },
    ],
  },
  { icon: Settings, label: "Configurações", path: "/config/permissoes" },
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
              <h2 className="font-bold text-white text-lg">GasFlow</h2>
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
