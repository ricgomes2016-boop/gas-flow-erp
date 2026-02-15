import { useState } from "react";
import { ParceiroLayout } from "@/components/parceiro/ParceiroLayout";
import { useParceiroDados, ValeGasParceiro } from "@/hooks/useParceiroDados";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Printer } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  disponivel: { label: "Disponível", variant: "default" },
  vendido: { label: "Vendido", variant: "outline" },
  utilizado: { label: "Utilizado", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

function ValeCard({ vale }: { vale: ValeGasParceiro }) {
  const cfg = statusConfig[vale.status] || { label: vale.status, variant: "outline" as const };

  const imprimirVale = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Vale Gás #${vale.numero}</title>
      <style>
        body { font-family: monospace; width: 280px; margin: 0 auto; padding: 10px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .bold { font-weight: bold; }
        .small { font-size: 11px; }
      </style></head><body>
      <div class="center bold">VALE GÁS #${vale.numero}</div>
      <div>Código: ${vale.codigo}</div>
      <div class="bold">Valor: R$ ${Number(vale.valor).toFixed(2)}</div>
      ${vale.produto_nome ? `<div>Produto: ${vale.produto_nome}</div>` : ""}
      <div class="line"></div>
      ${vale.consumidor_nome ? `<div class="bold">Consumidor:</div><div>${vale.consumidor_nome}</div>` : ""}
      ${vale.consumidor_cpf ? `<div>CPF: ${vale.consumidor_cpf}</div>` : ""}
      <div class="line"></div>
      <div class="center small">Status: ${cfg.label}</div>
      <div class="center small">${new Date(vale.created_at).toLocaleDateString("pt-BR")}</div>
      <script>window.print(); window.close();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">#{vale.numero}</span>
          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{vale.codigo}</p>
        {vale.consumidor_nome && (
          <p className="text-xs text-muted-foreground mt-1">{vale.consumidor_nome} {vale.consumidor_cpf ? `• ${vale.consumidor_cpf}` : ""}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold whitespace-nowrap">R$ {Number(vale.valor).toFixed(2)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={imprimirVale}>
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ParceiroVales() {
  const { vales, disponiveis, vendidos, utilizados, isLoading } = useParceiroDados();
  const [busca, setBusca] = useState("");

  const filtrar = (lista: ValeGasParceiro[]) => {
    if (!busca.trim()) return lista;
    const term = busca.toLowerCase();
    return lista.filter(
      (v) =>
        v.numero.toString().includes(term) ||
        v.codigo.toLowerCase().includes(term) ||
        (v.consumidor_nome || "").toLowerCase().includes(term) ||
        (v.consumidor_cpf || "").toLowerCase().includes(term)
    );
  };

  if (isLoading) {
    return (
      <ParceiroLayout title="Meus Vales">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ParceiroLayout>
    );
  }

  return (
    <ParceiroLayout title="Meus Vales">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, código, nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="disponivel">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="disponivel">Disponíveis ({disponiveis.length})</TabsTrigger>
            <TabsTrigger value="vendido">Vendidos ({vendidos.length})</TabsTrigger>
            <TabsTrigger value="utilizado">Utilizados ({utilizados.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="disponivel" className="space-y-2 mt-3">
            {filtrar(disponiveis).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum vale disponível.</p>
            ) : (
              filtrar(disponiveis).map((v) => <ValeCard key={v.id} vale={v} />)
            )}
          </TabsContent>

          <TabsContent value="vendido" className="space-y-2 mt-3">
            {filtrar(vendidos).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum vale vendido.</p>
            ) : (
              filtrar(vendidos).map((v) => <ValeCard key={v.id} vale={v} />)
            )}
          </TabsContent>

          <TabsContent value="utilizado" className="space-y-2 mt-3">
            {filtrar(utilizados).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum vale utilizado.</p>
            ) : (
              filtrar(utilizados).map((v) => <ValeCard key={v.id} vale={v} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ParceiroLayout>
  );
}
