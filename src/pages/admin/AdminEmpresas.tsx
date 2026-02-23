import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Empresa {
  id: string;
  nome: string;
  slug: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  plano: string;
  plano_max_usuarios: number;
  plano_max_unidades: number;
  ativo: boolean;
  created_at: string;
}

const PLANOS = [
  { key: "starter", label: "Starter", maxUsuarios: 5, maxUnidades: 1 },
  { key: "pro", label: "Pro", maxUsuarios: 15, maxUnidades: 3 },
  { key: "enterprise", label: "Enterprise", maxUsuarios: 50, maxUnidades: 10 },
];

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [plano, setPlano] = useState("starter");

  const fetchEmpresas = async () => {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setEmpresas(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const resetForm = () => {
    setNome("");
    setCnpj("");
    setEmail("");
    setTelefone("");
    setPlano("starter");
    setEditing(null);
  };

  const openEdit = (emp: Empresa) => {
    setEditing(emp);
    setNome(emp.nome);
    setCnpj(emp.cnpj || "");
    setEmail(emp.email || "");
    setTelefone(emp.telefone || "");
    setPlano(emp.plano);
    setDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);
    const planoConfig = PLANOS.find((p) => p.key === plano) || PLANOS[0];

    try {
      if (editing) {
        const { error } = await supabase
          .from("empresas")
          .update({
            nome,
            cnpj: cnpj || null,
            email: email || null,
            telefone: telefone || null,
            plano,
            plano_max_usuarios: planoConfig.maxUsuarios,
            plano_max_unidades: planoConfig.maxUnidades,
          })
          .eq("id", editing.id);

        if (error) throw error;
        toast.success("Empresa atualizada!");
      } else {
        const { error } = await supabase.from("empresas").insert({
          nome,
          slug: generateSlug(nome),
          cnpj: cnpj || null,
          email: email || null,
          telefone: telefone || null,
          plano,
          plano_max_usuarios: planoConfig.maxUsuarios,
          plano_max_unidades: planoConfig.maxUnidades,
        });

        if (error) throw error;
        toast.success("Empresa criada!");
      }

      setDialogOpen(false);
      resetForm();
      fetchEmpresas();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAtivo = async (emp: Empresa) => {
    const { error } = await supabase
      .from("empresas")
      .update({ ativo: !emp.ativo })
      .eq("id", emp.id);

    if (error) {
      toast.error("Erro ao alterar status");
      return;
    }
    toast.success(emp.ativo ? "Empresa desativada" : "Empresa reativada");
    fetchEmpresas();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">Gerencie todas as empresas da plataforma.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da empresa" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plano</Label>
                  <Select value={plano} onValueChange={setPlano}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANOS.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          {p.label} ({p.maxUsuarios} usuários, {p.maxUnidades} unidades)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editing ? "Salvar" : "Criar Empresa"}
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
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : empresas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  empresas.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.cnpj || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{emp.plano}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.ativo ? "default" : "destructive"}>
                          {emp.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(emp.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAtivo(emp)}
                        >
                          {emp.ativo ? "Desativar" : "Reativar"}
                        </Button>
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
