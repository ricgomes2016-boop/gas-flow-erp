import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number | null;
  categoria: string | null;
}

interface PDVQuickProductsProps {
  onSelectProduct: (produto: Produto) => void;
  unidadeId?: string | null;
}

export function PDVQuickProducts({ onSelectProduct, unidadeId }: PDVQuickProductsProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        let query = supabase
          .from("produtos")
          .select("id, nome, preco, estoque, categoria")
          .eq("ativo", true)
          .or("tipo_botijao.is.null,tipo_botijao.neq.vazio")
          .order("nome")
          .limit(12);

        if (unidadeId) {
          query = query.eq("unidade_id", unidadeId);
        }

        const { data, error } = await query;

        if (!error && data) {
          setProdutos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, [unidadeId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {produtos.map((produto) => {
        const isGas = produto.categoria === "gas";
        const estoqueBaixo = (produto.estoque ?? 0) <= 5;

        return (
          <Button
            key={produto.id}
            variant="outline"
            className={`h-20 flex-col gap-1 text-left p-2 ${
              estoqueBaixo ? "border-warning/50" : ""
            } ${isGas ? "bg-primary/5 hover:bg-primary/10" : ""}`}
            onClick={() => onSelectProduct(produto)}
            disabled={(produto.estoque ?? 0) === 0}
          >
            {isGas && <Flame className="h-4 w-4 text-primary" />}
            <span className="text-xs font-medium text-center line-clamp-2">
              {produto.nome}
            </span>
            <span className="text-sm font-bold text-primary">
              R$ {produto.preco.toFixed(2)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Est: {produto.estoque ?? 0}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
