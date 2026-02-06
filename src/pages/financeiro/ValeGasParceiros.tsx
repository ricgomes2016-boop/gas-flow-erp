import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useValeGas, TipoParceiro } from "@/contexts/ValeGasContext";
import { 
  Building2, 
  Plus, 
  CreditCard,
  TrendingUp,
  Package,
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ValeGasParceiros() {
  const { parceiros, addParceiro, getEstatisticasParceiro } = useValeGas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    tipo: "prepago" as TipoParceiro,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addParceiro({ ...formData, ativo: true });
    toast.success("Parceiro cadastrado com sucesso!");
    setDialogOpen(false);
    setFormData({ nome: "", cnpj: "", telefone: "", email: "", endereco: "", tipo: "prepago" });
  };

  const totais = {
    prepago: parceiros.filter(p => p.tipo === "prepago").length,
    consignado: parceiros.filter(p => p.tipo === "consignado").length,
    ativos: parceiros.filter(p => p.ativo).length,
  };

  return (
    <MainLayout>
      <Header title="Parceiros Vale Gás" subtitle="Cadastro e gestão de parceiros" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Parceiros Vale Gás</h1>
            <p className="text-muted-foreground">Gerencie os parceiros que vendem vale gás</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Parceiro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Cadastrar Parceiro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome/Razão Social</Label>
                  <Input
                    value={formData.nome}
                    onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do parceiro"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={formData.cnpj}
                      onChange={e => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0001-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.telefone}
                      onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@parceiro.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.endereco}
                    onChange={e => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Endereço completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Parceiro</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v: TipoParceiro) => setFormData(prev => ({ ...prev, tipo: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepago">Pré-pago (paga antecipado)</SelectItem>
                      <SelectItem value="consignado">Consignado (acerto posterior)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.tipo === "prepago" 
                      ? "Parceiro compra os vales antecipadamente com prazo de pagamento"
                      : "Parceiro recebe vales em consignação e paga após a utilização"}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Cadastrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{parceiros.length}</p>
                  <p className="text-sm text-muted-foreground">Total Parceiros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totais.prepago}</p>
                  <p className="text-sm text-muted-foreground">Pré-pago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Package className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totais.consignado}</p>
                  <p className="text-sm text-muted-foreground">Consignado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totais.ativos}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de parceiros */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Parceiros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Total Vales</TableHead>
                  <TableHead className="text-center">Utilizados</TableHead>
                  <TableHead className="text-right">Valor Pendente</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parceiros.map(parceiro => {
                  const stats = getEstatisticasParceiro(parceiro.id);
                  return (
                    <TableRow key={parceiro.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{parceiro.nome}</p>
                          <p className="text-xs text-muted-foreground">{parceiro.cnpj}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={parceiro.tipo === "prepago" ? "default" : "secondary"}>
                          {parceiro.tipo === "prepago" ? "Pré-pago" : "Consignado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            {parceiro.telefone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {parceiro.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{stats.totalVales}</TableCell>
                      <TableCell className="text-center">{stats.valesUtilizados}</TableCell>
                      <TableCell className="text-right">
                        {stats.valorPendente > 0 ? (
                          <span className="text-amber-600 font-medium">
                            R$ {stats.valorPendente.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-green-600">Quitado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={parceiro.ativo ? "outline" : "destructive"}>
                          {parceiro.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
