import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
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
import { Users, Plus, Search, Edit, Trash2, Phone, MapPin, FileText, Loader2, Camera, Check, X, Filter, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showFilters, setShowFilters] = useState(false);
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterDataInicio, setFilterDataInicio] = useState("");
  const [filterDataFim, setFilterDataFim] = useState("");
  const [filterBairro, setFilterBairro] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Photo import state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [extractedClients, setExtractedClients] = useState<FormData[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const checkDuplicates = async (nome: string, cpf: string, excludeId?: string) => {
    try {
      // Check nome duplicado (case-insensitive)
      const { data: nomeResults, error: nomeError } = await supabase
        .from("clientes")
        .select("id")
        .ilike("nome", `%${nome.trim()}%`);
      
      if (nomeError) throw nomeError;

      // Se está editando e o nome é o mesmo, não é duplicado
      if (nomeResults && nomeResults.length > 0) {
        if (nomeResults.length > 1 || (nomeResults.length === 1 && nomeResults[0].id !== excludeId)) {
          toast({
            title: "Nome duplicado",
            description: "Já existe um cliente com este nome.",
            variant: "destructive",
          });
          return false;
        }
      }

      // Check CPF se preenchido
      if (cpf && cpf.trim()) {
        const cpfClean = cpf.replace(/\D/g, "");
        const { data: allClientes, error: fetchError } = await supabase
          .from("clientes")
          .select("id, cpf");
        
        if (fetchError) throw fetchError;
        
        const duplicated = allClientes?.find(c => {
          const existingCpf = c.cpf?.replace(/\D/g, "");
          return existingCpf === cpfClean && c.id !== excludeId;
        });
        
        if (duplicated) {
          toast({
            title: "CPF duplicado",
            description: "Já existe um cliente com este CPF.",
            variant: "destructive",
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar duplicatas.",
        variant: "destructive",
      });
      return false;
    }
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

    // Verificar duplicatas
    const noDuplicates = await checkDuplicates(formData.nome, formData.cpf, editingCliente?.id);
    if (!noDuplicates) return;

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

  // Photo import functions
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG ou WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB.", variant: "destructive" });
      return;
    }

    setIsProcessingPhoto(true);
    setIsPhotoModalOpen(true);
    setExtractedClients([]);
    setSelectedClients(new Set());

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("extract-clients-from-image", {
        body: { image_base64: base64, mime_type: file.type },
      });

      if (error) throw error;
      if (!data?.clientes || data.clientes.length === 0) {
        toast({ title: "Nenhum cliente encontrado", description: "A IA não conseguiu extrair dados da imagem.", variant: "destructive" });
        setIsPhotoModalOpen(false);
        return;
      }

      const mapped: FormData[] = data.clientes.map((c: any) => ({
        nome: c.nome || "",
        cpf: c.cpf || "",
        telefone: c.telefone || "",
        email: c.email || "",
        endereco: [c.endereco, c.numero ? `Nº ${c.numero}` : ""].filter(Boolean).join(", "),
        bairro: c.bairro || "",
        cidade: c.cidade || "",
        cep: c.cep || "",
        tipo: c.tipo || "residencial",
      }));

      setExtractedClients(mapped);
      setSelectedClients(new Set(mapped.map((_, i) => i)));
      toast({ title: `${mapped.length} cliente(s) encontrado(s)!`, description: "Revise e confirme o cadastro." });
    } catch (error: any) {
      console.error("Erro ao processar foto:", error);
      toast({ title: "Erro ao processar", description: error.message || "Falha na leitura da imagem.", variant: "destructive" });
      setIsPhotoModalOpen(false);
    } finally {
      setIsProcessingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleSaveBulkClients = async () => {
    const toSave = extractedClients.filter((_, i) => selectedClients.has(i));
    if (toSave.length === 0) {
      toast({ title: "Nenhum cliente selecionado", variant: "destructive" });
      return;
    }

    setIsSavingBulk(true);
    try {
      // Buscar todos os clientes existentes para validação
      const { data: existingClientes, error: fetchError } = await supabase
        .from("clientes")
        .select("id, nome, cpf");
      
      if (fetchError) throw fetchError;

      const skipped: string[] = [];
      const inserts = [];

      for (const c of toSave) {
        // Verificar nome duplicado (case-insensitive)
        const nomeDuplicated = existingClientes?.some(
          ec => ec.nome.toLowerCase().trim() === c.nome.toLowerCase().trim()
        );
        
        if (nomeDuplicated) {
          skipped.push(`${c.nome} (nome duplicado)`);
          continue;
        }

        // Verificar CPF duplicado
        if (c.cpf && c.cpf.trim()) {
          const cpfClean = c.cpf.replace(/\D/g, "");
          const cpfDuplicated = existingClientes?.some(ec => {
            const existingCpf = ec.cpf?.replace(/\D/g, "");
            return existingCpf === cpfClean;
          });
          
          if (cpfDuplicated) {
            skipped.push(`${c.nome} (CPF duplicado)`);
            continue;
          }
        }

        inserts.push({
          nome: c.nome.trim(),
          cpf: c.cpf || null,
          telefone: c.telefone || null,
          email: c.email || null,
          endereco: c.endereco || null,
          bairro: c.bairro || null,
          cidade: c.cidade || null,
          cep: c.cep || null,
          tipo: c.tipo,
          ativo: true,
        });
      }

      if (inserts.length > 0) {
        const { error: insertError } = await supabase.from("clientes").insert(inserts);
        if (insertError) throw insertError;
      }

      let message = `${inserts.length} cliente(s) cadastrado(s) com sucesso.`;
      if (skipped.length > 0) {
        message += `\n\n${skipped.length} cliente(s) ignorado(s):\n${skipped.join("\n")}`;
      }

      toast({ 
        title: inserts.length > 0 ? "Importação concluída" : "Nenhum cliente foi importado",
        description: message
      });
      
      if (inserts.length > 0) {
        setIsPhotoModalOpen(false);
        setExtractedClients([]);
        fetchClientes();
      }
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingBulk(false);
    }
  };

  const toggleClientSelection = (index: number) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Filter clients
  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      cliente.nome.toLowerCase().includes(term) ||
      cliente.telefone?.toLowerCase().includes(term) ||
      cliente.endereco?.toLowerCase().includes(term) ||
      cliente.bairro?.toLowerCase().includes(term) ||
      cliente.cpf?.includes(term);

    const matchesTipo = filterTipo === "todos" || cliente.tipo === filterTipo;
    
    const matchesStatus = filterStatus === "todos" || 
      (filterStatus === "ativo" && cliente.ativo) ||
      (filterStatus === "inativo" && !cliente.ativo);

    const clienteDate = new Date(cliente.created_at);
    const matchesDataInicio = !filterDataInicio || clienteDate >= new Date(filterDataInicio);
    const matchesDataFim = !filterDataFim || clienteDate <= new Date(filterDataFim + "T23:59:59");

    const matchesBairro = !filterBairro || 
      cliente.bairro?.toLowerCase().includes(filterBairro.toLowerCase());

    return matchesSearch && matchesTipo && matchesStatus && matchesDataInicio && matchesDataFim && matchesBairro;
  });

  const clearFilters = () => {
    setFilterTipo("todos");
    setFilterStatus("todos");
    setFilterDataInicio("");
    setFilterDataFim("");
    setFilterBairro("");
    setSearchTerm("");
  };

  const hasActiveFilters = filterTipo !== "todos" || filterStatus !== "todos" || filterDataInicio || filterDataFim || filterBairro;

  // Extrair bairros únicos para o select
  const bairrosUnicos = Array.from(new Set(clientes.map(c => c.bairro).filter(Boolean) as string[])).sort();

  return (
    <MainLayout>
      <Header title="Cadastro de Clientes" subtitle="Gerencie os clientes da revenda" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Clientes</h1>
            <p className="text-muted-foreground">Gerencie todos os clientes da revenda</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <Button variant="outline" className="gap-2" onClick={() => photoInputRef.current?.click()}>
              <Camera className="h-4 w-4" />
              Importar por Foto
            </Button>
            <Button className="gap-2" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Clientes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button 
                    variant={showFilters ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative"
                  >
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Filtros avançados */}
              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-lg bg-muted/50 border">
                  <div>
                    <Label className="text-xs font-medium">Tipo</Label>
                    <Select value={filterTipo} onValueChange={setFilterTipo}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="residencial">Residencial</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Cadastro de</Label>
                    <Input 
                      type="date" 
                      value={filterDataInicio} 
                      onChange={(e) => setFilterDataInicio(e.target.value)} 
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Cadastro até</Label>
                    <Input 
                      type="date" 
                      value={filterDataFim} 
                      onChange={(e) => setFilterDataFim(e.target.value)} 
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Bairro</Label>
                    <Select value={filterBairro || "todos"} onValueChange={(v) => setFilterBairro(v === "todos" ? "" : v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {bairrosUnicos.map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <div className="col-span-full flex justify-between items-center pt-1">
                      <span className="text-xs text-muted-foreground">
                        {filteredClientes.length} de {clientes.length} cliente(s)
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                        <X className="h-3 w-3 mr-1" /> Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell className="text-sm">{cliente.cpf || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {cliente.telefone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cliente.tipo || "Não especificado"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cliente.ativo ? "default" : "destructive"}>
                          {cliente.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(cliente)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(cliente)}
                          >
                            {cliente.ativo ? (
                              <X className="h-4 w-4 text-destructive" />
                            ) : (
                              <Check className="h-4 w-4 text-success" />
                            )}
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
      </div>

      {/* Modal para criar/editar cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CPF/CNPJ</Label>
                <CpfCnpjInput
                  value={formData.cpf}
                  onChange={(value) => handleChange("cpf", value)}
                />
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label>CEP</Label>
              <div className="flex gap-2">
                <Input
                  value={formatCEP(formData.cep)}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  placeholder="00000-000"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={buscarCEP}
                  disabled={formData.cep.replace(/\D/g, "").length !== 8}
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div>
              <Label>Endereço</Label>
              <Input
                value={formData.endereco}
                onChange={(e) => handleChange("endereco", e.target.value)}
                placeholder="Rua/Avenida"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Bairro</Label>
                <Input
                  value={formData.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para importar por foto */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Importar Clientes da Foto</DialogTitle>
          </DialogHeader>
          {isProcessingPhoto ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p>Processando imagem...</p>
              </div>
            </div>
          ) : extractedClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum cliente extraído</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {extractedClients.map((client, index) => (
                  <div key={index} className="flex gap-3 items-start border p-3 rounded-lg">
                    <Checkbox
                      checked={selectedClients.has(index)}
                      onCheckedChange={() => toggleClientSelection(index)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{client.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.cpf && `CPF: ${client.cpf} • `}
                        {client.telefone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveBulkClients} disabled={isSavingBulk || selectedClients.size === 0}>
                  {isSavingBulk ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    `Importar ${selectedClients.size} cliente(s)`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
