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
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Truck, Plus, Search, Edit, Trash2, Phone, LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Entregador {
  id: string;
  nome: string;
  cpf: string | null;
  cnh: string | null;
  telefone: string | null;
  email: string | null;
  status: string | null;
  ativo: boolean | null;
  user_id: string | null;
}

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
}

export default function Entregadores() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [form, setForm] = useState({
    nome: "", cpf: "", cnh: "", telefone: "", email: "", user_id: "",
  });

  const fetchEntregadores = async () => {
    const { data, error } = await supabase
      .from("entregadores")
      .select("*")
      .order("nome");
    if (error) { console.error(error); return; }
    setEntregadores((data || []).filter(e => e.ativo !== false));
    setLoading(false);
  };

  const fetchUsers = async () => {
    // Buscar usuários com role 'entregador'
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "entregador");
    
    if (rolesError || !roles?.length) return;

    const userIds = roles.map(r => r.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    if (profilesError) { console.error(profilesError); return; }
    setUsers(profiles || []);
  };

  useEffect(() => { 
    fetchEntregadores(); 
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }

    const payload = {
      nome: form.nome,
      cpf: form.cpf || null,
      cnh: form.cnh || null,
      telefone: form.telefone || null,
      email: form.email || null,
      user_id: form.user_id || null,
    };

    if (editId) {
      const { error } = await supabase.from("entregadores").update(payload).eq("id", editId);
      if (error) { toast.error("Erro: " + error.message); return; }
      toast.success("Entregador atualizado!");
    } else {
      const { error } = await supabase.from("entregadores").insert(payload);
      if (error) { toast.error("Erro: " + error.message); return; }
      toast.success("Entregador cadastrado!");
    }

    setOpen(false);
    setEditId(null);
    setForm({ nome: "", cpf: "", cnh: "", telefone: "", email: "", user_id: "" });
    fetchEntregadores();
  };

  const handleEdit = (e: Entregador) => {
    setEditId(e.id);
    setForm({
      nome: e.nome, cpf: e.cpf || "", cnh: e.cnh || "",
      telefone: e.telefone || "", email: e.email || "",
      user_id: e.user_id || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("entregadores").update({ ativo: false }).eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Entregador removido");
    fetchEntregadores();
  };

  const filtered = entregadores.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    (e.cpf || "").includes(search)
  );

  const statusLabel = (s: string | null) => {
    if (s === "em_rota") return "Em Rota";
    if (s === "indisponivel") return "Indisponível";
    return "Disponível";
  };

  const statusVariant = (s: string | null) => {
    if (s === "em_rota") return "secondary" as const;
    if (s === "indisponivel") return "destructive" as const;
    return "default" as const;
  };

  // IDs de usuários já vinculados a outros entregadores
  const linkedUserIds = entregadores
    .filter(e => e.user_id && e.id !== editId)
    .map(e => e.user_id);

  const availableUsers = users.filter(u => !linkedUserIds.includes(u.user_id));

  return (
    <MainLayout>
      <Header title="Entregadores" subtitle="Cadastro de entregadores" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entregadores</h1>
            <p className="text-muted-foreground">Gerencie a equipe de entregadores</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ nome: "", cpf: "", cnh: "", telefone: "", email: "", user_id: "" }); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Novo Entregador</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editId ? "Editar" : "Cadastrar"} Entregador</DialogTitle>
                <DialogDescription>Preencha os dados do entregador</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome do entregador" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CPF</Label>
                    <Input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <Label>CNH</Label>
                    <Input value={form.cnh} onChange={e => setForm({...form, cnh: e.target.value})} placeholder="Número da CNH" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telefone</Label>
                    <Input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    <LinkIcon className="h-3.5 w-3.5" />
                    Vincular ao Usuário do Sistema
                  </Label>
                  <Select value={form.user_id} onValueChange={(v) => setForm({...form, user_id: v === "none" ? "" : v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {availableUsers.map(u => (
                        <SelectItem key={u.user_id} value={u.user_id}>
                          {u.full_name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vincule a um usuário com perfil "entregador" para acesso ao app.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave}>{editId ? "Salvar" : "Cadastrar"}</Button>
                </div>
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
            <CardContent><div className="text-2xl font-bold">{entregadores.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{entregadores.filter(e => e.status === "disponivel" || !e.status).length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Rota</CardTitle>
              <Truck className="h-4 w-4 text-secondary-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{entregadores.filter(e => e.status === "em_rota").length}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Entregadores</CardTitle>
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
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>CNH</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Vinculado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(e => {
                    const linkedUser = users.find(u => u.user_id === e.user_id);
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.nome}</TableCell>
                        <TableCell>{e.cpf || "-"}</TableCell>
                        <TableCell>{e.cnh || "-"}</TableCell>
                        <TableCell>{e.telefone ? <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{e.telefone}</span> : "-"}</TableCell>
                        <TableCell>
                          {linkedUser ? (
                            <Badge variant="outline" className="gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {linkedUser.email}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Não vinculado</span>
                          )}
                        </TableCell>
                        <TableCell><Badge variant={statusVariant(e.status)}>{statusLabel(e.status)}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum entregador encontrado</TableCell></TableRow>
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
