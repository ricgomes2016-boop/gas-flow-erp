import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Star, TrendingUp, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function MetasDesafios() {
  const { unidadeAtual } = useUnidade();
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<any[]>([]);
  const [premiacoes, setPremiacoes] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, [unidadeAtual]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let mq = supabase.from("metas").select("*").eq("status", "ativa").order("created_at", { ascending: false });
      if (unidadeAtual?.id) mq = mq.eq("unidade_id", unidadeAtual.id);
      const { data: metasData } = await mq;
      setMetas(metasData || []);

      let pq = supabase.from("premiacoes").select("*, funcionarios:ganhador_id(nome)").eq("status", "em_andamento");
      if (unidadeAtual?.id) pq = pq.eq("unidade_id", unidadeAtual.id);
      const { data: premData } = await pq;
      setPremiacoes(premData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Header title="Metas e Desafios" subtitle="Acompanhe o progresso e gamificação" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </MainLayout>
    );
  }

  const progressoMedio = metas.length > 0
    ? metas.reduce((s, m) => s + Math.min((Number(m.valor_atual) / Number(m.valor_objetivo)) * 100, 100), 0) / metas.length
    : 0;

  return (
    <MainLayout>
      <Header title="Metas e Desafios" subtitle="Acompanhe o progresso e gamificação" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Metas e Desafios</h1>
            <p className="text-muted-foreground">Acompanhe o progresso e gamificação</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Nova Meta</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Target className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{metas.length}</p><p className="text-sm text-muted-foreground">Metas Ativas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><TrendingUp className="h-6 w-6 text-green-500" /></div><div><p className="text-2xl font-bold">{progressoMedio.toFixed(0)}%</p><p className="text-sm text-muted-foreground">Média Progresso</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-yellow-500/10"><Trophy className="h-6 w-6 text-yellow-500" /></div><div><p className="text-2xl font-bold">{premiacoes.length}</p><p className="text-sm text-muted-foreground">Desafios Ativos</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><Star className="h-6 w-6 text-blue-500" /></div><div><p className="text-2xl font-bold">{metas.filter(m => Number(m.valor_atual) >= Number(m.valor_objetivo)).length}</p><p className="text-sm text-muted-foreground">Metas Atingidas</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Metas Ativas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              {metas.length === 0 && <p className="text-center text-muted-foreground">Nenhuma meta cadastrada</p>}
              {metas.map((meta) => {
                const progresso = (Number(meta.valor_atual) / Number(meta.valor_objetivo)) * 100;
                return (
                  <div key={meta.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{meta.titulo}</p>
                        <p className="text-sm text-muted-foreground">{meta.descricao}</p>
                      </div>
                      <Badge variant="outline">{new Date(meta.prazo).toLocaleDateString("pt-BR")}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={Math.min(progresso, 100)} className="flex-1" />
                      <span className="text-sm font-medium w-16 text-right">{progresso.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {meta.tipo === "financeiro"
                        ? `R$ ${Number(meta.valor_atual).toLocaleString("pt-BR")} / R$ ${Number(meta.valor_objetivo).toLocaleString("pt-BR")}`
                        : `${Number(meta.valor_atual)} / ${Number(meta.valor_objetivo)}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {premiacoes.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Desafios Ativos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {premiacoes.map((d: any) => (
                  <div key={d.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{d.nome}</p>
                        <p className="text-sm text-muted-foreground">{d.meta_descricao}</p>
                      </div>
                      {d.premio && <Badge className="bg-yellow-500">{d.premio}</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Líder: {(d.funcionarios as any)?.nome || "A definir"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
