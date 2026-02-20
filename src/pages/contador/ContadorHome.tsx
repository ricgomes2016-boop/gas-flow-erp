import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContadorPageWrapper } from "@/components/contador/ContadorPageWrapper";
import {
  FileText, Calendar, ClipboardList, Megaphone, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, ArrowRight, Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useNavigate } from "react-router-dom";

export default function ContadorHome() {
  const { unidadeAtual } = useUnidade();
  const navigate = useNavigate();

  const { data: docs = [] } = useQuery({
    queryKey: ["docs_contador_home", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("documentos_contabeis").select("*").order("created_at", { ascending: false }).limit(5);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ["solic_contador_home", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("solicitacoes_contador").select("*").order("created_at", { ascending: false }).limit(5);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: comunicados = [] } = useQuery({
    queryKey: ["comun_contador_home", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("comunicados_contador").select("*").order("created_at", { ascending: false }).limit(5);
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  const pendentes = docs.filter((d: any) => d.status === "pendente").length;
  const vencidos = docs.filter((d: any) => d.prazo_entrega && new Date(d.prazo_entrega) < new Date() && d.status !== "disponivel").length;
  const solicAbertas = solicitacoes.filter((s: any) => s.status === "aberta" || s.status === "em_andamento").length;
  const comunNaoLidos = comunicados.filter((c: any) => !c.lido).length;

  const PRAZOS = [
    { label: "DAS (Simples Nacional)", dia: 20 },
    { label: "FGTS", dia: 7 },
    { label: "INSS (GPS)", dia: 20 },
    { label: "IRRF sobre folha", dia: 20 },
  ];

  function getDaysUntil(day: number) {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), day);
    if (target < now) target.setMonth(target.getMonth() + 1);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <ContadorPageWrapper title="Portal do Contador" subtitle="Visão geral">
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-[hsl(0,0%,95%)]">Visão Geral</h2>
        <p className="text-sm text-[hsl(220,10%,55%)]">Resumo do portal contábil</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(220,10%,55%)] font-medium">Documentos</p>
                <p className="text-2xl font-bold text-[hsl(0,0%,95%)] mt-1">{docs.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[hsl(165,60%,40%)]/15 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[hsl(165,60%,55%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(220,10%,55%)] font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-[hsl(45,90%,55%)] mt-1">{pendentes}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[hsl(45,90%,55%)]/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[hsl(45,90%,55%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(220,10%,55%)] font-medium">Solicitações</p>
                <p className="text-2xl font-bold text-[hsl(210,80%,60%)] mt-1">{solicAbertas}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[hsl(210,80%,60%)]/15 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-[hsl(210,80%,60%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(220,10%,55%)] font-medium">Comunicados</p>
                <p className="text-2xl font-bold text-[hsl(280,60%,65%)] mt-1">{comunNaoLidos}</p>
                <p className="text-xs text-[hsl(220,10%,55%)]">não lidos</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[hsl(280,60%,65%)]/15 flex items-center justify-center">
                <Bell className="h-5 w-5 text-[hsl(280,60%,65%)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {vencidos > 0 && (
        <Card className="bg-[hsl(0,60%,20%)]/30 border-[hsl(0,60%,35%)]">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-5 w-5 text-[hsl(0,80%,65%)] shrink-0" />
            <p className="text-sm text-[hsl(0,80%,75%)]">
              <strong>{vencidos} documento(s)</strong> com prazo vencido. Verifique os documentos pendentes.
            </p>
            <Button size="sm" variant="outline" className="ml-auto shrink-0 border-[hsl(0,60%,35%)] text-[hsl(0,80%,75%)] hover:bg-[hsl(0,60%,25%)]"
              onClick={() => navigate("/financeiro/contador/documentos")}>
              Ver documentos
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Prazos */}
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-[hsl(0,0%,90%)]">
              <Calendar className="h-4 w-4 text-[hsl(165,60%,55%)]" />
              Próximos Prazos Fiscais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PRAZOS.map((p) => {
              const days = getDaysUntil(p.dia);
              const urgente = days <= 5;
              return (
                <div key={p.label} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${
                  urgente ? "bg-[hsl(0,60%,20%)]/30 border border-[hsl(0,60%,35%)]" : "bg-[hsl(220,18%,15%)]"
                }`}>
                  <span className="text-[hsl(0,0%,85%)]">{p.label}</span>
                  <Badge className={urgente
                    ? "bg-[hsl(0,80%,55%)] text-white"
                    : "bg-[hsl(220,15%,25%)] text-[hsl(220,10%,65%)]"
                  }>
                    {days === 0 ? "Hoje!" : days === 1 ? "Amanhã" : `${days}d`}
                  </Badge>
                </div>
              );
            })}
            <Button variant="ghost" size="sm" className="w-full mt-2 text-[hsl(165,60%,55%)] hover:bg-[hsl(165,60%,40%)]/10"
              onClick={() => navigate("/financeiro/contador/calendario")}>
              Ver calendário completo <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Últimas Solicitações */}
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-[hsl(0,0%,90%)]">
              <ClipboardList className="h-4 w-4 text-[hsl(210,80%,60%)]" />
              Últimas Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {solicitacoes.length === 0 ? (
              <p className="text-sm text-[hsl(220,10%,45%)] py-4 text-center">Nenhuma solicitação</p>
            ) : solicitacoes.slice(0, 4).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[hsl(220,18%,15%)]">
                <div className="min-w-0">
                  <p className="text-sm text-[hsl(0,0%,85%)] truncate">{s.titulo}</p>
                  <p className="text-xs text-[hsl(220,10%,45%)]">
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge className={
                  s.status === "concluida" ? "bg-[hsl(165,60%,40%)]/20 text-[hsl(165,60%,55%)]" :
                  s.status === "aberta" ? "bg-[hsl(210,80%,60%)]/20 text-[hsl(210,80%,70%)]" :
                  "bg-[hsl(45,90%,55%)]/20 text-[hsl(45,90%,60%)]"
                }>
                  {s.status}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-2 text-[hsl(210,80%,60%)] hover:bg-[hsl(210,80%,60%)]/10"
              onClick={() => navigate("/financeiro/contador/solicitacoes")}>
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Comunicados */}
      {comunicados.length > 0 && (
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-[hsl(0,0%,90%)]">
              <Megaphone className="h-4 w-4 text-[hsl(280,60%,65%)]" />
              Comunicados Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {comunicados.slice(0, 3).map((c: any) => (
              <div key={c.id} className={`p-3 rounded-lg ${c.importante ? "bg-[hsl(45,90%,55%)]/10 border border-[hsl(45,90%,55%)]/30" : "bg-[hsl(220,18%,15%)]"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-[hsl(0,0%,90%)]">{c.titulo}</p>
                  {c.importante && <Badge className="bg-[hsl(45,90%,55%)] text-black text-[10px]">Importante</Badge>}
                  {!c.lido && <Badge className="bg-[hsl(165,60%,40%)] text-white text-[10px]">Novo</Badge>}
                </div>
                <p className="text-xs text-[hsl(220,10%,55%)] line-clamp-2">{c.conteudo}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
    </ContadorPageWrapper>
  );
}
