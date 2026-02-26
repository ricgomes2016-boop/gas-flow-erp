import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Loader2, Building2, Search } from "lucide-react";
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
  const [search, setSearch] = useState("");

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
    if (error) { console.error(error); return; }
    setEmpresas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEmpresas(); }, []);

  const resetForm = () => {
    setNome(""); setCnpj(""); setEmail(""); setTelefone(""); setPlano("starter"); setEditing(null);
  };

  const openEdit = (emp: Empresa) => {
    setEditing(emp); setNome(emp.nome); setCnpj(emp.cnpj || "");
    setEmail(emp.email || ""); setTelefone(emp.telefone || ""); setPlano(emp.plano);
    setDialogOpen(true);
  };

  const openNew = () => { resetForm(); setDialogOpen(true); };

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

  const handleSave = async () => {
    if (!nome.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    const planoConfig = PLANOS.find((p) => p.key === plano) || PLANOS[0];
    try {
      if (editing) {
        const { error } = await supabase.from("empresas").update({
          nome, cnpj: cnpj || null, email: email || null, telefone: telefone || null,
          plano, plano_max_usuarios: planoConfig.maxUsuarios, plano_max_unidades: planoConfig.maxUnidades,
        }).eq("id", editing.id);
        if (error) throw error;
        toast.success("Empresa atualizada!");
      } else {
        const { error } = await supabase.from("empresas").insert({
          nome, slug: generateSlug(nome), cnpj: cnpj || null, email: email || null,
          telefone: telefone || null, plano, plano_max_usuarios: planoConfig.maxUsuarios,
          plano_max_unidades: planoConfig.maxUnidades,
        });
        if (error) throw error;
        toast.success("Empresa criada!");
      }
      setDialogOpen(false); resetForm(); fetchEmpresas();
    } catch (error: any) { toast.error("Erro: " + error.message); }
    finally { setSaving(false); }
  };

  const toggleAtivo = async (emp: Empresa) => {
    const { error } = await supabase.from("empresas").update({ ativo: !emp.ativo }).eq("id", emp.id);
    if (error) { toast.error("Erro ao alterar status"); return; }
    toast.success(emp.ativo ? "Empresa desativada" : "Empresa reativada");
    fetchEmpresas();
  };

  const filtered = empresas.filter((e) =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    (e.cnpj && e.cnpj.includes(search))
  );

  const planoBadgeVariant = (p: string) => {
    if (p === "enterprise") return "default";
    if (p === "pro") return "secondary";
    return "outline";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Empresas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {empresas.length} {empresas.length === 1 ? "empresa cadastrada" : "empresas cadastradas"} na plataforma.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
                <DialogDescription>
                  {editing ? "Altere os dados da empresa." : "Cadastre uma nova empresa na plataforma."}
                </DialogDescription>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  {editing ? "Salvar Alterações" : "Criar Empresa"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/80"
          />
        </div>

        {/* Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">CNPJ</TableHead>
                  <TableHead className="font-semibold">Plano</TableHead>
                  <TableHead className="font-semibold">Limites</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Criada em</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {search ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          {emp.nome}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{emp.cnpj || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={planoBadgeVariant(emp.plano)} className="capitalize text-xs">
                          {emp.plano}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {emp.plano_max_usuarios} usr · {emp.plano_max_unidades} und
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.ativo ? "default" : "destructive"} className="text-xs">
                          {emp.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(emp.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleAtivo(emp)} className="text-xs">
                            {emp.ativo ? "Desativar" : "Reativar"}
                          </Button>
                        </div>
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
