import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Flame, Loader2, ArrowRight, ArrowLeft, Check, Package, Landmark,
  Truck, CreditCard, Plus, Trash2, SkipForward,
} from "lucide-react";
import { toast } from "sonner";

interface ProdutoSugestao {
  nome: string;
  categoria: string;
  tipo_botijao: string;
  preco: number;
  preco_custo: number;
  selected: boolean;
}

interface EntregadorForm {
  nome: string;
  telefone: string;
  cpf: string;
}

const PRODUTOS_SUGERIDOS: ProdutoSugestao[] = [
  { nome: "Gás P13 (Cheio)", categoria: "gas", tipo_botijao: "cheio", preco: 110, preco_custo: 85, selected: true },
  { nome: "Gás P13 (Vazio)", categoria: "gas", tipo_botijao: "vazio", preco: 0, preco_custo: 0, selected: true },
  { nome: "Gás P20 (Cheio)", categoria: "gas", tipo_botijao: "cheio", preco: 180, preco_custo: 140, selected: false },
  { nome: "Gás P20 (Vazio)", categoria: "gas", tipo_botijao: "vazio", preco: 0, preco_custo: 0, selected: false },
  { nome: "Gás P45 (Cheio)", categoria: "gas", tipo_botijao: "cheio", preco: 380, preco_custo: 310, selected: false },
  { nome: "Gás P45 (Vazio)", categoria: "gas", tipo_botijao: "vazio", preco: 0, preco_custo: 0, selected: false },
  { nome: "Água Mineral 20L", categoria: "agua", tipo_botijao: "cheio", preco: 14, preco_custo: 8, selected: true },
];

const FORMAS_PAGAMENTO = [
  { key: "dinheiro", label: "Dinheiro", default: true },
  { key: "pix", label: "PIX", default: true },
  { key: "cartao_debito", label: "Cartão Débito", default: true },
  { key: "cartao_credito", label: "Cartão Crédito", default: true },
  { key: "fiado", label: "Fiado / A Prazer", default: false },
];

const STEPS = [
  { icon: Package, title: "Produtos", desc: "Cadastre seus produtos padrão" },
  { icon: Landmark, title: "Conta Bancária", desc: "Configure a conta da unidade" },
  { icon: Truck, title: "Entregador", desc: "Cadastre seu primeiro entregador" },
  { icon: CreditCard, title: "Pagamentos", desc: "Configure formas de pagamento" },
];

export default function OnboardingSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { empresa } = useEmpresa();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [unidadeId, setUnidadeId] = useState<string | null>(null);

  // Step 1 - Produtos
  const [produtos, setProdutos] = useState<ProdutoSugestao[]>(PRODUTOS_SUGERIDOS);

  // Step 2 - Conta Bancária
  const [banco, setBanco] = useState("Nubank");
  const [nomeConta, setNomeConta] = useState("Conta Principal");
  const [chavePix, setChavePix] = useState("");

  // Step 3 - Entregador
  const [entregadores, setEntregadores] = useState<EntregadorForm[]>([
    { nome: "", telefone: "", cpf: "" },
  ]);

  // Step 4 - Formas de pagamento
  const [formas, setFormas] = useState(
    FORMAS_PAGAMENTO.map((f) => ({ ...f, enabled: f.default }))
  );
  const [operadoraNome, setOperadoraNome] = useState("PagBank");
  const [taxaDebito, setTaxaDebito] = useState(1.99);
  const [taxaCreditoVista, setTaxaCreditoVista] = useState(3.19);
  const [taxaCreditoParcelado, setTaxaCreditoParcelado] = useState(4.59);

  useEffect(() => {
    if (empresa?.id) {
      supabase
        .from("unidades")
        .select("id")
        .eq("empresa_id", empresa.id)
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) setUnidadeId(data.id);
        });
    }
  }, [empresa?.id]);

  const toggleProduto = (idx: number) => {
    setProdutos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p))
    );
  };

  const updateProdutoPreco = (idx: number, field: "preco" | "preco_custo", value: number) => {
    setProdutos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const addEntregador = () => {
    setEntregadores((prev) => [...prev, { nome: "", telefone: "", cpf: "" }]);
  };

  const removeEntregador = (idx: number) => {
    setEntregadores((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateEntregador = (idx: number, field: keyof EntregadorForm, value: string) => {
    setEntregadores((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  };

  const handleSaveStep = async () => {
    if (!empresa?.id) return;
    setSaving(true);

    try {
      if (step === 0) {
        // Save produtos
        const selected = produtos.filter((p) => p.selected);
        if (selected.length === 0) {
          toast.warning("Selecione ao menos um produto");
          setSaving(false);
          return;
        }
        const rows = selected.map((p) => ({
          nome: p.nome,
          categoria: p.categoria,
          tipo_botijao: p.tipo_botijao,
          preco: p.preco,
          preco_custo: p.preco_custo,
          unidade_id: unidadeId,
          ativo: true,
          estoque: 0,
        }));
        const { error } = await supabase.from("produtos").insert(rows);
        if (error) throw error;

        // Link cheio/vazio pairs
        const { data: inserted } = await supabase
          .from("produtos")
          .select("id, nome, tipo_botijao")
          .eq("unidade_id", unidadeId);
        if (inserted) {
          for (const cheio of inserted.filter((p) => p.tipo_botijao === "cheio")) {
            const baseName = cheio.nome.replace(" (Cheio)", "");
            const vazio = inserted.find(
              (p) => p.tipo_botijao === "vazio" && p.nome.startsWith(baseName)
            );
            if (vazio) {
              await supabase.from("produtos").update({ botijao_par_id: vazio.id }).eq("id", cheio.id);
              await supabase.from("produtos").update({ botijao_par_id: cheio.id }).eq("id", vazio.id);
            }
          }
        }
        toast.success(`${selected.length} produtos cadastrados!`);
      } else if (step === 1) {
        // Save conta bancária
        if (!nomeConta.trim() || !banco.trim()) {
          toast.warning("Preencha o nome e banco da conta");
          setSaving(false);
          return;
        }
        const { error } = await supabase.from("contas_bancarias").insert({
          nome: nomeConta,
          banco,
          chave_pix: chavePix || null,
          tipo: "corrente",
          unidade_id: unidadeId,
          ativo: true,
          saldo_inicial: 0,
          saldo_atual: 0,
        });
        if (error) throw error;
        toast.success("Conta bancária cadastrada!");
      } else if (step === 2) {
        // Save entregadores
        const valid = entregadores.filter((e) => e.nome.trim());
        if (valid.length === 0) {
          toast.warning("Cadastre ao menos um entregador");
          setSaving(false);
          return;
        }
        const rows = valid.map((e) => ({
          nome: e.nome,
          telefone: e.telefone || null,
          cpf: e.cpf || null,
          unidade_id: unidadeId,
          ativo: true,
          status: "disponivel",
        }));
        const { error } = await supabase.from("entregadores").insert(rows);
        if (error) throw error;
        toast.success(`${valid.length} entregador(es) cadastrado(s)!`);
      } else if (step === 3) {
        // Save operadora de cartão
        const hasCartao = formas.some(
          (f) => (f.key === "cartao_debito" || f.key === "cartao_credito") && f.enabled
        );
        if (hasCartao && operadoraNome.trim()) {
          const { error } = await supabase.from("operadoras_cartao").insert({
            nome: operadoraNome,
            taxa_debito: taxaDebito,
            taxa_credito_vista: taxaCreditoVista,
            taxa_credito_parcelado: taxaCreditoParcelado,
            prazo_debito: 1,
            prazo_credito: 30,
            unidade_id: unidadeId,
            ativo: true,
          });
          if (error) throw error;
        }
        toast.success("Configuração de pagamentos salva!");
        navigate("/dashboard");
        return;
      }

      setStep((s) => s + 1);
    } catch (err: any) {
      console.error("Setup error:", err);
      toast.error("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (step >= 3) {
      navigate("/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Configuração Inicial</CardTitle>
          <CardDescription>
            Configure o básico para começar a usar o sistema
          </CardDescription>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      i === step
                        ? "bg-primary text-primary-foreground"
                        : i < step
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* STEP 0: Produtos */}
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecione os produtos que sua distribuidora vende e ajuste os preços:
              </p>
              {produtos.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    p.selected ? "border-primary/30 bg-primary/5" : "border-border/50 opacity-60"
                  }`}
                >
                  <Switch
                    checked={p.selected}
                    onCheckedChange={() => toggleProduto(idx)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.nome}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {p.categoria}
                      </Badge>
                    </div>
                  </div>
                  {p.selected && p.tipo_botijao === "cheio" && (
                    <div className="flex items-center gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Custo</Label>
                        <Input
                          type="number"
                          className="w-20 h-8 text-xs"
                          value={p.preco_custo}
                          onChange={(e) =>
                            updateProdutoPreco(idx, "preco_custo", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Venda</Label>
                        <Input
                          type="number"
                          className="w-20 h-8 text-xs"
                          value={p.preco}
                          onChange={(e) =>
                            updateProdutoPreco(idx, "preco", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 1: Conta Bancária */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure a conta bancária principal para receber pagamentos:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Conta *</Label>
                  <Input
                    value={nomeConta}
                    onChange={(e) => setNomeConta(e.target.value)}
                    placeholder="Ex: Conta Principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banco *</Label>
                  <Input
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    placeholder="Ex: Nubank, Itaú..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Chave PIX (para recebimentos)</Label>
                <Input
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="CPF, CNPJ, email ou telefone"
                />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                💡 Você poderá adicionar mais contas depois em <strong>Financeiro → Contas Bancárias</strong>.
              </div>
            </div>
          )}

          {/* STEP 2: Entregadores */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cadastre seus entregadores para poder registrar entregas:
              </p>
              {entregadores.map((e, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Nome *</Label>
                    <Input
                      value={e.nome}
                      onChange={(ev) => updateEntregador(idx, "nome", ev.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="w-36 space-y-1">
                    <Label className="text-xs">Telefone</Label>
                    <Input
                      value={e.telefone}
                      onChange={(ev) => updateEntregador(idx, "telefone", ev.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  {entregadores.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      onClick={() => removeEntregador(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addEntregador}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar outro
              </Button>
            </div>
          )}

          {/* STEP 3: Formas de pagamento */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Habilite as formas de pagamento que sua distribuidora aceita:
              </p>
              <div className="space-y-2">
                {formas.map((f, idx) => (
                  <div
                    key={f.key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      f.enabled ? "border-primary/30 bg-primary/5" : "border-border/50"
                    }`}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <Switch
                      checked={f.enabled}
                      onCheckedChange={(checked) =>
                        setFormas((prev) =>
                          prev.map((ff, i) => (i === idx ? { ...ff, enabled: checked } : ff))
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              {formas.some(
                (f) =>
                  (f.key === "cartao_debito" || f.key === "cartao_credito") && f.enabled
              ) && (
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-sm font-semibold">Operadora de Cartão</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome da Operadora</Label>
                      <Input
                        value={operadoraNome}
                        onChange={(e) => setOperadoraNome(e.target.value)}
                        placeholder="PagBank, Stone..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Taxa Débito (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaDebito}
                        onChange={(e) => setTaxaDebito(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Taxa Crédito à Vista (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaCreditoVista}
                        onChange={(e) => setTaxaCreditoVista(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Taxa Crédito Parcelado (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxaCreditoParcelado}
                        onChange={(e) => setTaxaCreditoParcelado(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                <SkipForward className="h-3.5 w-3.5 mr-1" />
                Pular
              </Button>
              <Button onClick={handleSaveStep} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : step === 3 ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-1" />
                )}
                {step === 3 ? "Concluir" : "Salvar e Avançar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
