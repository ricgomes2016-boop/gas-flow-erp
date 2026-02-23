import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

interface Unidade {
  id: string;
  nome: string;
  tipo: string;
  empresa_id: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
}

interface EmpresaOption {
  id: string;
  nome: string;
}

export default function AdminUnidades() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("filial");
  const [empresaId, setEmpresaId] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const fetchData = async () => {
    const [unidadesRes, empresasRes] = await Promise.all([
      supabase.from("unidades").select("id, nome, tipo, empresa_id, endereco, cidade, estado, ativo").order("nome"),
      supabase.from("empresas").select("id, nome").eq("ativo", true).order("nome"),
    ]);

    setUnidades(unidadesRes.data || []);
    setEmpresas(empresasRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEmpresaNome = (id: string) => empresas.find((e) => e.id === id)?.nome || "—";

  const handleSave = async () => {
    if (!nome.trim() || !empresaId) {
      toast.error("Nome e empresa são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("unidades").insert({
        nome,
        tipo,
        empresa_id: empresaId,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        ativo: true,
      });

      if (error) throw error;
      toast.success("Unidade criada!");
      setDialogOpen(false);
      setNome("");
      setTipo("filial");
      setEmpresaId("");
      setEndereco("");
      setCidade("");
      setEstado("");
      fetchData();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Unidades</h1>
            <p className="text-muted-foreground">Gerencie filiais e matrizes de todas as empresas.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Unidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select value={empresaId} onValueChange={setEmpresaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da unidade" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matriz">Matriz</SelectItem>
                        <SelectItem value="filial">Filial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Unidade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : unidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma unidade cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  unidades.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell>{getEmpresaNome(u.empresa_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {[u.cidade, u.estado].filter(Boolean).join("/") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.ativo ? "default" : "destructive"}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
