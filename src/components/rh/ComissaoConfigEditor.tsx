import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ComissaoRow {
  canal_venda: string;
  canal_label: string;
  valor: number;
}

interface ProdutoComissao {
  produto_id: string;
  produto_nome: string;
  canais: ComissaoRow[];
}

export function ComissaoConfigEditor() {
  const { unidadeAtual } = useUnidade();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, Record<string, number>>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  // Fetch products (gas only or all)
  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-comissao-config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("produtos")
        .select("id, nome, categoria, tipo_botijao")
        .eq("ativo", true)
        .order("nome");
      return data || [];
    },
    enabled: open,
  });

  // Fetch active sales channels
  const { data: canaisVenda = [] } = useQuery({
    queryKey: ["canais-venda-comissao"],
    queryFn: async () => {
      const { data } = await supabase
        .from("canais_venda")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      return data || [];
    },
    enabled: open,
  });

  // Fetch existing config
  const { data: configExistente = [], isLoading } = useQuery({
    queryKey: ["comissao-config", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase.from("comissao_config").select("*");
      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: open,
  });

  // Initialize edit values when data loads
  useEffect(() => {
    if (!produtos.length || !canaisVenda.length) return;

    const values: Record<string, Record<string, number>> = {};
    produtos.forEach((p: any) => {
      values[p.id] = {};
      canaisVenda.forEach((c: any) => {
        const existing = configExistente.find(
          (cfg: any) => cfg.produto_id === p.id && cfg.canal_venda === c.nome
        );
        values[p.id][c.nome] = existing ? Number(existing.valor) : 0;
      });
    });
    setEditValues(values);

    if (!activeTab && produtos.length > 0) {
      setActiveTab(produtos[0].id);
    }
  }, [produtos, canaisVenda, configExistente]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const upserts: any[] = [];
      Object.entries(editValues).forEach(([produtoId, canais]) => {
        Object.entries(canais).forEach(([canalVenda, valor]) => {
          upserts.push({
            produto_id: produtoId,
            canal_venda: canalVenda,
            valor,
            unidade_id: unidadeAtual?.id || null,
          });
        });
      });

      // Delete existing and insert new
      let deleteQuery = supabase.from("comissao_config").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (unidadeAtual?.id) {
        deleteQuery = deleteQuery.eq("unidade_id", unidadeAtual.id);
      }
      await deleteQuery;

      if (upserts.length > 0) {
        const { error } = await supabase.from("comissao_config").insert(upserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Comissões salvas com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["comissao-config"] });
      queryClient.invalidateQueries({ queryKey: ["comissao-detalhada"] });
    },
    onError: () => {
      toast({ title: "Erro ao salvar comissões", variant: "destructive" });
    },
  });

  const handleValueChange = (produtoId: string, canal: string, valor: string) => {
    const num = parseFloat(valor.replace(",", ".")) || 0;
    setEditValues((prev) => ({
      ...prev,
      [produtoId]: { ...prev[produtoId], [canal]: num },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurar Comissões
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Comissões por Produto / Canal</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : produtos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum produto cadastrado.</p>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap h-auto gap-1">
                {produtos.map((p: any) => (
                  <TabsTrigger key={p.id} value={p.id} className="text-xs">
                    {p.nome}
                  </TabsTrigger>
                ))}
              </TabsList>

              {produtos.map((p: any) => (
                <TabsContent key={p.id} value={p.id}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{p.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {canaisVenda.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium min-w-[140px]">{c.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-24 text-right"
                              value={editValues[p.id]?.[c.nome] ?? 0}
                              onChange={(e) => handleValueChange(p.id, c.nome, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      {canaisVenda.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum canal de venda cadastrado.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Comissões
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
