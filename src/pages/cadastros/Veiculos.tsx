import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Truck, Plus, Search, Edit, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";

interface Entregador {
  id: string;
  nome: string;
}

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string | null;
  ano: number | null;
  km_atual: number | null;
  tipo: string | null;
  ativo: boolean | null;
  entregador_id: string | null;
}

const emptyForm = { placa: "", modelo: "", marca: "", ano: "", km_atual: "", tipo: "moto", entregador_id: "" };

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const { unidadeAtual } = useUnidade();

  const fetchVeiculos = async () => {
    let query = supabase
      .from("veiculos")
      .select("*")
      .eq("ativo", true)
      .order("placa");
    
    if (unidadeAtual?.id) {
      query = query.or(`unidade_id.eq.${unidadeAtual.id},unidade_id.is.null`);
    }

    const [{ data, error }, { data: entData }] = await Promise.all([
      query,
      supabase.from("entregadores").select("id, nome").eq("ativo", true).order("nome"),
    ]);
    if (error) { console.error(error); return; }
    setVeiculos((data || []) as Veiculo[]);
    setEntregadores(entData || []);
    setLoading(false);
  };

  useEffect(() => { fetchVeiculos(); }, [unidadeAtual?.id]);

  const handleSave = async () => {
    if (!form.placa.trim() || !form.modelo.trim()) {
      toast.error("Placa e Modelo são obrigatórios");
      return;
    }
    const payload: any = {
      placa: form.placa,
      modelo: form.modelo,
      marca: form.marca || null,
      ano: form.ano ? parseInt(form.ano) : null,
      km_atual: form.km_atual ? parseFloat(form.km_atual) : 0,
      tipo: form.tipo || "moto",
      entregador_id: form.entregador_id || null,
    };
    if (!editId && unidadeAtual?.id) {
      payload.unidade_id = unidadeAtual.id;
    }

    if (editId) {
      const { error } = await supabase.from("veiculos").update(payload).eq("id", editId);
      if (error) { toast.error("Erro ao atualizar: " + error.message); return; }
      toast.success("Veículo atualizado!");
    } else {
      const { error } = await supabase.from("veiculos").insert(payload);
      if (error) { toast.error("Erro ao salvar: " + error.message); return; }
      toast.success("Veículo cadastrado!");
    }
    setOpen(false);
    setForm(emptyForm);
    setEditId(null);
    fetchVeiculos();
  };

  const handleEdit = (v: Veiculo) => {
    setForm({
      placa: v.placa,
      modelo: v.modelo,
      marca: v.marca || "",
      ano: v.ano?.toString() || "",
      km_atual: v.km_atual?.toString() || "",
      tipo: v.tipo || "moto",
      entregador_id: v.entregador_id || "",
    });
    setEditId(v.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("veiculos").update({ ativo: false }).eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Veículo removido");
    fetchVeiculos();
  };

  const getEntregadorNome = (id: string | null) => {
    if (!id) return null;
    return entregadores.find(e => e.id === id)?.nome || null;
  };

  const filtered = veiculos.filter(v =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <Header title="Veículos" subtitle="Gerencie a frota de veículos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditId(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Novo Veículo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editId ? "Editar Veículo" : "Cadastrar Novo Veículo"}</DialogTitle>
                <DialogDescription>Preencha os dados do veículo</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Placa *</Label>
                  <Input value={form.placa} onChange={e => setForm({...form, placa: e.target.value})} placeholder="ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label>Modelo *</Label>
                  <Input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} placeholder="Fiorino 1.4" />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} placeholder="Fiat" />
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} placeholder="2023" />
                </div>
                <div className="space-y-2">
                  <Label>KM Atual</Label>
                  <Input value={form.km_atual} onChange={e => setForm({...form, km_atual: e.target.value})} placeholder="45000" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} placeholder="moto, carro, caminhão" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Entregador Vinculado</Label>
                  <Select value={form.entregador_id} onValueChange={(v) => setForm({...form, entregador_id: v === "none" ? "" : v})}>
                    <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {entregadores.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>{editId ? "Atualizar" : "Salvar"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{veiculos.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Motos</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{veiculos.filter(v => v.tipo === "moto").length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Com Entregador</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{veiculos.filter(v => v.entregador_id).length}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Veículos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-10 w-[250px]" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground">Carregando...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entregador</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.placa}</TableCell>
                      <TableCell>{v.modelo}</TableCell>
                      <TableCell>{v.marca || "-"}</TableCell>
                      <TableCell>{v.ano || "-"}</TableCell>
                      <TableCell>{v.km_atual?.toLocaleString("pt-BR") || 0} km</TableCell>
                      <TableCell><Badge variant="outline">{v.tipo || "-"}</Badge></TableCell>
                      <TableCell>
                        {getEntregadorNome(v.entregador_id) ? (
                          <Badge variant="secondary" className="gap-1">
                            <User className="h-3 w-3" />
                            {getEntregadorNome(v.entregador_id)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum veículo encontrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
