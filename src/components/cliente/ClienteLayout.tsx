import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  ShoppingCart, 
  Gift, 
  Wallet, 
  User, 
  Menu, 
  X, 
  History,
  Flame,
  BookOpen,
  Calculator,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import logoImg from "@/assets/logo.png";

interface ClienteLayoutProps {
  children: ReactNode;
  cartItemsCount?: number;
}

const menuItems = [
  { icon: Home, label: "Início", path: "/cliente" },
  { icon: ShoppingCart, label: "Carrinho", path: "/cliente/carrinho" },
  { icon: History, label: "Minhas Compras", path: "/cliente/historico" },
  { icon: Gift, label: "Indique e Ganhe", path: "/cliente/indicacao" },
  { icon: Wallet, label: "Minha Carteira", path: "/cliente/carteira" },
  { icon: CreditCard, label: "Meus Vales Gás", path: "/cliente/vale-gas" },
  { icon: Calculator, label: "Consumo Médio", path: "/cliente/consumo" },
  { icon: BookOpen, label: "Dicas e Receitas", path: "/cliente/dicas" },
  { icon: User, label: "Meu Perfil", path: "/cliente/perfil" },
];

const bottomNavItems = [
  { icon: Home, label: "Início", path: "/cliente" },
  { icon: ShoppingCart, label: "Carrinho", path: "/cliente/carrinho", showBadge: true },
  { icon: Gift, label: "Indicar", path: "/cliente/indicacao" },
  { icon: Wallet, label: "Carteira", path: "/cliente/carteira" },
  { icon: User, label: "Perfil", path: "/cliente/perfil" },
];

export function ClienteLayout({ children, cartItemsCount = 0 }: ClienteLayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Nacional Gás" className="h-7 w-7 object-contain" />
            <span className="font-bold text-lg">Nacional Gás</span>
          </div>
          
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="bg-primary text-primary-foreground p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={logoImg} alt="Nacional Gás" className="h-7 w-7 object-contain" />
                    <span className="font-bold text-lg">Nacional Gás</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMenuOpen(false)}
                    className="text-primary-foreground hover:bg-primary/80"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-primary-foreground/80 text-sm">Bem-vindo ao app do cliente</p>
              </div>
              
              <nav className="p-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between py-3 px-3 rounded-lg transition-colors mb-1",
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex justify-around items-center py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center py-1 px-3 rounded-lg transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.showBadge && cartItemsCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
