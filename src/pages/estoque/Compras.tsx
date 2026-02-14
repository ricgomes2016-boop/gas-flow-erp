import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Package, DollarSign, Truck, FileText, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "@/hooks/useInputMasks";

interface Compra {
  id: string;
  valor_total: number;
  valor_frete: number | null;
  status: string;
  data_prevista: string | null;
  data_compra: string | null;
  data_pagamento: string | null;
  numero_nota_fiscal: string | null;
  chave_nfe: string | null;
  observacoes: string | null;
  created_at: string;
  fornecedores: { razao_social: string } | null;
}

interface Fornecedor {
  id: string;
  razao_social: string;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

interface ItemCompra {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

export default function Compras() {
  const { unidadeAtual } = useUnidade();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fornecedor_id: "",
    numero_nota_fiscal: "",
    chave_nfe: "",
    data_compra: new Date().toISOString().split("T")[0],
    data_prevista: "",
    data_pagamento: "",
    valor_frete: "",
    observacoes: "",
  });

  const [itens, setItens] = useState<ItemCompra[]>([]);
  const [novoItem, setNovoItem] = useState({ produto_id: "", quantidade: "1", preco_unitario: "" });

  const fetchCompras = async () => {
    let query = supabase
      .from("compras")
      .select("*, fornecedores(razao_social)")
      .order("created_at", { ascending: false });

    if (unidadeAtual?.id) {
      query = query.eq("unidade_id", unidadeAtual.id);
    }

    const { data, error } = await query;
    if (error) { console.error(error); return; }
    setCompras(data || []);
    setLoading(false);
  };

  const fetchFornecedores = async () => {
    const { data } = await supabase.from("fornecedores").select("id, razao_social").eq("ativo", true).order("razao_social");
    setFornecedores(data || []);
  };

  const fetchProdutos = async () => {
    const { data } = await supabase.from("produtos").select("id, nome, preco").eq("ativo", true);
    setProdutos(data || []);
  };

  useEffect(() => {
    fetchFornecedores();
    fetchProdutos();
  }, []);

  useEffect(() => { fetchCompras(); }, [unidadeAtual?.id]);

  const subtotalItens = itens.reduce((a, i) => a + i.preco_unitario * i.quantidade, 0);
  const valorFrete = parseCurrency(form.valor_frete);
  const totalCompra = subtotalItens + valorFrete;

  const adicionarItem = () => {
    if (!novoItem.produto_id) { toast.error("Selecione um produto"); return; }
    if (!novoItem.preco_unitario) { toast.error("Informe o preço unitário"); return; }

    setItens([...itens, {
      produto_id: novoItem.produto_id,
      quantidade: parseInt(novoItem.quantidade) || 1,
      preco_unitario: parseCurrency(novoItem.preco_unitario),
    }]);
    setNovoItem({ produto_id: "", quantidade: "1", preco_unitario: "" });
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({
      fornecedor_id: "", numero_nota_fiscal: "", chave_nfe: "",
      data_compra: new Date().toISOString().split("T")[0],
      data_prevista: "", data_pagamento: "", valor_frete: "", observacoes: "",
    });
    setItens([]);
    setNovoItem({ produto_id: "", quantidade: "1", preco_unitario: "" });
  };

  const handleSave = async () => {
    if (!form.fornecedor_id) { toast.error("Selecione um fornecedor"); return; }
    if (itens.length === 0) { toast.error("Adicione pelo menos um item"); return; }

    const { data: compra, error } = await supabase.from("compras").insert({
      fornecedor_id: form.fornecedor_id,
      unidade_id: unidadeAtual?.id || null,
      valor_total: totalCompra,
      valor_frete: valorFrete || 0,
      numero_nota_fiscal: form.numero_nota_fiscal || null,
      chave_nfe: form.chave_nfe || null,
      data_compra: form.data_compra || null,
      data_prevista: form.data_prevista || null,
      data_pagamento: form.data_pagamento || null,
      observacoes: form.observacoes || null,
      status: "pendente",
    }).select("id").single();

    if (error) { toast.error("Erro: " + error.message); return; }

    if (compra) {
      const itensData = itens.map(i => ({
        compra_id: compra.id,
        produto_id: i.produto_id,
        quantidade: i.quantidade,
        preco_unitario: i.preco_unitario,
      }));
      const { error: itensError } = await supabase.from("compra_itens").insert(itensData);
      if (itensError) { toast.error("Erro nos itens: " + itensError.message); }
    }

    // Criar conta a pagar se tem data de pagamento
    if (form.data_pagamento && compra) {
      const fornecedor = fornecedores.find(f => f.id === form.fornecedor_id);
      await supabase.from("contas_pagar").insert({
        descricao: `Compra NF ${form.numero_nota_fiscal || "S/N"} - ${fornecedor?.razao_social || ""}`,
        fornecedor: fornecedor?.razao_social || "",
        valor: totalCompra,
        vencimento: form.data_pagamento,
        categoria: "compras",
        unidade_id: unidadeAtual?.id || null,
        status: "pendente",
      });
    }

    toast.success("Compra registrada!");
    setOpen(false);
    resetForm();
    fetchCompras();
  };

  const handleImportXML = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      const nfe = xml.querySelector("infNFe, NFe infNFe");
      if (!nfe) { toast.error("XML inválido ou não é uma NFe"); return; }

      // Extrair chave
      const chaveNfe = nfe.getAttribute("Id")?.replace("NFe", "") || "";

      // Extrair número da nota
      const nNF = nfe.querySelector("ide nNF")?.textContent || "";

      // Extrair data de emissão
      const dhEmi = nfe.querySelector("ide dhEmi")?.textContent || "";
      const dataCompra = dhEmi ? dhEmi.split("T")[0] : "";

      // Extrair valor total e frete
      const vNF = nfe.querySelector("total ICMSTot vNF")?.textContent || "0";
      const vFrete = nfe.querySelector("total ICMSTot vFrete")?.textContent || "0";

      // Extrair fornecedor (CNPJ)
      const cnpjEmit = nfe.querySelector("emit CNPJ")?.textContent || "";

      // Tentar encontrar fornecedor pelo CNPJ
      let fornecedorId = "";
      if (cnpjEmit) {
        const found = fornecedores.find(f => {
          // Comparar só números
          const search = cnpjEmit.replace(/\D/g, "");
          return search.length > 0 && f.razao_social?.toLowerCase().includes(search);
        });
        // Buscar por CNPJ no banco
        const { data: fornecedorData } = await supabase
          .from("fornecedores")
          .select("id")
          .eq("cnpj", cnpjEmit.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"))
          .maybeSingle();
        if (fornecedorData) fornecedorId = fornecedorData.id;
        else if (found) fornecedorId = found.id;
      }

      // Extrair itens
      const dets = nfe.querySelectorAll("det");
      const itensXml: ItemCompra[] = [];
      dets.forEach(det => {
        const xProd = det.querySelector("prod xProd")?.textContent || "";
        const qCom = parseFloat(det.querySelector("prod qCom")?.textContent || "1");
        const vUnCom = parseFloat(det.querySelector("prod vUnCom")?.textContent || "0");

        // Tentar encontrar produto pelo nome
        const produtoEncontrado = produtos.find(p =>
          p.nome.toLowerCase().includes(xProd.toLowerCase()) ||
          xProd.toLowerCase().includes(p.nome.toLowerCase())
        );

        if (produtoEncontrado) {
          itensXml.push({
            produto_id: produtoEncontrado.id,
            quantidade: Math.round(qCom),
            preco_unitario: vUnCom,
          });
        }
      });

      setForm(prev => ({
        ...prev,
        numero_nota_fiscal: nNF,
        chave_nfe: chaveNfe,
        data_compra: dataCompra || prev.data_compra,
        valor_frete: vFrete !== "0" ? formatCurrency((parseFloat(vFrete) * 100).toFixed(0)) : "",
        fornecedor_id: fornecedorId || prev.fornecedor_id,
      }));

      if (itensXml.length > 0) {
        setItens(itensXml);
        toast.success(`${itensXml.length} item(ns) importado(s) do XML`);
      } else {
        toast.info("XML importado. Nenhum produto correspondente encontrado - adicione os itens manualmente.");
      }
    } catch {
      toast.error("Erro ao processar o arquivo XML");
    }

    // Limpar input
    if (xmlInputRef.current) xmlInputRef.current.value = "";
  };

  const updateStatus = async (id: string, status: string) => {
    const updateData: Record<string, unknown> = { status };
    if (status === "recebido") {
      updateData.data_recebimento = new Date().toISOString();
    }
    const { error } = await supabase.from("compras").update(updateData).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success("Status atualizado!");
    fetchCompras();
  };

  const totalMes = compras.reduce((a, c) => a + (Number(c.valor_total) || 0), 0);
  const emTransito = compras.filter(c => c.status === "em_transito").length;
  const pendentes = compras.filter(c => c.status === "pendente").length;

  const statusLabel = (s: string) => {
    if (s === "recebido") return "Recebido";
    if (s === "em_transito") return "Em Trânsito";
    if (s === "cancelado") return "Cancelado";
    return "Pendente";
  };

  const statusVariant = (s: string) => {
    if (s === "recebido") return "default" as const;
    if (s === "em_transito") return "secondary" as const;
    if (s === "cancelado") return "destructive" as const;
    return "outline" as const;
  };

  const getProdutoNome = (id: string) => produtos.find(p => p.id === id)?.nome || "Produto";

  return (
    <MainLayout>
      <Header title="Compras" subtitle="Gestão de compras e pedidos" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compras</h1>
            <p className="text-muted-foreground">Gestão de compras e pedidos</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Compra</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra</DialogTitle>
                <DialogDescription>Preencha os dados ou importe um XML da NFe</DialogDescription>
              </DialogHeader>

              {/* Importar XML */}
              <div className="flex gap-2 pt-2">
                <input ref={xmlInputRef} type="file" accept=".xml" className="hidden" onChange={handleImportXML} />
                <Button variant="outline" className="w-full" onClick={() => xmlInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />Importar XML da NFe
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                {/* Fornecedor e NF */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fornecedor *</Label>
                    <Select value={form.fornecedor_id} onValueChange={v => setForm({ ...form, fornecedor_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {fornecedores.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.razao_social}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nº Nota Fiscal</Label>
                    <Input value={form.numero_nota_fiscal} onChange={e => setForm({ ...form, numero_nota_fiscal: e.target.value })} placeholder="000000" />
                  </div>
                </div>

                {/* Chave NFe */}
                <div>
                  <Label>Chave da NFe (44 dígitos)</Label>
                  <Input
                    value={form.chave_nfe}
                    onChange={e => setForm({ ...form, chave_nfe: e.target.value.replace(/\D/g, "").slice(0, 44) })}
                    placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                    maxLength={44}
                  />
                </div>

                {/* Datas */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Data da Compra</Label>
                    <Input type="date" value={form.data_compra} onChange={e => setForm({ ...form, data_compra: e.target.value })} />
                  </div>
                  <div>
                    <Label>Previsão Entrega</Label>
                    <Input type="date" value={form.data_prevista} onChange={e => setForm({ ...form, data_prevista: e.target.value })} />
                  </div>
                  <div>
                    <Label>Data Pagamento</Label>
                    <Input type="date" value={form.data_pagamento} onChange={e => setForm({ ...form, data_pagamento: e.target.value })} />
                  </div>
                </div>

                {/* Itens */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Itens da Compra</h3>

                  {itens.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="w-20">Qtd</TableHead>
                          <TableHead className="w-28">Preço Un.</TableHead>
                          <TableHead className="w-28 text-right">Subtotal</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itens.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm">{getProdutoNome(item.produto_id)}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>R$ {item.preco_unitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right">R$ {(item.preco_unitario * item.quantidade).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removerItem(idx)} className="text-destructive h-6 w-6 p-0">×</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  <div className="grid grid-cols-[1fr_80px_120px_auto] gap-2 items-end">
                    <div>
                      <Label className="text-xs">Produto</Label>
                      <Select value={novoItem.produto_id} onValueChange={v => {
                        const prod = produtos.find(p => p.id === v);
                        setNovoItem({ ...novoItem, produto_id: v, preco_unitario: prod ? formatCurrency((prod.preco * 100).toFixed(0)) : novoItem.preco_unitario });
                      }}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {produtos.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome} - R$ {Number(p.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Qtd</Label>
                      <Input type="number" min="1" value={novoItem.quantidade} onChange={e => setNovoItem({ ...novoItem, quantidade: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Preço Unit.</Label>
                      <Input
                        value={novoItem.preco_unitario}
                        onChange={e => setNovoItem({ ...novoItem, preco_unitario: formatCurrency(e.target.value) })}
                        placeholder="0,00"
                      />
                    </div>
                    <Button size="sm" onClick={adicionarItem} className="mb-0">+</Button>
                  </div>
                </div>

                {/* Frete e Total */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Valor Frete</Label>
                    <Input
                      value={form.valor_frete}
                      onChange={e => setForm({ ...form, valor_frete: formatCurrency(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Subtotal Itens</Label>
                    <Input disabled value={`R$ ${subtotalItens.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                  </div>
                  <div>
                    <Label className="font-bold">Total da Compra</Label>
                    <Input disabled value={`R$ ${totalCompra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} className="font-bold" />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <Label>Observações</Label>
                  <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações adicionais..." rows={2} />
                </div>

                {form.data_pagamento && (
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    ℹ️ Uma conta a pagar será criada automaticamente com vencimento em {new Date(form.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR")}.
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
                  <Button onClick={handleSave}>Registrar Compra</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><ShoppingCart className="h-6 w-6 text-primary" /></div>
                <div><p className="text-2xl font-bold">{compras.length}</p><p className="text-sm text-muted-foreground">Pedidos</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary"><Truck className="h-6 w-6 text-secondary-foreground" /></div>
                <div><p className="text-2xl font-bold">{emTransito}</p><p className="text-sm text-muted-foreground">Em Trânsito</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent"><Package className="h-6 w-6 text-accent-foreground" /></div>
                <div><p className="text-2xl font-bold">{pendentes}</p><p className="text-sm text-muted-foreground">Pendentes</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div>
                <div><p className="text-2xl font-bold">R$ {(totalMes / 1000).toFixed(1)}k</p><p className="text-sm text-muted-foreground">Total</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Pedidos de Compra</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-muted-foreground">Carregando...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NF</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">
                        {c.numero_nota_fiscal ? (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            {c.numero_nota_fiscal}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="font-medium">{c.fornecedores?.razao_social || "-"}</TableCell>
                      <TableCell>{c.data_compra ? new Date(c.data_compra + "T12:00:00").toLocaleDateString("pt-BR") : new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>R$ {Number(c.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{Number(c.valor_frete) > 0 ? `R$ ${Number(c.valor_frete).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}</TableCell>
                      <TableCell><Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {c.status === "pendente" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "em_transito")}>Enviar</Button>
                          )}
                          {c.status === "em_transito" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "recebido")}>Receber</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {compras.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma compra registrada</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
