import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, FileText, MessageCircle } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface ContadorLayoutProps {
  children: ReactNode;
}

export function ContadorLayout({ children }: ContadorLayoutProps) {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado */}
      <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="h-8 w-8 rounded" />
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Portal do Contador
              </h1>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name || "Contador"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>
      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
