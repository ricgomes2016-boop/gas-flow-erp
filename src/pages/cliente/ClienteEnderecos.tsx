import { useState, useEffect } from "react";
import { ClienteLayout } from "@/components/cliente/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit2, Trash2, Star, Home, Building, Save, X, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Endereco {
  id: string;
  apelido: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string | null;
  cep: string | null;
  principal: boolean | null;
}

const emptyEndereco = {
  apelido: "Casa",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  cep: "",
};

export default function ClienteEnderecos() {
  const { user } = useAuth();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEndereco);
  const [buscarCep, setBuscarCep] = useState(false);

  const fetchEnderecos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("cliente_enderecos")
      .select("*")
      .eq("user_id", user.id)
      .order("principal", { ascending: false });

    if (!error && data) {
      setEnderecos(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEnderecos();
  }, [user]);

  const handleCepBlur = async () => {
    const cep = form.cep?.replace(/\D/g, "");
    if (!cep || cep.length !== 8) return;
    setBuscarCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
        }));
      }
    } catch { /* ignore */ } finally {
      setBuscarCep(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.rua || !form.numero || !form.bairro) {
      toast.error("Preencha rua, número e bairro");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("cliente_enderecos")
        .update({
          apelido: form.apelido,
          rua: form.rua,
          numero: form.numero,
          complemento: form.complemento || null,
          bairro: form.bairro,
          cidade: form.cidade || null,
          cep: form.cep || null,
        })
        .eq("id", editingId);

      if (error) { toast.error("Erro ao salvar endereço"); return; }
      toast.success("Endereço atualizado!");
    } else {
      const isPrimeiro = enderecos.length === 0;
      const { error } = await supabase
        .from("cliente_enderecos")
        .insert({
          user_id: user.id,
          apelido: form.apelido,
          rua: form.rua,
          numero: form.numero,
          complemento: form.complemento || null,
          bairro: form.bairro,
          cidade: form.cidade || null,
          cep: form.cep || null,
          principal: isPrimeiro,
        });

      if (error) { toast.error("Erro ao salvar endereço"); return; }
      toast.success("Endereço adicionado!");
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyEndereco);
    fetchEnderecos();
  };

  const handleEdit = (e: Endereco) => {
    setForm({
      apelido: e.apelido,
      rua: e.rua,
      numero: e.numero,
      complemento: e.complemento || "",
      bairro: e.bairro,
      cidade: e.cidade || "",
      cep: e.cep || "",
    });
    setEditingId(e.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("cliente_enderecos")
      .delete()
      .eq("id", id);

    if (error) { toast.error("Erro ao excluir endereço"); return; }
    toast.success("Endereço removido");
    fetchEnderecos();
  };

  const handleSetPrincipal = async (id: string) => {
    if (!user) return;
    // Unset all
    await supabase.from("cliente_enderecos").update({ principal: false }).eq("user_id", user.id);
    // Set principal
    await supabase.from("cliente_enderecos").update({ principal: true }).eq("id", id);
    fetchEnderecos();
    toast.success("Endereço principal atualizado!");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyEndereco);
  };

  const apelidoOptions = ["Casa", "Trabalho", "Outro"];

  return (
    <ClienteLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Endereços Salvos</h1>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {editingId ? "Editar Endereço" : "Novo Endereço"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Apelido chips */}
              <div>
                <Label>Apelido</Label>
                <div className="flex gap-2 mt-1">
                  {apelidoOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, apelido: opt }))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        form.apelido === opt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {opt === "Casa" ? <span className="flex items-center gap-1"><Home className="h-3 w-3" />{opt}</span>
                       : opt === "Trabalho" ? <span className="flex items-center gap-1"><Building className="h-3 w-3" />{opt}</span>
                       : opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>CEP</Label>
                  <div className="relative">
                    <Input
                      placeholder="00000-000"
                      value={form.cep || ""}
                      onChange={e => setForm(prev => ({ ...prev, cep: e.target.value }))}
                      onBlur={handleCepBlur}
                      maxLength={9}
                    />
                    {buscarCep && (
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-pulse" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input
                    placeholder="123"
                    value={form.numero}
                    onChange={e => setForm(prev => ({ ...prev, numero: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Rua *</Label>
                <Input
                  placeholder="Nome da rua"
                  value={form.rua}
                  onChange={e => setForm(prev => ({ ...prev, rua: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Apto, bloco..."
                    value={form.complemento || ""}
                    onChange={e => setForm(prev => ({ ...prev, complemento: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Bairro *</Label>
                  <Input
                    placeholder="Bairro"
                    value={form.bairro}
                    onChange={e => setForm(prev => ({ ...prev, bairro: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Cidade</Label>
                <Input
                  placeholder="Cidade"
                  value={form.cidade || ""}
                  onChange={e => setForm(prev => ({ ...prev, cidade: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-1" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button variant="outline" className="flex-1 gap-1" onClick={cancelForm}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address list */}
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : enderecos.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhum endereço salvo</p>
            <Button className="mt-4 gap-1" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Adicionar endereço
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {enderecos.map(e => (
              <Card key={e.id} className={e.principal ? "border-primary/40 bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {e.apelido === "Casa" ? <Home className="h-4 w-4 text-primary" />
                          : e.apelido === "Trabalho" ? <Building className="h-4 w-4 text-primary" />
                          : <MapPin className="h-4 w-4 text-primary" />}
                        <span className="font-semibold">{e.apelido}</span>
                        {e.principal && (
                          <Badge className="text-xs gap-1">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {e.rua}, {e.numero}{e.complemento ? ` – ${e.complemento}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.bairro}{e.cidade ? `, ${e.cidade}` : ""}
                        {e.cep ? ` – CEP ${e.cep}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(e)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!e.principal && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {!e.principal && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleSetPrincipal(e.id)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Definir como principal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
