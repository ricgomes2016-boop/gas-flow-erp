import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  StickyNote,
  Plus,
  Trash2,
  Pin,
  PinOff,
  X,
  Bell,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

const CORES = [
  { value: "yellow", label: "Amarelo", class: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700" },
  { value: "blue", label: "Azul", class: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700" },
  { value: "green", label: "Verde", class: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" },
  { value: "pink", label: "Rosa", class: "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700" },
  { value: "purple", label: "Roxo", class: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700" },
];

function getCorClass(cor: string) {
  return CORES.find((c) => c.value === cor)?.class || CORES[0].class;
}

export function NotesWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [cor, setCor] = useState("yellow");
  const [lembreteData, setLembreteData] = useState("");

  const { data: anotacoes = [] } = useQuery({
    queryKey: ["anotacoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anotacoes")
        .select("*")
        .order("fixado", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("anotacoes").insert({
        user_id: user!.id,
        titulo,
        conteudo: conteudo || null,
        cor,
        lembrete_data: lembreteData ? new Date(lembreteData).toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anotacoes"] });
      setTitulo("");
      setConteudo("");
      setCor("yellow");
      setLembreteData("");
      setShowForm(false);
      toast.success("Anotação criada!");
    },
    onError: () => toast.error("Erro ao criar anotação"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase
        .from("anotacoes")
        .update({ [field]: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["anotacoes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("anotacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anotacoes"] });
      toast.success("Anotação removida");
    },
  });

  const lembretesPendentes = anotacoes.filter(
    (a: any) => a.lembrete_data && !a.concluido && (isPast(new Date(a.lembrete_data)) || isToday(new Date(a.lembrete_data)))
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Anotações & Lembretes
            {lembretesPendentes.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {lembretesPendentes.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant={showForm ? "ghost" : "outline"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
            <Input
              placeholder="Título da anotação..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Conteúdo (opcional)..."
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className="text-sm min-h-[60px]"
            />
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Input
                type="datetime-local"
                value={lembreteData}
                onChange={(e) => setLembreteData(e.target.value)}
                className="text-sm flex-1"
              />
            </div>
            <div className="flex items-center gap-1">
              {CORES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCor(c.value)}
                  className={`h-6 w-6 rounded-full border-2 ${c.class} ${
                    cor === c.value ? "ring-2 ring-primary ring-offset-1" : ""
                  }`}
                  title={c.label}
                />
              ))}
            </div>
            <Button
              size="sm"
              className="w-full"
              disabled={!titulo.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              Salvar
            </Button>
          </div>
        )}

        {anotacoes.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma anotação ainda. Clique em + para adicionar.
          </p>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {anotacoes.map((nota: any) => (
              <div
                key={nota.id}
                className={`p-3 rounded-lg border ${getCorClass(nota.cor)} transition-all ${
                  nota.concluido ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={nota.concluido}
                    onCheckedChange={(v) =>
                      toggleMutation.mutate({ id: nota.id, field: "concluido", value: !!v })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        nota.concluido ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {nota.titulo}
                    </p>
                    {nota.conteudo && (
                      <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                        {nota.conteudo}
                      </p>
                    )}
                    {nota.lembrete_data && (
                      <div className="flex items-center gap-1 mt-1">
                        <Bell className="h-3 w-3" />
                        <span
                          className={`text-xs ${
                            !nota.concluido && isPast(new Date(nota.lembrete_data))
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(nota.lembrete_data), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        toggleMutation.mutate({ id: nota.id, field: "fixado", value: !nota.fixado })
                      }
                    >
                      {nota.fixado ? (
                        <Pin className="h-3 w-3 text-primary" />
                      ) : (
                        <PinOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => deleteMutation.mutate(nota.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
