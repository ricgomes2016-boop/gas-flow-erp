import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useState } from "react";
import { menuItems } from "./menuItems";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebarContext();
  const { signOut, profile } = useAuth();
  const { unidades, unidadeAtual, setUnidadeAtual } = useUnidade();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userName = profile?.full_name || "Administrador";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logoImg} alt="Nacional Gás" className="h-9 w-9 flex-shrink-0 rounded-lg object-contain" />
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-foreground">
                Gás Fácil
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
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
            <Select
              value={unidadeAtual?.id || ""}
              onValueChange={(val) => {
                const u = unidades.find((u) => u.id === val);
                if (u) setUnidadeAtual(u);
              }}
            >
              <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <Store className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
                {unidades.length === 0 && (
                  <SelectItem value="__none" disabled>Nenhuma unidade</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Collapsed Store Icon */}
        {collapsed && (
          <div className="border-b border-sidebar-border p-3 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent cursor-pointer">
                  <Store className="h-5 w-5 text-sidebar-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{unidadeAtual?.nome || "Selecionar loja"}</p>
              </TooltipContent>
            </Tooltip>
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

              // Collapsed mode with tooltip
              if (collapsed) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      {item.path ? (
                        <Link
                          to={item.path}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-all duration-200",
                            isItemActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </Link>
                      ) : (
                        <button
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-all duration-200",
                            isChildActive
                              ? "bg-sidebar-accent text-sidebar-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1">
                      <p className="font-medium">{item.label}</p>
                      {hasSubmenu && (
                        <div className="flex flex-col gap-1 mt-1 border-t border-border pt-1">
                          {item.submenu?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={cn(
                                  "flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-accent",
                                  isActive(subItem.path) && "bg-accent font-medium"
                                )}
                              >
                                <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              // Expanded mode
              return (
                <div key={item.label}>
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
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isChildActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {hasSubmenu && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      )}
                    </button>
                  )}

                  {/* Submenu */}
                  {hasSubmenu && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
                        {item.submenu?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                isActive(subItem.path)
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                              )}
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer - Logout */}
        <div className="flex-shrink-0 border-t border-sidebar-border p-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="flex h-10 w-10 items-center justify-center rounded-lg mx-auto text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="flex-shrink-0 border-t border-sidebar-border p-3">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <p className="text-xs text-sidebar-foreground/70">Logado como</p>
              <p className="text-sm font-medium text-sidebar-foreground">
                {userName}
              </p>
            </div>
          </div>
        )}

        {/* Collapsed User Info */}
        {collapsed && (
          <div className="flex-shrink-0 border-t border-sidebar-border p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent mx-auto cursor-pointer">
                  <span className="text-sm font-bold text-sidebar-foreground">{userInitial}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs text-muted-foreground">Logado como</p>
                <p className="font-medium">{userName}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
