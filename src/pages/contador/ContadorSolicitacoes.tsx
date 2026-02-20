import { useState } from "react";
import { ContadorPageWrapper } from "@/components/contador/ContadorPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Clock, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  aberta: "bg-[hsl(210,80%,60%)]/20 text-[hsl(210,80%,70%)]",
  em_andamento: "bg-[hsl(45,90%,55%)]/20 text-[hsl(45,90%,60%)]",
  respondida: "bg-[hsl(165,60%,40%)]/20 text-[hsl(165,60%,55%)]",
  concluida: "bg-[hsl(165,60%,40%)]/30 text-[hsl(165,60%,65%)]",
  cancelada: "bg-[hsl(220,15%,25%)] text-[hsl(220,10%,55%)]",
};

const PRIORIDADE_COLORS: Record<string, string> = {
  baixa: "bg-[hsl(220,15%,25%)] text-[hsl(220,10%,60%)]",
  normal: "bg-[hsl(210,80%,60%)]/15 text-[hsl(210,80%,65%)]",
  alta: "bg-[hsl(30,90%,55%)]/15 text-[hsl(30,90%,60%)]",
  urgente: "bg-[hsl(0,80%,55%)]/15 text-[hsl(0,80%,65%)]",
};

export default function ContadorSolicitacoes() {
  const { unidadeAtual } = useUnidade();
  const { user, profile, roles } = useAuth();
  const queryClient = useQueryClient();
  const isContador = roles.includes("contador");
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("documento");
  const [prioridade, setPrioridade] = useState("normal");
  const [prazo, setPrazo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");

  const { data: solicitacoes = [], isLoading } = useQuery({
    queryKey: ["solicitacoes_contador", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("solicitacoes_contador").select("*").order("created_at", { ascending: false });
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!titulo.trim() || !user) return;
      const { error } = await supabase.from("solicitacoes_contador").insert({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        tipo,
        prioridade,
        prazo: prazo || null,
        solicitante_id: user.id,
        solicitante_tipo: isContador ? "contador" : "empresa",
        unidade_id: unidadeAtual?.id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes_contador"] });
      toast.success("Solicitação criada!");
      setOpen(false);
      setTitulo(""); setDescricao(""); setTipo("documento"); setPrioridade("normal"); setPrazo("");
    },
    onError: () => toast.error("Erro ao criar solicitação"),
  });

  const filtered = filtroStatus === "todas" ? solicitacoes : solicitacoes.filter((s: any) => s.status === filtroStatus);

  return (
    <ContadorPageWrapper title="Solicitações" subtitle="Solicite ou responda documentos">
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(0,0%,95%)]">Solicitações</h2>
          <p className="text-sm text-[hsl(220,10%,55%)]">Solicite ou responda documentos e informações</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-[hsl(165,60%,40%)] hover:bg-[hsl(165,60%,35%)] text-white">
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      {/* Filtro */}
      <div className="flex gap-2 flex-wrap">
        {["todas", "aberta", "em_andamento", "respondida", "concluida"].map(s => (
          <Button key={s} size="sm" variant="ghost"
            className={`text-xs ${filtroStatus === s ? "bg-[hsl(220,18%,18%)] text-[hsl(0,0%,95%)]" : "text-[hsl(220,10%,55%)]"}`}
            onClick={() => setFiltroStatus(s)}>
            {s === "todas" ? "Todas" : s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
            <CardContent className="py-10 text-center">
              <ClipboardList className="h-10 w-10 text-[hsl(220,10%,30%)] mx-auto mb-3" />
              <p className="text-sm text-[hsl(220,10%,45%)]">Nenhuma solicitação encontrada</p>
            </CardContent>
          </Card>
        )}
        {filtered.map((s: any) => (
          <Card key={s.id} className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-[hsl(0,0%,90%)]">{s.titulo}</p>
                    <Badge className={STATUS_COLORS[s.status] || ""}>{s.status.replace("_", " ")}</Badge>
                    <Badge className={PRIORIDADE_COLORS[s.prioridade] || ""}>{s.prioridade}</Badge>
                  </div>
                  {s.descricao && <p className="text-xs text-[hsl(220,10%,55%)] mb-2">{s.descricao}</p>}
                  <div className="flex gap-3 text-xs text-[hsl(220,10%,45%)]">
                    <span>{s.solicitante_tipo === "contador" ? "📊 Contador" : "🏢 Empresa"}</span>
                    <span>{new Date(s.created_at).toLocaleDateString("pt-BR")}</span>
                    {s.prazo && <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Prazo: {new Date(s.prazo).toLocaleDateString("pt-BR")}
                    </span>}
                  </div>
                  {s.resposta && (
                    <div className="mt-3 p-3 rounded-lg bg-[hsl(220,18%,15%)] border-l-2 border-[hsl(165,60%,40%)]">
                      <p className="text-xs font-medium text-[hsl(165,60%,55%)] mb-1">Resposta:</p>
                      <p className="text-sm text-[hsl(0,0%,80%)]">{s.resposta}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)] text-[hsl(0,0%,90%)]">
          <DialogHeader>
            <DialogTitle>Nova Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={titulo} onChange={e => setTitulo(e.target.value)} className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]" /></div>
            <div><Label>Descrição</Label><Textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documento">Documento</SelectItem>
                    <SelectItem value="informacao">Informação</SelectItem>
                    <SelectItem value="revisao">Revisão</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={prioridade} onValueChange={setPrioridade}>
                  <SelectTrigger className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Prazo</Label><Input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!titulo.trim() || createMutation.isPending}
              className="bg-[hsl(165,60%,40%)] hover:bg-[hsl(165,60%,35%)] text-white">
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ContadorPageWrapper>
  );
}
