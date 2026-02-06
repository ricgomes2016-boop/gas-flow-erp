import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Search, Edit, Trash2, Phone, MapPin, FileText, Loader2 } from "lucide-react";
import { CpfCnpjInput } from "@/components/ui/cpf-cnpj-input";
import { formatPhone, formatCEP, validateCpfCnpj } from "@/hooks/useInputMasks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  tipo: string | null;
  ativo: boolean | null;
  created_at: string;
}

interface FormData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  tipo: string;
}

const initialFormData: FormData = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
  bairro: "",
  cidade: "",
  cep: "",
  tipo: "residencial",
};

export default function CadastroClientesCad() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    residenciais: 0,
    comerciais: 0,
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClientes(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const ativos = data?.filter(c => c.ativo).length || 0;
      const residenciais = data?.filter(c => c.tipo === "residencial").length || 0;
      const comerciais = data?.filter(c => c.tipo === "comercial").length || 0;
      
      setStats({ total, ativos, residenciais, comerciais });
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buscarCEP = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      cpf: cliente.cpf || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      endereco: cliente.endereco || "",
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      cep: cliente.cep || "",
      tipo: cliente.tipo || "residencial",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.telefone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O telefone é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // Validar CPF/CNPJ se preenchido
    if (formData.cpf) {
      const cpfValidation = validateCpfCnpj(formData.cpf);
      const numbers = formData.cpf.replace(/\D/g, "");
      if ((numbers.length === 11 || numbers.length === 14) && !cpfValidation.valid) {
        toast({
          title: "CPF/CNPJ inválido",
          description: "Por favor, verifique o CPF/CNPJ informado.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      const clienteData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        endereco: formData.endereco || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        cep: formData.cep || null,
        tipo: formData.tipo,
      };

      if (editingCliente) {
        // Update
        const { error } = await supabase
          .from("clientes")
          .update(clienteData)
          .eq("id", editingCliente.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado!",
          description: `${formData.nome} foi atualizado com sucesso.`,
        });
      } else {
        // Create
        const { error } = await supabase
          .from("clientes")
          .insert({ ...clienteData, ativo: true });

        if (error) throw error;

        toast({
          title: "Cliente cadastrado!",
          description: `${formData.nome} foi adicionado com sucesso.`,
        });
      }

      setIsModalOpen(false);
      fetchClientes();
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o cliente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (cliente: Cliente) => {
    try {
      const { error } = await supabase
        .from("clientes")
        .update({ ativo: !cliente.ativo })
        .eq("id", cliente.id);

      if (error) throw error;

      toast({
        title: cliente.ativo ? "Cliente inativado" : "Cliente ativado",
        description: `${cliente.nome} foi ${cliente.ativo ? "inativado" : "ativado"}.`,
      });

      fetchClientes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar o status.",
        variant: "destructive",
      });
    }
  };

  // Filter clients
  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(term) ||
      cliente.telefone?.toLowerCase().includes(term) ||
      cliente.endereco?.toLowerCase().includes(term) ||
      cliente.bairro?.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Clientes</h1>
            <p className="text-muted-foreground">Gerencie todos os clientes da revenda</p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.ativos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Residenciais</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{stats.residenciais}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comerciais</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.comerciais}</div>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    className="pl-10 w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {cliente.telefone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {cliente.endereco || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{cliente.bairro || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={cliente.tipo === "comercial" ? "default" : "secondary"}>
                          {cliente.tipo === "comercial" ? "Comercial" : "Residencial"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cliente.ativo ? "default" : "destructive"}
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(cliente)}
                        >
                          {cliente.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(cliente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Cadastrar Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <CpfCnpjInput
                    value={formData.cpf}
                    onChange={(v) => handleChange("cpf", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone *</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", formatPhone(e.target.value))}
                    maxLength={16}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Cliente</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => handleChange("tipo", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => handleChange("cep", formatCEP(e.target.value))}
                    onBlur={buscarCEP}
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    placeholder="Rua, número"
                    value={formData.endereco}
                    onChange={(e) => handleChange("endereco", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Nome do bairro"
                    value={formData.bairro}
                    onChange={(e) => handleChange("bairro", e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Nome da cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCliente ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
