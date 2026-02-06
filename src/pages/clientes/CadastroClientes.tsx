import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Save, MapPin, Loader2 } from "lucide-react";
import { CpfCnpjInput } from "@/components/ui/cpf-cnpj-input";
import { formatPhone, formatCEP, validateCpfCnpj } from "@/hooks/useInputMasks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  nome: string;
  cpf: string;
  telefone: string;
  telefone2: string;
  email: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;
  tipo: string;
  observacoes: string;
}

const initialFormData: FormData = {
  nome: "",
  cpf: "",
  telefone: "",
  telefone2: "",
  email: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  cep: "",
  tipo: "residencial",
  observacoes: "",
};

export default function CadastroClientes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async () => {
    // Validações
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

    setIsLoading(true);

    try {
      // Montar endereço completo
      const enderecoCompleto = [
        formData.endereco,
        formData.numero && `Nº ${formData.numero}`,
        formData.complemento,
      ]
        .filter(Boolean)
        .join(", ");

      const { error } = await supabase.from("clientes").insert({
        nome: formData.nome.trim(),
        cpf: formData.cpf || null,
        telefone: formData.telefone,
        email: formData.email || null,
        endereco: enderecoCompleto || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        cep: formData.cep || null,
        tipo: formData.tipo,
        ativo: true,
      });

      if (error) throw error;

      toast({
        title: "Cliente cadastrado!",
        description: `${formData.nome} foi adicionado com sucesso.`,
      });

      // Limpar formulário ou redirecionar
      navigate("/cadastros/clientes");
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.nome || formData.telefone) {
      if (!confirm("Deseja descartar as alterações?")) return;
    }
    navigate("/cadastros/clientes");
  };

  return (
    <MainLayout>
      <Header title="Novo Cliente" subtitle="Cadastrar novo cliente" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Cadastro de Clientes
            </h1>
            <p className="text-muted-foreground">Adicionar novo cliente</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <CpfCnpjInput
                    value={formData.cpf}
                    onChange={(v) => handleChange("cpf", v)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Telefone *</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", formatPhone(e.target.value))}
                    maxLength={16}
                  />
                </div>
                <div>
                  <Label>Telefone 2</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={formData.telefone2}
                    onChange={(e) => handleChange("telefone2", formatPhone(e.target.value))}
                    maxLength={16}
                  />
                </div>
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div>
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
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => handleChange("cep", formatCEP(e.target.value))}
                    onBlur={buscarCEP}
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Nome da cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>Rua</Label>
                  <Input
                    placeholder="Nome da rua"
                    value={formData.endereco}
                    onChange={(e) => handleChange("endereco", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    placeholder="123"
                    value={formData.numero}
                    onChange={(e) => handleChange("numero", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Complemento</Label>
                <Input
                  placeholder="Apto, bloco, etc."
                  value={formData.complemento}
                  onChange={(e) => handleChange("complemento", e.target.value)}
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  placeholder="Nome do bairro"
                  value={formData.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Informações adicionais sobre o cliente..."
                rows={3}
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Cliente
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
