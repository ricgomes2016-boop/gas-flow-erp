import { ParceiroLayout } from "@/components/parceiro/ParceiroLayout";
import { useParceiroDados } from "@/hooks/useParceiroDados";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, ShoppingCart, CheckCircle, Loader2 } from "lucide-react";

export default function ParceiroDashboard() {
  const { parceiro, vales, disponiveis, vendidos, utilizados, isLoading } = useParceiroDados();

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
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">{parceiro.nome}</h2>
                {parceiro.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {parceiro.cnpj}</p>}
              </div>
              <Badge variant={parceiro.tipo === "prepago" ? "default" : "secondary"}>
                {parceiro.tipo === "prepago" ? "Pré-pago" : "Consignado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <Ticket className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{disponiveis.length}</p>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto text-accent-foreground mb-1" />
              <p className="text-2xl font-bold text-foreground">{vendidos.length}</p>
              <p className="text-xs text-muted-foreground">Vendidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{utilizados.length}</p>
              <p className="text-xs text-muted-foreground">Utilizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent sales */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Últimas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {vendidos.length === 0 && utilizados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {[...vendidos, ...utilizados]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((vale) => (
                    <div key={vale.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Vale #{vale.numero}</p>
                        <p className="text-xs text-muted-foreground">{vale.consumidor_nome || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">R$ {Number(vale.valor).toFixed(2)}</p>
                        <Badge variant={vale.status === "vendido" ? "outline" : "secondary"} className="text-xs">
                          {vale.status === "vendido" ? "Vendido" : "Utilizado"}
                        </Badge>
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
