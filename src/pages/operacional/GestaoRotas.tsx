import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RotaDefinida {
  id: string;
  nome: string;
  bairros: string[];
  distancia_km: number | null;
  tempo_estimado: string | null;
  ativo: boolean;
}

export default function GestaoRotas() {
  const [rotas, setRotas] = useState<RotaDefinida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRota, setEditingRota] = useState<RotaDefinida | null>(null);

  const [nome, setNome] = useState("");
  const [bairrosText, setBairrosText] = useState("");
  const [distanciaKm, setDistanciaKm] = useState("");
  const [tempoEstimado, setTempoEstimado] = useState("");

  const { toast } = useToast();

  useEffect(() => { fetchRotas(); }, []);

  const fetchRotas = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("rotas_definidas")
      .select("*")
      .order("nome");
    if (data) setRotas(data as unknown as RotaDefinida[]);
    setIsLoading(false);
  };

  const openNew = () => {
    setEditingRota(null);
    setNome("");
    setBairrosText("");
    setDistanciaKm("");
    setTempoEstimado("");
    setModalOpen(true);
  };

  const openEdit = (rota: RotaDefinida) => {
    setEditingRota(rota);
    setNome(rota.nome);
    setBairrosText((rota.bairros as string[]).join(", "));
    setDistanciaKm(rota.distancia_km?.toString() || "");
    setTempoEstimado(rota.tempo_estimado || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast({ title: "Informe o nome da rota", variant: "destructive" });
      return;
    }

    const bairros = bairrosText.split(",").map((b) => b.trim()).filter(Boolean);
    const payload = {
      nome: nome.trim(),
      bairros,
      distancia_km: distanciaKm ? parseFloat(distanciaKm) : null,
      tempo_estimado: tempoEstimado || null,
    };

    if (editingRota) {
      const { error } = await supabase
        .from("rotas_definidas")
        .update(payload)
        .eq("id", editingRota.id);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Rota atualizada!" });
    } else {
      const { error } = await supabase.from("rotas_definidas").insert(payload);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Rota criada!" });
    }

    setModalOpen(false);
    fetchRotas();
  };

  const toggleAtivo = async (rota: RotaDefinida) => {
    await supabase.from("rotas_definidas").update({ ativo: !rota.ativo }).eq("id", rota.id);
    fetchRotas();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rotas_definidas").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rota excluída!" });
      fetchRotas();
    }
  };

  return (
    <MainLayout>
      <Header title="Gestão de Rotas" subtitle="Criar e editar rotas de entrega" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Rota
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Bairros</TableHead>
                    <TableHead>Distância</TableHead>
                    <TableHead>Tempo Est.</TableHead>
                    <TableHead>Ativa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rotas.map((rota) => (
                    <TableRow key={rota.id}>
                      <TableCell className="font-medium">{rota.nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(rota.bairros as string[]).map((b) => (
                            <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{rota.distancia_km ? `${rota.distancia_km} km` : "—"}</TableCell>
                      <TableCell>{rota.tempo_estimado || "—"}</TableCell>
                      <TableCell>
                        <Switch checked={rota.ativo} onCheckedChange={() => toggleAtivo(rota)} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(rota)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rota.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rotas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma rota cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {editingRota ? "Editar Rota" : "Nova Rota"}
            </DialogTitle>
            <DialogDescription>
              Defina os bairros e informações da rota.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nome da Rota *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Rota Centro" />
            </div>
            <div className="space-y-2">
              <Label>Bairros (separados por vírgula)</Label>
              <Input value={bairrosText} onChange={(e) => setBairrosText(e.target.value)} placeholder="Centro, Vila Nova, Jardim Europa" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Distância (km)</Label>
                <Input type="number" value={distanciaKm} onChange={(e) => setDistanciaKm(e.target.value)} placeholder="12" />
              </div>
              <div className="space-y-2">
                <Label>Tempo estimado</Label>
                <Input value={tempoEstimado} onChange={(e) => setTempoEstimado(e.target.value)} placeholder="4h" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} className="flex-1">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
