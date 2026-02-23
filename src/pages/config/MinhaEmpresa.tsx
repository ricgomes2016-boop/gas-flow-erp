import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Save, Loader2, Users, MapPin, Crown } from "lucide-react";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MinhaEmpresa() {
  const { empresa, refetch } = useEmpresa();
  const [isLoading, setIsLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);

  useEffect(() => {
    if (empresa) {
      setNome(empresa.nome);
      setCnpj(empresa.cnpj || "");
      setEmail(empresa.email || "");
      setTelefone(empresa.telefone || "");
      fetchStats();
    }
  }, [empresa]);

  const fetchStats = async () => {
    if (!empresa) return;
    const [usersRes, unidadesRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("empresa_id", empresa.id),
      supabase.from("unidades").select("id", { count: "exact", head: true }).eq("empresa_id", empresa.id),
    ]);
    setTotalUsuarios(usersRes.count || 0);
    setTotalUnidades(unidadesRes.count || 0);
  };

  const handleSave = async () => {
    if (!empresa) return;
    setIsLoading(true);
    const { error } = await supabase
      .from("empresas")
      .update({ nome, cnpj: cnpj || null, email: email || null, telefone: telefone || null })
      .eq("id", empresa.id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Dados da empresa atualizados!");
      await refetch();
    }
    setIsLoading(false);
  };

  const planoLabel: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  const planoColor: Record<string, string> = {
    starter: "secondary",
    pro: "default",
    enterprise: "destructive",
  };

  if (!empresa) {
    return (
      <MainLayout>
        <Header title="Minha Empresa" subtitle="Carregando..." />
        <div className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Minha Empresa" subtitle="Gerencie os dados da sua distribuidora" />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Plan & Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plano</CardTitle>
              <Crown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <Badge variant={planoColor[empresa.plano] as any || "secondary"} className="text-lg px-3 py-1">
                {planoLabel[empresa.plano] || empresa.plano}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUsuarios} <span className="text-sm font-normal text-muted-foreground">/ {empresa.plano_max_usuarios}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unidades</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUnidades} <span className="text-sm font-normal text-muted-foreground">/ {empresa.plano_max_unidades}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações cadastrais da sua distribuidora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Slug: <code className="bg-muted px-2 py-0.5 rounded">{empresa.slug}</code>
              </p>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
