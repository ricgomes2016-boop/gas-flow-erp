import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plug, MessageSquare, CreditCard, FileText, Truck, Globe, Webhook, ArrowUpRight } from "lucide-react";

interface Integracao {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ElementType;
  status: "conectado" | "disponivel" | "em_breve";
  categoria: "pagamento" | "comunicacao" | "fiscal" | "logistica";
}

const integracoes: Integracao[] = [
  {
    id: "whatsapp",
    nome: "WhatsApp Business",
    descricao: "Envio automático de comprovantes, status de entrega e atendimento ao cliente",
    icon: MessageSquare,
    status: "disponivel",
    categoria: "comunicacao",
  },
  {
    id: "pix",
    nome: "PIX Automático",
    descricao: "Geração de QR Code PIX para pagamentos instantâneos com conciliação automática",
    icon: CreditCard,
    status: "disponivel",
    categoria: "pagamento",
  },
  {
    id: "nfe",
    nome: "Emissão de NF-e / NFC-e",
    descricao: "Emissão automática de notas fiscais integrada ao módulo fiscal",
    icon: FileText,
    status: "disponivel",
    categoria: "fiscal",
  },
  {
    id: "google_maps",
    nome: "Google Maps",
    descricao: "Geocodificação de endereços e otimização de rotas de entrega",
    icon: Globe,
    status: "conectado",
    categoria: "logistica",
  },
  {
    id: "ifood",
    nome: "iFood / Rappi",
    descricao: "Recebimento automático de pedidos de marketplaces de delivery",
    icon: Truck,
    status: "em_breve",
    categoria: "logistica",
  },
  {
    id: "webhook",
    nome: "Webhooks Customizados",
    descricao: "Envie eventos do sistema para qualquer endpoint externo via HTTP",
    icon: Webhook,
    status: "disponivel",
    categoria: "comunicacao",
  },
];

const statusConfig = {
  conectado: { label: "Conectado", variant: "default" as const, color: "text-green-600" },
  disponivel: { label: "Disponível", variant: "secondary" as const, color: "text-muted-foreground" },
  em_breve: { label: "Em breve", variant: "outline" as const, color: "text-muted-foreground" },
};

const categoriasLabel: Record<string, string> = {
  pagamento: "💳 Pagamento",
  comunicacao: "💬 Comunicação",
  fiscal: "📄 Fiscal",
  logistica: "🚚 Logística",
};

export default function Integracoes() {
  const conectadas = integracoes.filter((i) => i.status === "conectado").length;
  const disponiveis = integracoes.filter((i) => i.status === "disponivel").length;

  const categorias = [...new Set(integracoes.map((i) => i.categoria))];

  return (
    <MainLayout>
      <Header title="Integrações" subtitle="Conecte serviços externos ao seu sistema" />
      <div className="p-6 space-y-6">
        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Plug className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{conectadas}</p>
                  <p className="text-sm text-muted-foreground">Conectadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disponiveis}</p>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Plug className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{integracoes.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Por categoria */}
        {categorias.map((cat) => {
          const items = integracoes.filter((i) => i.categoria === cat);
          return (
            <Card key={cat}>
              <CardHeader>
                <CardTitle className="text-base">{categoriasLabel[cat]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {items.map((integracao, idx) => {
                  const Icon = integracao.icon;
                  const status = statusConfig[integracao.status];
                  return (
                    <div key={integracao.id}>
                      {idx > 0 && <Separator className="my-4" />}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2.5 rounded-lg bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{integracao.nome}</p>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {integracao.descricao}
                            </p>
                          </div>
                        </div>
                        <div className="pl-11 sm:pl-0">
                          {integracao.status === "conectado" ? (
                            <div className="flex items-center gap-3">
                              <Switch checked />
                              <Button variant="ghost" size="sm" className="gap-1">
                                Configurar <ArrowUpRight className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : integracao.status === "disponivel" ? (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Plug className="h-3.5 w-3.5" />
                              Conectar
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Em breve
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
}
