import { MainLayout } from "@/components/layout/MainLayout";
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
import { UserPlus, Save, MapPin, Phone, Mail } from "lucide-react";

export default function CadastroClientes() {
  return (
    <MainLayout>
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
                  <Input placeholder="Nome do cliente" />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input placeholder="000.000.000-00" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Telefone *</Label>
                  <Input placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <Label>Telefone 2</Label>
                  <Input placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <Input type="date" />
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>Rua *</Label>
                  <Input placeholder="Nome da rua" />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input placeholder="123" />
                </div>
              </div>
              <div>
                <Label>Complemento</Label>
                <Input placeholder="Apto, bloco, etc." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Bairro *</Label>
                  <Input placeholder="Nome do bairro" />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input placeholder="00000-000" />
                </div>
              </div>
              <div>
                <Label>Ponto de Referência</Label>
                <Input placeholder="Próximo a..." />
              </div>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Forma de Pagamento Preferida</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="fiado">Fiado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Produto Preferido</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p13">Gás P13</SelectItem>
                    <SelectItem value="p20">Gás P20</SelectItem>
                    <SelectItem value="p45">Gás P45</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Intervalo Médio de Compra</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">A cada 15 dias</SelectItem>
                    <SelectItem value="30">A cada 30 dias</SelectItem>
                    <SelectItem value="45">A cada 45 dias</SelectItem>
                    <SelectItem value="60">A cada 60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Observações Gerais</Label>
                <Textarea
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Limite de Crédito</Label>
                <Input type="number" placeholder="0,00" step="0.01" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancelar</Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Cliente
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
