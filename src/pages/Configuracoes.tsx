import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Building, CreditCard, Bell, Shield, Printer, Users } from "lucide-react";

export default function Configuracoes() {
  return (
    <MainLayout>
      <Header title="Configurações" subtitle="Gerencie as configurações do sistema" />
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle>Dados da Empresa</CardTitle>
              </div>
              <CardDescription>
                Informações básicas da sua revenda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                <Input id="nomeEmpresa" defaultValue="GásPro Revenda" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="12.345.678/0001-90" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" defaultValue="(11) 3333-4444" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" defaultValue="Av. Principal, 100 - Centro" />
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>

          {/* Preços */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle>Tabela de Preços</CardTitle>
              </div>
              <CardDescription>
                Configure os preços dos produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="precoP13">Botijão P13</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">R$</span>
                  <Input id="precoP13" type="number" defaultValue="110.00" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precoP20">Botijão P20</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">R$</span>
                  <Input id="precoP20" type="number" defaultValue="180.00" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precoP45">Botijão P45</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">R$</span>
                  <Input id="precoP45" type="number" defaultValue="380.00" />
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="taxaEntrega">Taxa de Entrega</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">R$</span>
                  <Input id="taxaEntrega" type="number" defaultValue="5.00" />
                </div>
              </div>
              <Button>Atualizar Preços</Button>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Configure alertas e notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alerta de Estoque Baixo</p>
                  <p className="text-sm text-muted-foreground">
                    Receber notificação quando estoque estiver baixo
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novos Pedidos</p>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando um novo pedido for realizado
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Entregas Atrasadas</p>
                  <p className="text-sm text-muted-foreground">
                    Alertar sobre entregas com atraso
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Impressão */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                <CardTitle>Impressão</CardTitle>
              </div>
              <CardDescription>
                Configurações de impressão de cupons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Imprimir Cupom Automaticamente</p>
                  <p className="text-sm text-muted-foreground">
                    Imprimir ao finalizar venda
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Incluir Logo no Cupom</p>
                  <p className="text-sm text-muted-foreground">
                    Adicionar logotipo da empresa
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="mensagemCupom">Mensagem do Cupom</Label>
                <Input
                  id="mensagemCupom"
                  defaultValue="Obrigado pela preferência!"
                />
              </div>
            </CardContent>
          </Card>

          {/* Usuários */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Usuários</CardTitle>
              </div>
              <CardDescription>
                Gerencie os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Administrador</p>
                    <p className="text-sm text-muted-foreground">admin@gaspro.com</p>
                  </div>
                  <Badge variant="default">Admin</Badge>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Operador 1</p>
                    <p className="text-sm text-muted-foreground">operador@gaspro.com</p>
                  </div>
                  <Badge variant="secondary">Operador</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Segurança</CardTitle>
              </div>
              <CardDescription>
                Configurações de segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <Input id="senhaAtual" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input id="novaSenha" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <Input id="confirmarSenha" type="password" />
              </div>
              <Button>Alterar Senha</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

function Badge({ variant, children }: { variant: "default" | "secondary"; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {children}
    </span>
  );
}
