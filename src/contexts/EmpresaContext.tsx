import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  logo_url: string | null;
  plano: string;
  plano_max_unidades: number;
  plano_max_usuarios: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface EmpresaContextType {
  empresa: Empresa | null;
  loading: boolean;
  needsOnboarding: boolean;
  refetch: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { user, roles, loading: authLoading } = useAuth();

  const isStaff = roles.some(r => ["admin", "gestor", "financeiro", "operacional"].includes(r));

  const fetchEmpresa = async () => {
    if (!user) {
      setEmpresa(null);
      setNeedsOnboarding(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching empresa:", error);
        // If no empresa found and user is admin, needs onboarding
        if (isStaff && roles.includes("admin")) {
          setNeedsOnboarding(true);
        }
        setLoading(false);
        return;
      }

      if (data) {
        setEmpresa(data as Empresa);
        setNeedsOnboarding(false);
      } else if (isStaff && roles.includes("admin")) {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("Error fetching empresa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchEmpresa();
    }
  }, [user, roles, authLoading]);

  return (
    <EmpresaContext.Provider
      value={{
        empresa,
        loading,
        needsOnboarding,
        refetch: fetchEmpresa,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error("useEmpresa must be used within EmpresaProvider");
  }
  return context;
}
