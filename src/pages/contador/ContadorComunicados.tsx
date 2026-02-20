import { useState } from "react";
import { ContadorPageWrapper } from "@/components/contador/ContadorPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, Bell, Info, AlertTriangle, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TIPO_ICONS: Record<string, any> = {
  aviso: Bell,
  alerta: AlertTriangle,
  informativo: Info,
  regulatorio: BookOpen,
};

export default function ContadorComunicados() {
  const { unidadeAtual } = useUnidade();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState("aviso");
  const [importante, setImportante] = useState(false);

  const { data: comunicados = [] } = useQuery({
    queryKey: ["comunicados_contador", unidadeAtual?.id],
    queryFn: async () => {
      let q = supabase.from("comunicados_contador").select("*").order("created_at", { ascending: false });
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!titulo.trim() || !conteudo.trim() || !user) return;
      const { error } = await supabase.from("comunicados_contador").insert({
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        tipo,
        importante,
        autor_id: user.id,
        autor_nome: profile?.full_name || "Usuário",
        unidade_id: unidadeAtual?.id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados_contador"] });
      toast.success("Comunicado publicado!");
      setOpen(false);
      setTitulo(""); setConteudo(""); setTipo("aviso"); setImportante(false);
    },
    onError: () => toast.error("Erro ao publicar"),
  });

  const markRead = async (id: string) => {
    await supabase.from("comunicados_contador").update({ lido: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["comunicados_contador"] });
  };

  return (
    <ContadorPageWrapper title="Comunicados" subtitle="Avisos e informações importantes">
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(0,0%,95%)]">Comunicados</h2>
          <p className="text-sm text-[hsl(220,10%,55%)]">Avisos e informações importantes</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-[hsl(280,60%,50%)] hover:bg-[hsl(280,60%,45%)] text-white">
          <Plus className="h-4 w-4" /> Publicar
        </Button>
      </div>

      <div className="space-y-3">
        {comunicados.length === 0 && (
          <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
            <CardContent className="py-10 text-center">
              <Megaphone className="h-10 w-10 text-[hsl(220,10%,30%)] mx-auto mb-3" />
              <p className="text-sm text-[hsl(220,10%,45%)]">Nenhum comunicado</p>
            </CardContent>
          </Card>
        )}
        {comunicados.map((c: any) => {
          const Icon = TIPO_ICONS[c.tipo] || Bell;
          return (
            <Card key={c.id} className={`bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)] ${c.importante ? "border-l-4 border-l-[hsl(45,90%,55%)]" : ""}`}
              onClick={() => !c.lido && markRead(c.id)}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    c.tipo === "alerta" ? "bg-[hsl(0,80%,55%)]/15" :
                    c.tipo === "regulatorio" ? "bg-[hsl(210,80%,60%)]/15" :
                    c.tipo === "informativo" ? "bg-[hsl(165,60%,40%)]/15" :
                    "bg-[hsl(280,60%,65%)]/15"
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      c.tipo === "alerta" ? "text-[hsl(0,80%,65%)]" :
                      c.tipo === "regulatorio" ? "text-[hsl(210,80%,65%)]" :
                      c.tipo === "informativo" ? "text-[hsl(165,60%,55%)]" :
                      "text-[hsl(280,60%,65%)]"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-[hsl(0,0%,90%)]">{c.titulo}</p>
                      {!c.lido && <Badge className="bg-[hsl(165,60%,40%)] text-white text-[10px]">Novo</Badge>}
                      {c.importante && <Badge className="bg-[hsl(45,90%,55%)] text-black text-[10px]">Importante</Badge>}
                    </div>
                    <p className="text-sm text-[hsl(220,10%,70%)] whitespace-pre-wrap">{c.conteudo}</p>
                    <div className="flex gap-3 mt-2 text-xs text-[hsl(220,10%,45%)]">
                      <span>{c.autor_nome}</span>
                      <span>{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)] text-[hsl(0,0%,90%)]">
          <DialogHeader><DialogTitle>Novo Comunicado</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={titulo} onChange={e => setTitulo(e.target.value)} className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]" /></div>
            <div><Label>Conteúdo *</Label><Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={5} className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-[hsl(220,18%,15%)] border-[hsl(220,15%,25%)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aviso">Aviso</SelectItem>
                    <SelectItem value="alerta">Alerta</SelectItem>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    <SelectItem value="regulatorio">Regulatório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={importante} onCheckedChange={setImportante} />
                <Label>Importante</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!titulo.trim() || !conteudo.trim() || createMutation.isPending}
              className="bg-[hsl(280,60%,50%)] hover:bg-[hsl(280,60%,45%)] text-white">
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ContadorPageWrapper>
  );
}
