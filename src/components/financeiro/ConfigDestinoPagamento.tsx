import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Settings2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { toast } from "sonner";

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  saldo_atual: number;
  unidade_id: string | null;
}

interface Props {
  contas: ContaBancaria[];
}

const FORMAS_PAGAMENTO = [
  { value: "dinheiro", label: "💵 Dinheiro", desc: "Entra no Caixa da Loja. Depósito bancário é manual." },
  { value: "pix", label: "📱 PIX", desc: "Entrada DIRETA na conta bancária (não passa pelo caixa)" },
  { value: "cartao_debito", label: "💳 Cartão Débito", desc: "Contas a Receber (D+1). Entra no banco quando liquidado." },
  { value: "cartao_credito", label: "💳 Cartão Crédito", desc: "Contas a Receber (D+30). Entra no banco quando liquidado." },
  { value: "cheque", label: "📝 Cheque", desc: "Entra no caixa + tabela cheques. Banco quando depositado." },
  { value: "vale_gas", label: "🔥 Vale Gás", desc: "Entra no Caixa da Loja (depende da forma de pagamento)" },
  { value: "fiado", label: "📋 Fiado", desc: "Vai para Contas a Receber (sem caixa nem banco)" },
  { value: "boleto", label: "📄 Boleto", desc: "Vai para Contas a Receber. Banco quando baixado." },
];

export default function ConfigDestinoPagamento({ contas }: Props) {
  const { unidadeAtual } = useUnidade();
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: existingConfigs = [], isLoading } = useQuery({
    queryKey: ["config-destino-pagamento", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("config_destino_pagamento")
        .select("*")
        .eq("ativo", true);

      if (unidadeAtual?.id) {
        query = query.eq("unidade_id", unidadeAtual.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Sync existing configs to state
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const cfg of existingConfigs) {
      map[(cfg as any).forma_pagamento] = (cfg as any).conta_bancaria_id;
    }
    setConfigs(map);
  }, [existingConfigs]);

  const salvarConfigs = async () => {
    setSaving(true);
    try {
      // Upsert each config
      for (const forma of FORMAS_PAGAMENTO) {
        const contaId = configs[forma.value];
        if (!contaId || contaId === "nenhuma") {
          // Delete if exists
          await supabase
            .from("config_destino_pagamento")
            .delete()
            .eq("forma_pagamento", forma.value)
            .eq("unidade_id", unidadeAtual?.id || "");
          continue;
        }

        const existing = existingConfigs.find(
          (c: any) => c.forma_pagamento === forma.value
        );

        if (existing) {
          await supabase
            .from("config_destino_pagamento")
            .update({ conta_bancaria_id: contaId })
            .eq("id", (existing as any).id);
        } else {
          await supabase.from("config_destino_pagamento").insert({
            unidade_id: unidadeAtual?.id || null,
            forma_pagamento: forma.value,
            conta_bancaria_id: contaId,
          });
        }
      }

      toast.success("Configurações de destino salvas!");
      queryClient.invalidateQueries({ queryKey: ["config-destino-pagamento"] });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const configuredCount = Object.values(configs).filter(v => v && v !== "nenhuma").length;
  const applicableForms = FORMAS_PAGAMENTO.filter(f => !["fiado", "boleto"].includes(f.value));

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Como funciona o roteamento automático
          </CardTitle>
          <CardDescription className="text-sm">
            Quando uma venda é finalizada, o sistema automaticamente cria a movimentação financeira 
            na conta bancária configurada abaixo. Formas como <strong>Fiado</strong> e <strong>Boleto</strong> vão 
            direto para Contas a Receber, sem movimentação bancária.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            {configuredCount === applicableForms.length ? (
              <Badge className="bg-primary gap-1"><CheckCircle2 className="h-3 w-3" />Totalmente configurado</Badge>
            ) : configuredCount > 0 ? (
              <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />{configuredCount}/{applicableForms.length} configurados</Badge>
            ) : (
              <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Nenhum destino configurado</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              Formas sem conta configurada criarão apenas movimentação de caixa (sem extrato bancário).
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-6 text-muted-foreground">Carregando...</p>
          ) : contas.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              Cadastre pelo menos uma conta bancária antes de configurar os destinos.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Destino (Conta Bancária)</TableHead>
                    <TableHead className="hidden sm:table-cell">Comportamento</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FORMAS_PAGAMENTO.map(forma => {
                    const isNoBankRouting = ["fiado", "boleto"].includes(forma.value);
                    return (
                      <TableRow key={forma.value}>
                        <TableCell className="font-medium">{forma.label}</TableCell>
                        <TableCell>
                          {isNoBankRouting ? (
                            <span className="text-xs text-muted-foreground italic">Contas a Receber (automático)</span>
                          ) : (
                            <Select
                              value={configs[forma.value] || "nenhuma"}
                              onValueChange={v => setConfigs({ ...configs, [forma.value]: v })}
                            >
                              <SelectTrigger className="max-w-[280px]">
                                <SelectValue placeholder="Selecione a conta" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nenhuma">— Nenhuma (só caixa) —</SelectItem>
                                {contas.map(c => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.nome} ({c.banco})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {forma.desc}
                        </TableCell>
                        <TableCell>
                          {isNoBankRouting ? (
                            <Badge variant="outline" className="text-[10px]">Auto</Badge>
                          ) : configs[forma.value] && configs[forma.value] !== "nenhuma" ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-4">
                <Button onClick={salvarConfigs} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
