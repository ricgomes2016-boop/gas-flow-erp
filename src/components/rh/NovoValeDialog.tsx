import { useState } from "react";
import { getBrasiliaDateString } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";

export function NovoValeDialog() {
  const [open, setOpen] = useState(false);
  const [funcionarioId, setFuncionarioId] = useState("");
  const [tipo, setTipo] = useState("adiantamento");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(getBrasiliaDateString());
  const [descontoReferencia, setDescontoReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const queryClient = useQueryClient();
  const { unidadeAtual } = useUnidade();

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-ativos", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("funcionarios")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const criarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vales_funcionario").insert({
        funcionario_id: funcionarioId,
        tipo,
        valor: parseFloat(valor),
        data,
        desconto_referencia: descontoReferencia || null,
        observacoes: observacoes || null,
        status: "pendente",
        unidade_id: unidadeAtual?.id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vales-funcionario"] });
      toast.success("Vale criado com sucesso!");
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar vale: " + err.message);
    },
  });

  const resetForm = () => {
    setFuncionarioId("");
    setTipo("adiantamento");
    setValor("");
    setData(getBrasiliaDateString());
    setDescontoReferencia("");
    setObservacoes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcionarioId || !valor || parseFloat(valor) <= 0) {
      toast.error("Preencha funcionário e valor");
      return;
    }
    criarMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Vale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Vale / Adiantamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Funcionário *</Label>
            <Select value={funcionarioId} onValueChange={setFuncionarioId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map((f: any) => (
                  <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adiantamento">Adiantamento</SelectItem>
                  <SelectItem value="vale_alimentacao">Vale Alimentação</SelectItem>
                  <SelectItem value="vale_transporte">Vale Transporte</SelectItem>
                  <SelectItem value="emprestimo">Empréstimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Desconto em</Label>
              <Input
                placeholder="Ex: Folha 03/2026"
                value={descontoReferencia}
                onChange={(e) => setDescontoReferencia(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações opcionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criarMutation.isPending}>
              {criarMutation.isPending ? "Salvando..." : "Salvar Vale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
