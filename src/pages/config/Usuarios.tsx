import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserPlus, Loader2, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AppRole } from "@/contexts/AuthContext";

interface UserWithRoles {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  roles: AppRole[];
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  financeiro: "Financeiro",
  operacional: "Operacional",
  entregador: "Entregador",
  cliente: "Cliente",
};

const roleBadgeColors: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  gestor: "bg-primary/10 text-primary",
  financeiro: "bg-chart-2/20 text-chart-2",
  operacional: "bg-chart-3/20 text-chart-3",
  entregador: "bg-chart-4/20 text-chart-4",
  cliente: "bg-muted text-muted-foreground",
};

export default function Usuarios() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "operacional" as AppRole,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error("Erro ao carregar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.password) {
      toast.error("Preencha nome, email e senha.");
      return;
    }
    if (newUser.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "create",
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          phone: newUser.phone || undefined,
          role: newUser.role,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Usuário criado com sucesso!");
      setDialogOpen(false);
      setNewUser({ full_name: "", email: "", password: "", phone: "", role: "operacional" });
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao criar usuário: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: AppRole) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "update_role", user_id: userId, role },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Cargo atualizado!");
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao atualizar cargo: " + err.message);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "delete", user_id: userId },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Usuário excluído!");
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao excluir: " + err.message);
    }
  };

  return (
    <MainLayout>
      <Header title="Cadastro de Usuários" subtitle="Gerencie os usuários e permissões do sistema" />
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Usuários do Sistema
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      value={newUser.full_name}
                      onChange={(e) => setNewUser((p) => ({ ...p, full_name: e.target.value }))}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha *</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={newUser.phone}
                      onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo / Perfil *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(v) => setNewUser((p) => ({ ...p, role: v as AppRole }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum usuário cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={user.roles[0] || "operacional"}
                            onValueChange={(v) => handleUpdateRole(user.user_id, v as AppRole)}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir <strong>{user.full_name}</strong>? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
