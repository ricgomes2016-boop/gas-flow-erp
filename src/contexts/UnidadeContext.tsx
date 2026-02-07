import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Unidade {
  id: string;
  nome: string;
  tipo: "matriz" | "filial";
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  ativo: boolean;
}

interface UnidadeContextType {
  unidades: Unidade[];
  unidadeAtual: Unidade | null;
  loading: boolean;
  setUnidadeAtual: (unidade: Unidade) => void;
  refetch: () => Promise<void>;
}

const UnidadeContext = createContext<UnidadeContextType | undefined>(undefined);

export function UnidadeProvider({ children }: { children: ReactNode }) {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeAtual, setUnidadeAtualState] = useState<Unidade | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUnidades = async () => {
    try {
      const { data, error } = await supabase
        .from("unidades")
        .select("*")
        .eq("ativo", true)
        .order("tipo", { ascending: true }) // matriz first
        .order("nome");

      if (error) {
        console.error("Error fetching unidades:", error);
        return;
      }

      const typedData = (data || []).map((u) => ({
        ...u,
        tipo: u.tipo as "matriz" | "filial",
        ativo: u.ativo ?? true,
      }));

      setUnidades(typedData);

      // Set current unidade from localStorage or default to matriz
      const savedUnidadeId = localStorage.getItem("unidade_atual_id");
      const savedUnidade = typedData.find((u) => u.id === savedUnidadeId);
      
      if (savedUnidade) {
        setUnidadeAtualState(savedUnidade);
      } else {
        // Default to matriz
        const matriz = typedData.find((u) => u.tipo === "matriz");
        if (matriz) {
          setUnidadeAtualState(matriz);
          localStorage.setItem("unidade_atual_id", matriz.id);
        } else if (typedData.length > 0) {
          setUnidadeAtualState(typedData[0]);
          localStorage.setItem("unidade_atual_id", typedData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching unidades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  const setUnidadeAtual = (unidade: Unidade) => {
    setUnidadeAtualState(unidade);
    localStorage.setItem("unidade_atual_id", unidade.id);
  };

  return (
    <UnidadeContext.Provider
      value={{
        unidades,
        unidadeAtual,
        loading,
        setUnidadeAtual,
        refetch: fetchUnidades,
      }}
    >
      {children}
    </UnidadeContext.Provider>
  );
}

export function useUnidade() {
  const context = useContext(UnidadeContext);
  if (!context) {
    throw new Error("useUnidade must be used within UnidadeProvider");
  }
  return context;
}
