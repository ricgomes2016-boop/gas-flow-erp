import { useState, useEffect, useCallback } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Fuel, Plus, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AbastecimentoDB {
  id: string;
  data: string;
  litros: number;
  valor: number;
  tipo: string;
  posto: string | null;
  nota_fiscal: string | null;
  km: number;
  status: string;
  sem_saida_caixa: boolean;
  veiculos: { placa: string } | null;
}

export default function EntregadorCombustivel() {
  const [abastecimentos, setAbastecimentos] = useState<AbastecimentoDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [entregadorId, setEntregadorId] = useState<string | null>(null);
  const [entregadorNome, setEntregadorNome] = useState("");
  const [entregadorUnidadeId, setEntregadorUnidadeId] = useState<string | null>(null);
  const [veiculos, setVeiculos] = useState<{ id: string; placa: string; modelo: string | null }[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState({
    veiculo_id: "",
    litros: "",
    valor: "",
    km: "",
    tipo: "Gasolina",
    posto: "",
    nota_fiscal: "",
    sem_saida_caixa: true,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: entregador } = await supabase
        .from("entregadores")
        .select("id, nome, unidade_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (entregador) {
        setEntregadorId(entregador.id);
        setEntregadorNome(entregador.nome);
        setEntregadorUnidadeId(entregador.unidade_id || null);

        const { data } = await (supabase as any)
          .from("abastecimentos")
          .select("id, data, litros, valor, tipo, posto, nota_fiscal, km, status, sem_saida_caixa, veiculos(placa)")
          .eq("entregador_id", entregador.id)
          .order("data", { ascending: false })
          .limit(50);

        setAbastecimentos(data || []);
      }

      const { data: veiculosData } = await supabase
        .from("veiculos")
        .select("id, placa, modelo")
        .eq("ativo", true)
        .order("placa");
      setVeiculos(veiculosData || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalMes = (() => {
    const mesInicio = new Date();
    mesInicio.setDate(1);
    mesInicio.setHours(0, 0, 0, 0);
    return abastecimentos
      .filter((a) => new Date(a.data) >= mesInicio)
      .reduce((s, a) => s + Number(a.valor), 0);
  })();

  const handleSave = async () => {
    if (!form.veiculo_id || !form.litros || !form.valor) {
      toast({ title: "Dados incompletos", description: "Preencha veículo, litros e valor.", variant: "destructive" });
      return;
    }
    if (!entregadorId) {
      toast({ title: "Erro", description: "Você não está cadastrado como entregador.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await (supabase as any).from("abastecimentos").insert({
        veiculo_id: form.veiculo_id,
        motorista: entregadorNome,
        data: new Date().toISOString().split("T")[0],
        km: Number(form.km) || 0,
        litros: Number(form.litros),
        tipo: form.tipo,
        valor: Number(form.valor),
        posto: form.posto || null,
        nota_fiscal: form.nota_fiscal || null,
        status: "pendente",
        entregador_id: entregadorId,
        sem_saida_caixa: form.sem_saida_caixa,
        unidade_id: entregadorUnidadeId,
      });
      if (error) throw error;

      toast({ title: "Abastecimento registrado!", description: form.sem_saida_caixa ? "Sem saída do caixa." : "Lançado normalmente." });
      setForm({ veiculo_id: "", litros: "", valor: "", km: "", tipo: "Gasolina", posto: "", nota_fiscal: "", sem_saida_caixa: true });
      setDialogAberto(false);
      fetchData();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <EntregadorLayout title="Combustível">
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </EntregadorLayout>
    );
  }

  return (
    <EntregadorLayout title="Combustível">
      <div className="p-4 space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Fuel className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{abastecimentos.length}</p>
                  <p className="text-xs text-muted-foreground">Abastecimentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">R$ {totalMes.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Novo */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 gradient-primary text-white shadow-glow">
              <Plus className="h-5 w-5 mr-2" />
              Registrar Abastecimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Novo Abastecimento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Veículo *</Label>
                <Select value={form.veiculo_id} onValueChange={(v) => setForm({ ...form, veiculo_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {veiculos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.placa}{v.modelo ? ` - ${v.modelo}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Litros *</Label>
                  <Input type="number" step="0.01" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">KM Atual</Label>
                  <Input type="number" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Etanol">Etanol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="GNV">GNV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Posto / Fornecedor</Label>
                <Input value={form.posto} onChange={(e) => setForm({ ...form, posto: e.target.value })} placeholder="Ex: Posto Shell" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Nota Fiscal</Label>
                <Input value={form.nota_fiscal} onChange={(e) => setForm({ ...form, nota_fiscal: e.target.value })} placeholder="Nº da NF" />
              </div>

              {/* Flag sem saída de caixa */}
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Sem saída do caixa</p>
                  <p className="text-xs text-muted-foreground">Não desconta do caixa do entregador nem do caixa do dia</p>
                </div>
                <Switch
                  checked={form.sem_saida_caixa}
                  onCheckedChange={(v) => setForm({ ...form, sem_saida_caixa: v })}
                />
              </div>

              <Button onClick={handleSave} className="w-full gradient-primary text-white" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                {isSaving ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Histórico */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-5 w-5 text-primary" />
              Meus Abastecimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {abastecimentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Fuel className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum abastecimento registrado</p>
              </div>
            ) : (
              abastecimentos.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Fuel className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {(a.veiculos as any)?.placa || "-"} • {Number(a.litros)}L {a.tipo}
                      </p>
                      <Badge variant={a.status === "acertado" ? "default" : "secondary"} className="text-xs">
                        {a.status === "acertado" ? "Acertado" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {new Date(a.data).toLocaleDateString("pt-BR")}
                        {a.posto ? ` • ${a.posto}` : ""}
                        {a.sem_saida_caixa && " • Sem saída caixa"}
                      </div>
                      <p className="font-bold text-primary">R$ {Number(a.valor).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </EntregadorLayout>
  );
}
