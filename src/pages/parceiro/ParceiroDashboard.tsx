import { ParceiroLayout } from "@/components/parceiro/ParceiroLayout";
import { useParceiroDados } from "@/hooks/useParceiroDados";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, ShoppingCart, CheckCircle, Loader2, TrendingUp, DollarSign, Zap, QrCode, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

export default function ParceiroDashboard() {
  const { parceiro, vales, disponiveis, vendidos, utilizados, isLoading } = useParceiroDados();
  const navigate = useNavigate();

  const financeiro = useMemo(() => {
    const valorTotalVales = vales.reduce((acc, v) => acc + Number(v.valor), 0);
    const valorVendido = vendidos.reduce((acc, v) => acc + Number(v.valor), 0);
    const valorUtilizado = utilizados.reduce((acc, v) => acc + Number(v.valor), 0);
    const valorDisponivel = disponiveis.reduce((acc, v) => acc + Number(v.valor), 0);
    return { valorTotalVales, valorVendido, valorUtilizado, valorDisponivel };
  }, [vales, vendidos, utilizados, disponiveis]);

  const ultimasVendas = useMemo(() => {
    return [...vendidos, ...utilizados]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [vendidos, utilizados]);

  if (isLoading) {
    return (
      <ParceiroLayout title="Início">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ParceiroLayout>
    );
  }

  if (!parceiro) {
    return (
      <ParceiroLayout title="Início">
        <div className="p-6 text-center text-muted-foreground">
          <p>Sua conta não está vinculada a nenhum parceiro.</p>
          <p className="text-sm mt-2">Solicite ao administrador que vincule seu usuário ao cadastro de parceiro.</p>
        </div>
      </ParceiroLayout>
    );
  }

  return (
    <ParceiroLayout title="Início">
      <div className="p-4 space-y-4">

        {/* Partner info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">{parceiro.nome}</h2>
                {parceiro.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {parceiro.cnpj}</p>}
              </div>
              <Badge variant={parceiro.tipo === "prepago" ? "default" : "secondary"} className="text-sm px-3 py-1">
                {parceiro.tipo === "prepago" ? "Pré-pago" : "Consignado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financeiro summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Ticket className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Disponível</span>
              </div>
              <p className="text-xl font-bold text-foreground">{disponiveis.length} vales</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$ {financeiro.valorDisponivel.toFixed(2)} em estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-accent/30">
                  <ShoppingCart className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Vendidos</span>
              </div>
              <p className="text-xl font-bold text-foreground">{vendidos.length} vales</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$ {financeiro.valorVendido.toFixed(2)} pendente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Utilizados</span>
              </div>
              <p className="text-xl font-bold text-foreground">{utilizados.length} vales</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$ {financeiro.valorUtilizado.toFixed(2)} concluído
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-secondary/50">
                  <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Total Geral</span>
              </div>
              <p className="text-xl font-bold text-foreground">{vales.length} vales</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$ {financeiro.valorTotalVales.toFixed(2)} em carteira
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-3"
                onClick={() => navigate("/parceiro/vender")}
              >
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="text-xs">Vender Vale</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-3"
                onClick={() => navigate("/parceiro/vales")}
              >
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-xs">Utilizar Vale</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-3"
                onClick={() => navigate("/parceiro/qrcode")}
              >
                <QrCode className="h-5 w-5 text-accent-foreground" />
                <span className="text-xs">Meu QR Code</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent sales */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Últimas Vendas</CardTitle>
              {ultimasVendas.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/parceiro/vales")}>
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {ultimasVendas.length === 0 ? (
              <div className="text-center py-6">
                <DollarSign className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
                <Button size="sm" className="mt-3" onClick={() => navigate("/parceiro/vender")}>
                  Fazer primeira venda
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {ultimasVendas.map((vale) => (
                  <div key={vale.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium">Vale #{vale.numero}</p>
                        <Badge
                          variant={vale.status === "vendido" ? "outline" : "secondary"}
                          className="text-xs h-4"
                        >
                          {vale.status === "vendido" ? "Vendido" : "Utilizado"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{vale.consumidor_nome || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">R$ {Number(vale.valor).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(vale.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </ParceiroLayout>
  );
}
