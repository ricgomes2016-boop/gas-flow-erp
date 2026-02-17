import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
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
import { menuItems } from "./menuItems";

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
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
      <SheetContent side="left" className="w-72 p-0 border-r border-sidebar-border">
        <div className="bg-sidebar h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sidebar-foreground text-lg">Gas Express25</h2>
              <p className="text-xs text-sidebar-foreground/60">Gestão de Gás</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-2 pb-32 space-y-1">
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
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
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
                      {item.submenu.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive(sub.path)
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            )}
                          >
                            <SubIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
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
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="fixed bottom-0 left-0 w-72 bg-sidebar p-4 border-t border-sidebar-border space-y-2">
            <p className="text-xs text-muted-foreground px-1">
              Logado como <span className="font-medium text-sidebar-foreground">{profile?.full_name || "Administrador"}</span>
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
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
