import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RegrasCadastro {
  telefone_obrigatorio: boolean;
  canal_venda_obrigatorio: boolean;
  email_obrigatorio: boolean;
  endereco_obrigatorio: boolean;
  cpf_obrigatorio: boolean;
}

const defaultRegras: RegrasCadastro = {
  telefone_obrigatorio: true,
  canal_venda_obrigatorio: false,
  email_obrigatorio: false,
  endereco_obrigatorio: false,
  cpf_obrigatorio: false,
};

export function useRegrasCadastro() {
  const { data: regras = defaultRegras, isLoading } = useQuery({
    queryKey: ["regras_cadastro"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select("regras_cadastro")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data?.regras_cadastro) {
        return { ...defaultRegras, ...(data.regras_cadastro as Record<string, boolean>) } as RegrasCadastro;
      }
      return defaultRegras;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { regras, isLoading };
}
