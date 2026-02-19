import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Image, Sun, Moon, Printer, Upload, Type } from "lucide-react";

export default function PersonalizacaoVisual() {
  const [darkMode, setDarkMode] = useState(false);
  const [comprovante, setComprovante] = useState({
    mostrarLogo: true,
    mostrarEndereco: true,
    mostrarTelefone: true,
    rodape: "Obrigado pela preferência! ♻️ Recicle seu botijão.",
  });

  return (
    <MainLayout>
      <Header title="Personalização Visual" subtitle="Customize a identidade visual do sistema" />
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Logo e Marca */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                <CardTitle>Logo e Marca</CardTitle>
              </div>
              <CardDescription>
                Logotipo exibido no sistema, comprovantes e app do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Arraste sua logo aqui</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG ou SVG • Máx. 2MB</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Escolher Arquivo
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Nome exibido no sistema</Label>
                <Input placeholder="Gás Fácil" defaultValue="Gás Fácil" />
              </div>
            </CardContent>
          </Card>

          {/* Tema */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Tema e Cores</CardTitle>
              </div>
              <CardDescription>
                Escolha o tema e personalize as cores do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium">Modo Escuro</p>
                    <p className="text-sm text-muted-foreground">
                      {darkMode ? "Tema escuro ativado" : "Tema claro ativado"}
                    </p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Cor Primária</Label>
                <div className="flex gap-3">
                  {[
                    { color: "hsl(160, 60%, 40%)", label: "Verde" },
                    { color: "hsl(210, 80%, 50%)", label: "Azul" },
                    { color: "hsl(260, 60%, 50%)", label: "Roxo" },
                    { color: "hsl(350, 70%, 50%)", label: "Vermelho" },
                    { color: "hsl(30, 80%, 50%)", label: "Laranja" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className="flex flex-col items-center gap-1 group"
                      title={opt.label}
                    >
                      <div
                        className={`h-10 w-10 rounded-full border-2 border-transparent group-hover:border-foreground/20 transition-colors ${opt.label === "Verde" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="text-[10px] text-muted-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprovante / Cupom */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                <CardTitle>Comprovante / Cupom</CardTitle>
              </div>
              <CardDescription>
                Personalize o layout do comprovante impresso e digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Exibir logo no comprovante</p>
                      <p className="text-sm text-muted-foreground">Mostra o logotipo no topo</p>
                    </div>
                    <Switch
                      checked={comprovante.mostrarLogo}
                      onCheckedChange={(v) => setComprovante((p) => ({ ...p, mostrarLogo: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Exibir endereço</p>
                      <p className="text-sm text-muted-foreground">Endereço da revenda no cabeçalho</p>
                    </div>
                    <Switch
                      checked={comprovante.mostrarEndereco}
                      onCheckedChange={(v) => setComprovante((p) => ({ ...p, mostrarEndereco: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Exibir telefone</p>
                      <p className="text-sm text-muted-foreground">Telefone de contato no cabeçalho</p>
                    </div>
                    <Switch
                      checked={comprovante.mostrarTelefone}
                      onCheckedChange={(v) => setComprovante((p) => ({ ...p, mostrarTelefone: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="grid gap-2">
                    <Label>Mensagem do rodapé</Label>
                    <Textarea
                      value={comprovante.rodape}
                      onChange={(e) => setComprovante((p) => ({ ...p, rodape: e.target.value }))}
                      placeholder="Obrigado pela preferência!"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Preview do comprovante */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="text-center space-y-1 text-xs font-mono">
                    {comprovante.mostrarLogo && (
                      <div className="flex justify-center mb-2">
                        <Type className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <p className="font-bold text-sm">GÁS FÁCIL</p>
                    {comprovante.mostrarEndereco && (
                      <p className="text-muted-foreground">Rua Exemplo, 123 - Centro</p>
                    )}
                    {comprovante.mostrarTelefone && (
                      <p className="text-muted-foreground">(11) 99999-9999</p>
                    )}
                    <Separator className="my-2" />
                    <div className="text-left space-y-1">
                      <p>1x P13 Cheio ............. R$ 120,00</p>
                      <p>1x P45 Cheio ............. R$ 380,00</p>
                    </div>
                    <Separator className="my-2" />
                    <p className="font-bold">TOTAL: R$ 500,00</p>
                    <p>Pagamento: Dinheiro</p>
                    <Separator className="my-2" />
                    <p className="text-muted-foreground italic">{comprovante.rodape}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
