import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Search, Plus, AlertCircle, CheckCircle2, Clock, MoreHorizontal, Pencil, Trash2, DollarSign, Download, Camera, Loader2, Layers, ChevronRight, Building2, Filter, X, Mic, MicOff, AudioLines, FileText, Eye, Copy, FileUp, CalendarRange } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParcelamentoDialog } from "@/components/financeiro/ParcelamentoDialog";
import { CompromissosFuturos } from "@/components/financeiro/CompromissosFuturos";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUnidade } from "@/contexts/UnidadeContext";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  categoria: string | null;
  observacoes: string | null;
  created_at: string;
  boleto_url: string | null;
  boleto_codigo_barras: string | null;
  boleto_linha_digitavel: string | null;
}

interface CategoriaDesp {
  id: string;
  nome: string;
  grupo: string;
  ativo: boolean;
}

const FORMAS_PAGAMENTO = ["Boleto", "PIX", "Transferência", "Dinheiro", "Cartão", "Cheque"];
const CATEGORIAS_FALLBACK = ["Fornecedores", "Frota", "Infraestrutura", "Utilidades", "RH", "Compras", "Outros"];

export default function ContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagarDialogOpen, setPagarDialogOpen] = useState(false);
  const [pagarConta, setPagarConta] = useState<ContaPagar | null>(null);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroFornecedor, setFiltroFornecedor] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [agrupar, setAgrupar] = useState(false);
  const [resumoOpen, setResumoOpen] = useState(false);
  const { unidadeAtual } = useUnidade();

  // Categories from database
  const [categoriasDB, setCategoriasDB] = useState<CategoriaDesp[]>([]);
  const categoriasNomes = categoriasDB.length > 0 ? categoriasDB.filter(c => c.ativo).map(c => c.nome) : CATEGORIAS_FALLBACK;

  // Boleto states
  const [boletoDialogOpen, setBoletoDialogOpen] = useState(false);
  const [boletoProcessing, setBoletoProcessing] = useState(false);
  const [boletoPreview, setBoletoPreview] = useState<string | null>(null);
  const [boletoData, setBoletoData] = useState<any>(null);
  const [boletoFile, setBoletoFile] = useState<File | null>(null);
  const boletoInputRef = useRef<HTMLInputElement>(null);
  const boletoPdfInputRef = useRef<HTMLInputElement>(null);

  // Boleto view dialog
  const [viewBoletoUrl, setViewBoletoUrl] = useState<string | null>(null);
  const [viewBoletoConta, setViewBoletoConta] = useState<ContaPagar | null>(null);

  // Photo AI states
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [extractedExpenses, setExtractedExpenses] = useState<Array<{
    fornecedor: string; descricao: string; valor: number; vencimento: string; categoria: string; observacoes: string | null;
  }>>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice command states
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Consolidation states
  const [unificarDialogOpen, setUnificarDialogOpen] = useState(false);
  const [parcelamentoOpen, setParcelamentoOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<string | null>(null);
  const [selectedContasIds, setSelectedContasIds] = useState<Set<string>>(new Set());
  const [unificarVencimento, setUnificarVencimento] = useState("");
  const [unificarObservacoes, setUnificarObservacoes] = useState("");

  const [form, setForm] = useState({
    fornecedor: "", descricao: "", valor: "", vencimento: "", categoria: "", observacoes: "",
  });

  const [pagarForm, setPagarForm] = useState({
    formasPagamento: [{ forma: "", valor: "" }] as { forma: string; valor: string }[],
  });

  const resetForm = () => setForm({ fornecedor: "", descricao: "", valor: "", vencimento: "", categoria: "", observacoes: "" });

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
      setPhotoDialogOpen(true);
      setPhotoProcessing(true);
      setReviewMode(false);
      setExtractedExpenses([]);

      try {
        const { data, error } = await supabase.functions.invoke("parse-expense-photo", {
          body: { imageBase64: base64 },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const despesas = data?.despesas || [data];
        setExtractedExpenses(despesas.map((d: any) => ({
          fornecedor: d.fornecedor || "",
          descricao: d.descricao || "",
          valor: d.valor || 0,
          vencimento: d.vencimento || "",
          categoria: d.categoria || "Outros",
          observacoes: d.observacoes || null,
        })));
        setReviewMode(true);
        toast.success(`${despesas.length} despesa(s) identificada(s)!`);
      } catch (err: any) {
        console.error("Erro ao processar foto:", err);
        toast.error("Erro ao processar a imagem. Tente novamente.");
      } finally {
        setPhotoProcessing(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveExtracted = async () => {
    const valid = extractedExpenses.filter(d => d.fornecedor && d.valor > 0);
    if (valid.length === 0) {
      toast.error("Nenhuma despesa válida para salvar");
      return;
    }

    const payloads = valid.map(d => ({
      fornecedor: d.fornecedor,
      descricao: d.descricao,
      valor: d.valor,
      vencimento: d.vencimento || new Date().toISOString().split("T")[0],
      categoria: d.categoria || null,
      observacoes: d.observacoes || null,
      unidade_id: unidadeAtual?.id || null,
    }));

    const { error } = await supabase.from("contas_pagar").insert(payloads);
    if (error) {
      toast.error("Erro ao salvar despesas");
      console.error(error);
    } else {
      toast.success(`${valid.length} despesa(s) salva(s) com sucesso!`);
      setPhotoDialogOpen(false);
      setExtractedExpenses([]);
      setPhotoPreview(null);
      fetchContas();
    }
  };

  const updateExtractedField = (idx: number, field: string, value: any) => {
    setExtractedExpenses(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const removeExtracted = (idx: number) => {
    setExtractedExpenses(prev => prev.filter((_, i) => i !== idx));
  };

  // Voice command handlers
  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Seu navegador não suporta reconhecimento de voz");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceListening(true);
      setVoiceText("");
      setVoiceDialogOpen(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceText(transcript);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setVoiceListening(false);
      if (event.error === "not-allowed") {
        toast.error("Permissão de microfone negada");
      } else if (event.error !== "aborted") {
        toast.error("Erro no reconhecimento de voz");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceListening(false);
  };

  const processVoiceCommand = async () => {
    if (!voiceText.trim()) {
      toast.error("Nenhum texto capturado");
      return;
    }

    setVoiceProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-expense-voice", {
        body: { text: voiceText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const despesas = data?.despesas || [data];
      setExtractedExpenses(despesas.map((d: any) => ({
        fornecedor: d.fornecedor || "",
        descricao: d.descricao || "",
        valor: d.valor || 0,
        vencimento: d.vencimento || "",
        categoria: d.categoria || "Outros",
        observacoes: d.observacoes || null,
      })));
      setReviewMode(true);
      setVoiceDialogOpen(false);
      setPhotoDialogOpen(true);
      toast.success(`${despesas.length} despesa(s) identificada(s) por voz!`);
    } catch (err: any) {
      console.error("Erro ao processar comando de voz:", err);
      toast.error("Erro ao interpretar o comando de voz");
    } finally {
      setVoiceProcessing(false);
    }
  };

  const fetchContas = async () => {
    setLoading(true);
    let query = supabase.from("contas_pagar").select("*").order("vencimento", { ascending: true });
    if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);
    const { data, error } = await query;
    if (error) { toast.error("Erro ao carregar contas"); console.error(error); }
    else setContas((data as ContaPagar[]) || []);
    setLoading(false);
  };

  const fetchCategorias = async () => {
    const { data } = await supabase.from("categorias_despesa").select("id,nome,grupo,ativo").eq("ativo", true).order("ordem");
    if (data) setCategoriasDB(data as CategoriaDesp[]);
  };

  useEffect(() => { fetchContas(); fetchCategorias(); }, [unidadeAtual]);

  const handleSubmit = async () => {
    if (!form.fornecedor || !form.descricao || !form.valor || !form.vencimento) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    const payload = {
      fornecedor: form.fornecedor, descricao: form.descricao,
      valor: parseFloat(form.valor), vencimento: form.vencimento,
      categoria: form.categoria || null,
      observacoes: form.observacoes || null,
      unidade_id: unidadeAtual?.id || null,
    };

    if (editId) {
      const { error } = await supabase.from("contas_pagar").update(payload).eq("id", editId);
      if (error) { toast.error("Erro ao atualizar"); console.error(error); }
      else { toast.success("Conta atualizada!"); setDialogOpen(false); setEditId(null); resetForm(); fetchContas(); }
    } else {
      const { error } = await supabase.from("contas_pagar").insert(payload);
      if (error) { toast.error("Erro ao criar conta"); console.error(error); }
      else { toast.success("Conta criada!"); setDialogOpen(false); resetForm(); fetchContas(); }
    }
  };

  const handleEdit = (conta: ContaPagar) => {
    setEditId(conta.id);
    setForm({
      fornecedor: conta.fornecedor, descricao: conta.descricao,
      valor: String(conta.valor), vencimento: conta.vencimento,
      categoria: conta.categoria || "",
      observacoes: conta.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("contas_pagar").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Conta excluída!"); fetchContas(); }
    setDeleteId(null);
  };

  const openPagarDialog = (conta: ContaPagar) => {
    setPagarConta(conta);
    setPagarForm({
      formasPagamento: [{ forma: "", valor: String(conta.valor) }],
    });
    setPagarDialogOpen(true);
  };

  const handlePagar = async () => {
    if (!pagarConta) return;
    const totalPago = pagarForm.formasPagamento.reduce((sum, f) => sum + (parseFloat(f.valor) || 0), 0);
    const valorConta = Number(pagarConta.valor);

    if (totalPago <= 0) { toast.error("Informe o valor pago"); return; }
    if (totalPago > valorConta + 0.01) { toast.error("Valor pago excede o valor da conta"); return; }

    const isParcial = totalPago < valorConta - 0.01;
    const formasStr = pagarForm.formasPagamento
      .filter(f => f.forma && parseFloat(f.valor) > 0)
      .map(f => `${f.forma}: R$ ${parseFloat(f.valor).toFixed(2)}`)
      .join(", ");

    if (isParcial) {
      const restante = valorConta - totalPago;
      const obs = `${pagarConta.observacoes || ""}\nPago parcial R$ ${totalPago.toFixed(2)} em ${format(new Date(), "dd/MM/yyyy")} (${formasStr})`.trim();
      const { error } = await supabase.from("contas_pagar").update({
        valor: restante, observacoes: obs,
      }).eq("id", pagarConta.id);
      if (error) { toast.error("Erro ao processar pagamento parcial"); return; }
      toast.success(`Pago R$ ${totalPago.toFixed(2)} — Restante: R$ ${restante.toFixed(2)}`);
    } else {
      const { error } = await supabase.from("contas_pagar").update({
        status: "paga",
        observacoes: formasStr ? `${pagarConta.observacoes || ""}\nPago via ${formasStr}`.trim() : pagarConta.observacoes,
      }).eq("id", pagarConta.id);
      if (error) { toast.error("Erro ao confirmar pagamento"); return; }
      toast.success("Conta paga integralmente!");
    }
    setPagarDialogOpen(false);
    fetchContas();
  };

  const addFormaPagamento = () => {
    setPagarForm(prev => ({
      ...prev,
      formasPagamento: [...prev.formasPagamento, { forma: "", valor: "" }],
    }));
  };

  const removeFormaPagamento = (idx: number) => {
    setPagarForm(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.filter((_, i) => i !== idx),
    }));
  };

  const updateFormaPagamento = (idx: number, field: "forma" | "valor", value: string) => {
    setPagarForm(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.map((f, i) => i === idx ? { ...f, [field]: value } : f),
    }));
  };

  // Consolidation logic
  const fornecedoresComMultiplas = (() => {
    const pendentes = contas.filter(c => c.status === "pendente");
    const grouped: Record<string, ContaPagar[]> = {};
    pendentes.forEach(c => {
      const key = c.fornecedor.trim().toLowerCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });
    return Object.entries(grouped)
      .filter(([, items]) => items.length >= 2)
      .map(([, items]) => ({
        fornecedor: items[0].fornecedor,
        contas: items,
        total: items.reduce((s, c) => s + Number(c.valor), 0),
      }))
      .sort((a, b) => b.total - a.total);
  })();

  const openUnificarDialog = () => {
    setSelectedFornecedor(null);
    setSelectedContasIds(new Set());
    setUnificarVencimento("");
    setUnificarObservacoes("");
    setUnificarDialogOpen(true);
  };

  const selectFornecedor = (fornecedor: string) => {
    setSelectedFornecedor(fornecedor);
    const grupo = fornecedoresComMultiplas.find(f => f.fornecedor === fornecedor);
    if (grupo) {
      setSelectedContasIds(new Set(grupo.contas.map(c => c.id)));
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setUnificarVencimento(d.toISOString().split("T")[0]);
    }
  };

  const toggleContaSelection = (id: string) => {
    setSelectedContasIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUnificar = async () => {
    if (!selectedFornecedor || selectedContasIds.size < 2) {
      toast.error("Selecione ao menos 2 contas para unificar");
      return;
    }
    if (!unificarVencimento) {
      toast.error("Informe a data de vencimento");
      return;
    }

    const grupo = fornecedoresComMultiplas.find(f => f.fornecedor === selectedFornecedor);
    if (!grupo) return;

    const contasSelecionadas = grupo.contas.filter(c => selectedContasIds.has(c.id));
    const totalUnificado = contasSelecionadas.reduce((s, c) => s + Number(c.valor), 0);

    const detalhes = contasSelecionadas.map(c =>
      `• ${c.descricao} — R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (venc. ${format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy")})`
    ).join("\n");

    const descricaoUnificada = `Conta unificada (${contasSelecionadas.length} itens)`;
    const obsUnificada = `${unificarObservacoes ? unificarObservacoes + "\n\n" : ""}--- Detalhamento ---\n${detalhes}`;

    const { error: insertError } = await supabase.from("contas_pagar").insert({
      fornecedor: selectedFornecedor,
      descricao: descricaoUnificada,
      valor: totalUnificado,
      vencimento: unificarVencimento,
      categoria: contasSelecionadas[0].categoria || null,
      observacoes: obsUnificada,
      unidade_id: unidadeAtual?.id || null,
    });
    if (insertError) { toast.error("Erro ao criar conta unificada"); console.error(insertError); return; }

    const ids = contasSelecionadas.map(c => c.id);
    const { error: updateError } = await supabase.from("contas_pagar")
      .update({ status: "paga", observacoes: `Unificada em ${format(new Date(), "dd/MM/yyyy")}` })
      .in("id", ids);
    if (updateError) { toast.error("Erro ao marcar contas originais"); console.error(updateError); return; }

    toast.success(`${contasSelecionadas.length} contas unificadas! Total: R$ ${totalUnificado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    setUnificarDialogOpen(false);
    fetchContas();
  };

  // Boleto import handlers
  const handleBoletoCapture = async (e: React.ChangeEvent<HTMLInputElement>, isPdf = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBoletoFile(file);
    setBoletoDialogOpen(true);
    setBoletoProcessing(true);
    setBoletoData(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      if (!isPdf) setBoletoPreview(base64);
      else setBoletoPreview(null);

      try {
        const { data, error } = await supabase.functions.invoke("parse-boleto", {
          body: { imageBase64: base64, isPdf },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setBoletoData({
          fornecedor: data.fornecedor || "",
          descricao: data.descricao || "",
          valor: data.valor || 0,
          vencimento: data.vencimento || "",
          codigo_barras: data.codigo_barras || "",
          linha_digitavel: data.linha_digitavel || "",
          categoria: data.categoria || "Outros",
          observacoes: data.observacoes || "",
        });
        toast.success("Boleto lido com sucesso!");
      } catch (err: any) {
        console.error("Erro ao processar boleto:", err);
        toast.error("Erro ao ler o boleto. Tente novamente.");
      } finally {
        setBoletoProcessing(false);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleSaveBoleto = async () => {
    if (!boletoData || !boletoData.fornecedor || !boletoData.valor) {
      toast.error("Fornecedor e valor são obrigatórios");
      return;
    }

    let boletoUrl: string | null = null;

    // Upload boleto file to storage
    if (boletoFile) {
      const ext = boletoFile.name.split(".").pop() || "pdf";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("boletos").upload(fileName, boletoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("boletos").getPublicUrl(fileName);
        boletoUrl = urlData.publicUrl;
      }
    }

    const payload = {
      fornecedor: boletoData.fornecedor,
      descricao: boletoData.descricao,
      valor: boletoData.valor,
      vencimento: boletoData.vencimento || new Date().toISOString().split("T")[0],
      categoria: boletoData.categoria || null,
      observacoes: boletoData.observacoes || null,
      boleto_url: boletoUrl,
      boleto_codigo_barras: boletoData.codigo_barras || null,
      boleto_linha_digitavel: boletoData.linha_digitavel || null,
      unidade_id: unidadeAtual?.id || null,
    };

    const { error } = await supabase.from("contas_pagar").insert(payload);
    if (error) {
      toast.error("Erro ao salvar boleto");
      console.error(error);
    } else {
      toast.success("Boleto importado com sucesso!");
      setBoletoDialogOpen(false);
      setBoletoData(null);
      setBoletoFile(null);
      setBoletoPreview(null);
      fetchContas();
    }
  };

  const handleViewBoleto = async (conta: ContaPagar) => {
    setViewBoletoConta(conta);
    if (conta.boleto_url) {
      // For private bucket, create signed URL
      const urlParts = conta.boleto_url.split("/boletos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { data } = await supabase.storage.from("boletos").createSignedUrl(filePath, 3600);
        setViewBoletoUrl(data?.signedUrl || conta.boleto_url);
      } else {
        setViewBoletoUrl(conta.boleto_url);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const hoje = new Date().toISOString().split("T")[0];

  // Unique fornecedores and categorias for filter dropdowns
  const fornecedoresUnicos = [...new Set(contas.map(c => c.fornecedor))].sort();
  const categoriasUnicas = [...new Set(contas.map(c => c.categoria).filter(Boolean))].sort() as string[];

  const filtered = contas.filter(c => {
    const matchSearch = c.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      c.descricao.toLowerCase().includes(search.toLowerCase());
    const matchDataIni = !dataInicial || c.vencimento >= dataInicial;
    const matchDataFim = !dataFinal || c.vencimento <= dataFinal;
    const vencida = c.status === "pendente" && c.vencimento < hoje;
    const statusAtual = c.status === "paga" ? "paga" : vencida ? "vencida" : "pendente";
    const matchStatus = filtroStatus === "todos" || statusAtual === filtroStatus;
    const matchFornecedor = filtroFornecedor === "todos" || c.fornecedor === filtroFornecedor;
    const matchCategoria = filtroCategoria === "todos" || (c.categoria || "") === filtroCategoria;
    return matchSearch && matchDataIni && matchDataFim && matchStatus && matchFornecedor && matchCategoria;
  });

  const totalPendente = filtered.filter(c => c.status === "pendente" && c.vencimento >= hoje).reduce((a, c) => a + Number(c.valor), 0);
  const totalVencido = filtered.filter(c => c.status === "pendente" && c.vencimento < hoje).reduce((a, c) => a + Number(c.valor), 0);
  const totalPago = filtered.filter(c => c.status === "paga").reduce((a, c) => a + Number(c.valor), 0);

  // Resumo por fornecedor (pendentes only)
  const resumoPorFornecedor = (() => {
    const pendentes = contas.filter(c => c.status === "pendente");
    const grouped: Record<string, { total: number; count: number; vencidas: number }> = {};
    pendentes.forEach(c => {
      if (!grouped[c.fornecedor]) grouped[c.fornecedor] = { total: 0, count: 0, vencidas: 0 };
      grouped[c.fornecedor].total += Number(c.valor);
      grouped[c.fornecedor].count++;
      if (c.vencimento < hoje) grouped[c.fornecedor].vencidas++;
    });
    return Object.entries(grouped)
      .map(([fornecedor, data]) => ({ fornecedor, ...data }))
      .sort((a, b) => b.total - a.total);
  })();

  const totalAberto = totalPendente + totalVencido;

  // Grouped data for table
  const groupedFiltered = (() => {
    if (!agrupar) return null;
    const groups: Record<string, ContaPagar[]> = {};
    filtered.forEach(c => {
      const key = c.fornecedor;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  })();

  const hasActiveFilters = dataInicial || dataFinal || filtroStatus !== "todos" || filtroFornecedor !== "todos" || filtroCategoria !== "todos";
  const clearAllFilters = () => {
    setDataInicial(""); setDataFinal(""); setFiltroStatus("todos");
    setFiltroFornecedor("todos"); setFiltroCategoria("todos");
  };

  const exportToExcel = () => {
    const data = filtered.map(c => ({
      Fornecedor: c.fornecedor,
      Descrição: c.descricao,
      Categoria: c.categoria || "—",
      Vencimento: format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy"),
      Valor: `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      Status: c.status === "paga" ? "Paga" : c.status === "pendente" && c.vencimento < hoje ? "Vencida" : "Pendente",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contas a Pagar");
    XLSX.writeFile(wb, `contas_pagar_${format(new Date(), "ddMMyyyy_HHmm")}.xlsx`);
    toast.success("Arquivo Excel exportado!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Contas a Pagar", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 22);

    const tableData = filtered.map(c => [
      c.fornecedor,
      c.descricao,
      c.categoria || "—",
      format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy"),
      `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      c.status === "paga" ? "Paga" : c.status === "pendente" && c.vencimento < hoje ? "Vencida" : "Pendente",
    ]);

    autoTable(doc, {
      head: [["Fornecedor", "Descrição", "Categoria", "Vencimento", "Valor", "Status"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`contas_pagar_${format(new Date(), "ddMMyyyy_HHmm")}.pdf`);
    toast.success("PDF exportado!");
  };

  return (
    <MainLayout>
      <Header title="Contas a Pagar" subtitle="Gerencie todas as contas, parcelamentos e empréstimos" />
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        <Tabs defaultValue="contas">
          <TabsList>
            <TabsTrigger value="contas"><CreditCard className="h-4 w-4 mr-1" />Contas</TabsTrigger>
            <TabsTrigger value="compromissos"><CalendarRange className="h-4 w-4 mr-1" />Compromissos Futuros</TabsTrigger>
          </TabsList>
          <TabsContent value="contas" className="mt-4 space-y-4 md:space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
          <input
            ref={boletoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleBoletoCapture(e, false)}
          />
          <input
            ref={boletoPdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleBoletoCapture(e, true)}
          />
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditId(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 flex-1 sm:flex-none"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Nova Conta</span><span className="sm:hidden">Nova</span></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Editar Conta" : "Nova Conta a Pagar"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Fornecedor *</Label><Input value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} /></div>
                <div><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label>Vencimento *</Label><Input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {categoriasNomes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); setEditId(null); resetForm(); }}>Cancelar</Button>
                  <Button onClick={handleSubmit}>{editId ? "Atualizar" : "Salvar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Foto com IA</span><span className="sm:hidden">Foto IA</span>
          </Button>
          <Button
            variant={voiceListening ? "destructive" : "outline"}
            className="gap-2 flex-1 sm:flex-none"
            onClick={voiceListening ? stopVoiceListening : startVoiceListening}
          >
            {voiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="hidden sm:inline">{voiceListening ? "Parar" : "Voz"}</span>
            <span className="sm:hidden">{voiceListening ? "Parar" : "Voz"}</span>
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => boletoInputRef.current?.click()}>
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Ler Boleto</span><span className="sm:hidden">Boleto</span>
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => boletoPdfInputRef.current?.click()}>
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Importar PDF</span><span className="sm:hidden">PDF</span>
          </Button>
          {fornecedoresComMultiplas.length > 0 && (
            <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={openUnificarDialog}>
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Unificar Fornecedor</span><span className="sm:hidden">Unificar</span>
            </Button>
          )}
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => setParcelamentoOpen(true)}>
            <CalendarRange className="h-4 w-4" />
            <span className="hidden sm:inline">Parcelar / Empréstimo</span><span className="sm:hidden">Parcelar</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Total a Pagar</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold">R$ {(totalPendente + totalVencido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground hidden sm:block">Em aberto</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Vencidas</CardTitle><AlertCircle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold text-destructive">R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground hidden sm:block">Atenção urgente</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Pendentes</CardTitle><Clock className="h-4 w-4 text-warning" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold text-warning">R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground hidden sm:block">A vencer</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs sm:text-sm font-medium">Pagas</CardTitle><CheckCircle2 className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-lg sm:text-2xl font-bold text-success">R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div><p className="text-xs text-muted-foreground hidden sm:block">Quitadas</p></CardContent></Card>
        </div>

        {/* Resumo por Fornecedor */}
        {resumoPorFornecedor.length > 0 && (
          <Collapsible open={resumoOpen} onOpenChange={setResumoOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">Resumo por Fornecedor</CardTitle>
                      <Badge variant="secondary" className="text-xs">{resumoPorFornecedor.length}</Badge>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${resumoOpen ? "rotate-90" : ""}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {resumoPorFornecedor.map(item => {
                      const percent = totalAberto > 0 ? (item.total / totalAberto) * 100 : 0;
                      return (
                        <button
                          key={item.fornecedor}
                          className="w-full text-left"
                          onClick={() => { setFiltroFornecedor(item.fornecedor); setFiltroStatus("todos"); setResumoOpen(false); }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.fornecedor}</span>
                              <span className="text-xs text-muted-foreground">{item.count} conta{item.count > 1 ? "s" : ""}</span>
                              {item.vencidas > 0 && <Badge variant="destructive" className="text-xs py-0">{item.vencidas} vencida{item.vencidas > 1 ? "s" : ""}</Badge>}
                            </div>
                            <span className="text-sm font-bold">R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <Progress value={percent} className="h-1.5" />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        <Card>
          <CardHeader className="px-3 sm:px-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg">Lista de Contas</CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar conta..." className="pl-10 w-full sm:w-[250px]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2 sm:gap-3">
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground">Fornecedor</Label>
                  <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {fornecedoresUnicos.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {categoriasUnicas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="vencida">Vencidas</SelectItem>
                      <SelectItem value="paga">Pagas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex items-end gap-2">
                  <div className="flex items-center gap-2 h-10">
                    <Checkbox id="agrupar" checked={agrupar} onCheckedChange={(v) => setAgrupar(!!v)} />
                    <Label htmlFor="agrupar" className="text-xs cursor-pointer">Agrupar</Label>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-10" onClick={clearAllFilters}>
                      <X className="h-3 w-3" />Limpar
                    </Button>
                  )}
                </div>
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground">De</Label>
                  <Input type="date" className="w-full sm:w-[145px]" value={dataInicial} onChange={e => setDataInicial(e.target.value)} />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs text-muted-foreground">Até</Label>
                  <Input type="date" className="w-full sm:w-[145px]" value={dataFinal} onChange={e => setDataFinal(e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1 flex gap-2 sm:ml-auto">
                  <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2 flex-1 sm:flex-none">
                    <Download className="h-4 w-4" /><span className="hidden sm:inline">Excel</span><span className="sm:hidden">XLS</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2 flex-1 sm:flex-none">
                    <Download className="h-4 w-4" />PDF
                  </Button>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Filter className="h-3 w-3" />
                  <span>{filtered.length} de {contas.length} contas</span>
                  {filtroFornecedor !== "todos" && <Badge variant="secondary" className="text-xs gap-1 py-0">{filtroFornecedor}<button onClick={() => setFiltroFornecedor("todos")}><X className="h-3 w-3" /></button></Badge>}
                  {filtroCategoria !== "todos" && <Badge variant="secondary" className="text-xs gap-1 py-0">{filtroCategoria}<button onClick={() => setFiltroCategoria("todos")}><X className="h-3 w-3" /></button></Badge>}
                  {filtroStatus !== "todos" && <Badge variant="secondary" className="text-xs gap-1 py-0">{filtroStatus}<button onClick={() => setFiltroStatus("todos")}><X className="h-3 w-3" /></button></Badge>}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {loading ? <p className="text-center py-8 text-muted-foreground">Carregando...</p> : filtered.length === 0 ? <p className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada</p> : (
              <>
                {/* Mobile card view */}
                <div className="sm:hidden space-y-3">
                  {agrupar && groupedFiltered ? (
                    groupedFiltered.map(([fornecedor, items]) => {
                      const groupTotal = items.reduce((s, c) => s + Number(c.valor), 0);
                      return (
                        <div key={`group-${fornecedor}`}>
                          <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-sm">{fornecedor}</span>
                              <Badge variant="outline" className="text-xs">{items.length}</Badge>
                            </div>
                            <span className="font-bold text-sm">R$ {groupTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          {items.map(conta => {
                            const vencida = conta.status === "pendente" && conta.vencimento < hoje;
                            const displayStatus = vencida ? "Vencida" : conta.status === "paga" ? "Paga" : "Pendente";
                            return (
                              <div key={conta.id} className="border rounded-lg p-3 ml-2 mb-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{conta.descricao}</p>
                                    <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {conta.status !== "paga" && <DropdownMenuItem onClick={() => openPagarDialog(conta)}><DollarSign className="h-4 w-4 mr-2" />Pagar</DropdownMenuItem>}
                                      <DropdownMenuItem onClick={() => handleEdit(conta)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                      {(conta.boleto_url || conta.boleto_linha_digitavel) && <DropdownMenuItem onClick={() => handleViewBoleto(conta)}><Eye className="h-4 w-4 mr-2" />Ver Boleto</DropdownMenuItem>}
                                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(conta.id)}><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={displayStatus === "Paga" ? "default" : displayStatus === "Vencida" ? "destructive" : "secondary"} className="text-xs">{displayStatus}</Badge>
                                    {conta.categoria && <Badge variant="outline" className="text-xs">{conta.categoria}</Badge>}
                                  </div>
                                  <span className="font-bold text-sm">R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Venc: {format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  ) : (
                    filtered.map(conta => {
                      const vencida = conta.status === "pendente" && conta.vencimento < hoje;
                      const displayStatus = vencida ? "Vencida" : conta.status === "paga" ? "Paga" : "Pendente";
                      return (
                        <div key={conta.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{conta.descricao}</p>
                              <p className="text-xs text-muted-foreground">{conta.fornecedor}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {conta.status !== "paga" && <DropdownMenuItem onClick={() => openPagarDialog(conta)}><DollarSign className="h-4 w-4 mr-2" />Pagar</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => handleEdit(conta)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                {(conta.boleto_url || conta.boleto_linha_digitavel) && <DropdownMenuItem onClick={() => handleViewBoleto(conta)}><Eye className="h-4 w-4 mr-2" />Ver Boleto</DropdownMenuItem>}
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(conta.id)}><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={displayStatus === "Paga" ? "default" : displayStatus === "Vencida" ? "destructive" : "secondary"} className="text-xs">{displayStatus}</Badge>
                              {conta.categoria && <Badge variant="outline" className="text-xs">{conta.categoria}</Badge>}
                            </div>
                            <span className="font-bold text-sm">R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Venc: {format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Fornecedor</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Vencimento</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {agrupar && groupedFiltered ? (
                        groupedFiltered.map(([fornecedor, items]) => {
                          const groupTotal = items.reduce((s, c) => s + Number(c.valor), 0);
                          return (
                            <>
                              <TableRow key={`group-${fornecedor}`} className="bg-muted/40 hover:bg-muted/60">
                                <TableCell colSpan={4} className="font-semibold">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    {fornecedor}
                                    <Badge variant="outline" className="text-xs">{items.length}</Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold">R$ {groupTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell colSpan={2} />
                              </TableRow>
                              {items.map(conta => {
                                const vencida = conta.status === "pendente" && conta.vencimento < hoje;
                                const displayStatus = vencida ? "Vencida" : conta.status === "paga" ? "Paga" : "Pendente";
                                return (
                                  <TableRow key={conta.id}>
                                    <TableCell className="pl-10 text-muted-foreground text-sm">{conta.fornecedor}</TableCell>
                                    <TableCell>{conta.descricao}</TableCell>
                                    <TableCell><Badge variant="outline">{conta.categoria || "—"}</Badge></TableCell>
                                    <TableCell>{format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="font-medium">R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell><Badge variant={displayStatus === "Paga" ? "default" : displayStatus === "Vencida" ? "destructive" : "secondary"}>{displayStatus}</Badge></TableCell>
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {conta.status !== "paga" && <DropdownMenuItem onClick={() => openPagarDialog(conta)}><DollarSign className="h-4 w-4 mr-2" />Pagar</DropdownMenuItem>}
                                          <DropdownMenuItem onClick={() => handleEdit(conta)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                          {(conta.boleto_url || conta.boleto_linha_digitavel) && <DropdownMenuItem onClick={() => handleViewBoleto(conta)}><Eye className="h-4 w-4 mr-2" />Ver Boleto</DropdownMenuItem>}
                                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(conta.id)}><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </>
                          );
                        })
                      ) : (
                        filtered.map(conta => {
                          const vencida = conta.status === "pendente" && conta.vencimento < hoje;
                          const displayStatus = vencida ? "Vencida" : conta.status === "paga" ? "Paga" : "Pendente";
                          return (
                            <TableRow key={conta.id}>
                              <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                              <TableCell>{conta.descricao}</TableCell>
                              <TableCell><Badge variant="outline">{conta.categoria || "—"}</Badge></TableCell>
                              <TableCell>{format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                              <TableCell className="font-medium">R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell><Badge variant={displayStatus === "Paga" ? "default" : displayStatus === "Vencida" ? "destructive" : "secondary"}>{displayStatus}</Badge></TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {conta.status !== "paga" && <DropdownMenuItem onClick={() => openPagarDialog(conta)}><DollarSign className="h-4 w-4 mr-2" />Pagar</DropdownMenuItem>}
                                    <DropdownMenuItem onClick={() => handleEdit(conta)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                    {(conta.boleto_url || conta.boleto_linha_digitavel) && <DropdownMenuItem onClick={() => handleViewBoleto(conta)}><Eye className="h-4 w-4 mr-2" />Ver Boleto</DropdownMenuItem>}
                                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(conta.id)}><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
          </TabsContent>
          <TabsContent value="compromissos" className="mt-4">
            <CompromissosFuturos />
          </TabsContent>
        </Tabs>

      {/* Dialog Pagar com múltiplas formas */}
      <Dialog open={pagarDialogOpen} onOpenChange={setPagarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pagar Conta</DialogTitle></DialogHeader>
          {pagarConta && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm font-medium">{pagarConta.fornecedor}</p>
                <p className="text-xs text-muted-foreground">{pagarConta.descricao}</p>
                <p className="text-lg font-bold">R$ {Number(pagarConta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Formas de Pagamento</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFormaPagamento}>+ Forma</Button>
                </div>
                {pagarForm.formasPagamento.map((fp, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={fp.forma} onValueChange={v => updateFormaPagamento(idx, "forma", v)}>
                        <SelectTrigger><SelectValue placeholder="Forma" /></SelectTrigger>
                        <SelectContent>
                          {FORMAS_PAGAMENTO.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[120px]">
                      <Input type="number" step="0.01" placeholder="Valor" value={fp.valor}
                        onChange={e => updateFormaPagamento(idx, "valor", e.target.value)} />
                    </div>
                    {pagarForm.formasPagamento.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeFormaPagamento(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">
                  Total informado: <span className="font-medium text-foreground">
                    R$ {pagarForm.formasPagamento.reduce((s, f) => s + (parseFloat(f.valor) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  {pagarForm.formasPagamento.reduce((s, f) => s + (parseFloat(f.valor) || 0), 0) < Number(pagarConta.valor) - 0.01 && (
                    <span className="ml-2 text-warning">(Pagamento parcial)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPagarDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handlePagar}>Confirmar Pagamento</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Voice Command Dialog */}
      <Dialog open={voiceDialogOpen} onOpenChange={(open) => { if (!voiceProcessing) { setVoiceDialogOpen(open); if (!open) { stopVoiceListening(); setVoiceText(""); } } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AudioLines className="h-5 w-5" />
              Comando de Voz
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center gap-4">
              {voiceListening ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                      <Mic className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Ouvindo... Fale a despesa</p>
                  <Button variant="destructive" size="sm" onClick={stopVoiceListening}>
                    <MicOff className="h-4 w-4 mr-2" /> Parar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={startVoiceListening} disabled={voiceProcessing}>
                  <Mic className="h-4 w-4 mr-2" /> Gravar novamente
                </Button>
              )}
            </div>

            {voiceText && (
              <div className="space-y-2">
                <Label>Texto capturado:</Label>
                <div className="p-3 bg-muted rounded-lg text-sm min-h-[60px]">
                  {voiceText}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Exemplo: "Conta de luz da Enel, duzentos e cinquenta reais, vence dia 20"
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setVoiceDialogOpen(false); stopVoiceListening(); setVoiceText(""); }} disabled={voiceProcessing}>
                Cancelar
              </Button>
              <Button onClick={processVoiceCommand} disabled={!voiceText.trim() || voiceProcessing || voiceListening}>
                {voiceProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</> : "Interpretar com IA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo AI Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={(open) => { if (!photoProcessing) { setPhotoDialogOpen(open); if (!open) { setPhotoPreview(null); setExtractedExpenses([]); setReviewMode(false); } } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Importar Despesas por Foto (IA)
            </DialogTitle>
          </DialogHeader>

          {photoProcessing && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Analisando imagem com IA...</p>
              {photoPreview && (
                <img src={photoPreview} alt="Foto enviada" className="max-h-40 rounded-lg opacity-50" />
              )}
            </div>
          )}

          {reviewMode && extractedExpenses.length > 0 && (
            <div className="space-y-4">
              {photoPreview && (
                <div className="flex justify-center">
                  <img src={photoPreview} alt="Foto enviada" className="max-h-32 rounded-lg border" />
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {extractedExpenses.length} despesa(s) identificada(s). Revise e edite antes de salvar:
              </p>

              {extractedExpenses.map((expense, idx) => (
                <Card key={idx} className="relative">
                  <Button
                    variant="ghost" size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeExtracted(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Fornecedor</Label>
                        <Input
                          value={expense.fornecedor}
                          onChange={e => updateExtractedField(idx, "fornecedor", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Categoria</Label>
                        <Select value={expense.categoria} onValueChange={v => updateExtractedField(idx, "categoria", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categoriasNomes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        value={expense.descricao}
                        onChange={e => updateExtractedField(idx, "descricao", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Valor (R$)</Label>
                        <Input
                          type="number" step="0.01"
                          value={expense.valor}
                          onChange={e => updateExtractedField(idx, "valor", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Vencimento</Label>
                        <Input
                          type="date"
                          value={expense.vencimento}
                          onChange={e => updateExtractedField(idx, "vencimento", e.target.value)}
                        />
                      </div>
                    </div>
                    {expense.observacoes && (
                      <div>
                        <Label className="text-xs">Observações</Label>
                        <Input
                          value={expense.observacoes || ""}
                          onChange={e => updateExtractedField(idx, "observacoes", e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setPhotoDialogOpen(false); setExtractedExpenses([]); setPhotoPreview(null); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveExtracted} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar {extractedExpenses.length} despesa(s)
                </Button>
              </div>
            </div>
          )}

          {reviewMode && extractedExpenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Nenhuma despesa identificada na imagem.</p>
              <p className="text-sm mt-1">Tente com uma foto mais nítida do boleto ou conta.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unificar Fornecedor Dialog */}
      <Dialog open={unificarDialogOpen} onOpenChange={setUnificarDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Unificar Contas por Fornecedor
            </DialogTitle>
          </DialogHeader>

          {!selectedFornecedor ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecione o fornecedor para unificar as contas pendentes em uma única cobrança:
              </p>
              {fornecedoresComMultiplas.map(grupo => (
                <button
                  key={grupo.fornecedor}
                  className="w-full flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  onClick={() => selectFornecedor(grupo.fornecedor)}
                >
                  <div>
                    <p className="font-medium">{grupo.fornecedor}</p>
                    <p className="text-sm text-muted-foreground">{grupo.contas.length} contas pendentes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">R$ {grupo.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
              {fornecedoresComMultiplas.length === 0 && (
                <p className="text-center py-6 text-muted-foreground">
                  Nenhum fornecedor com 2+ contas pendentes para unificar.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedFornecedor(null)}>
                ← Voltar
              </Button>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-lg">{selectedFornecedor}</p>
                <p className="text-sm text-muted-foreground">
                  Selecione as contas que deseja unificar:
                </p>
              </div>

              <div className="space-y-2">
                {fornecedoresComMultiplas.find(f => f.fornecedor === selectedFornecedor)?.contas.map(conta => {
                  const vencida = conta.vencimento < hoje;
                  return (
                    <label
                      key={conta.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedContasIds.has(conta.id)}
                        onCheckedChange={() => toggleContaSelection(conta.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{conta.descricao}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>Venc: {format(new Date(conta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</span>
                          {conta.categoria && <Badge variant="outline" className="text-xs py-0">{conta.categoria}</Badge>}
                          {vencida && <Badge variant="destructive" className="text-xs py-0">Vencida</Badge>}
                        </div>
                      </div>
                      <span className="font-semibold whitespace-nowrap">
                        R$ {Number(conta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Unificado ({selectedContasIds.size} contas)</span>
                  <span className="text-lg font-bold">
                    R$ {(fornecedoresComMultiplas.find(f => f.fornecedor === selectedFornecedor)?.contas
                      .filter(c => selectedContasIds.has(c.id))
                      .reduce((s, c) => s + Number(c.valor), 0) || 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vencimento da Conta Unificada *</Label>
                  <Input type="date" value={unificarVencimento} onChange={e => setUnificarVencimento(e.target.value)} />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input value={unificarObservacoes} onChange={e => setUnificarObservacoes(e.target.value)} placeholder="Ex: Boleto semanal" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setUnificarDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleUnificar} disabled={selectedContasIds.size < 2} className="gap-2">
                  <Layers className="h-4 w-4" />
                  Unificar {selectedContasIds.size} Contas
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Boleto Import Dialog */}
      <Dialog open={boletoDialogOpen} onOpenChange={(open) => { if (!boletoProcessing) { setBoletoDialogOpen(open); if (!open) { setBoletoData(null); setBoletoPreview(null); setBoletoFile(null); } } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Importar Boleto
            </DialogTitle>
          </DialogHeader>

          {boletoProcessing && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Lendo boleto com IA...</p>
              {boletoPreview && (
                <img src={boletoPreview} alt="Boleto" className="max-h-40 rounded-lg opacity-50" />
              )}
            </div>
          )}

          {!boletoProcessing && boletoData && (
            <div className="space-y-4">
              {boletoPreview && (
                <div className="flex justify-center">
                  <img src={boletoPreview} alt="Boleto" className="max-h-32 rounded-lg border" />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Fornecedor / Beneficiário</Label>
                  <Input value={boletoData.fornecedor} onChange={e => setBoletoData((p: any) => ({ ...p, fornecedor: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Input value={boletoData.descricao} onChange={e => setBoletoData((p: any) => ({ ...p, descricao: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input type="number" step="0.01" value={boletoData.valor} onChange={e => setBoletoData((p: any) => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Vencimento</Label>
                    <Input type="date" value={boletoData.vencimento} onChange={e => setBoletoData((p: any) => ({ ...p, vencimento: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select value={boletoData.categoria} onValueChange={v => setBoletoData((p: any) => ({ ...p, categoria: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categoriasNomes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {boletoData.linha_digitavel && (
                  <div>
                    <Label className="text-xs">Linha Digitável</Label>
                    <div className="flex gap-2">
                      <Input value={boletoData.linha_digitavel} onChange={e => setBoletoData((p: any) => ({ ...p, linha_digitavel: e.target.value }))} className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(boletoData.linha_digitavel)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {boletoData.codigo_barras && (
                  <div>
                    <Label className="text-xs">Código de Barras</Label>
                    <div className="flex gap-2">
                      <Input value={boletoData.codigo_barras} onChange={e => setBoletoData((p: any) => ({ ...p, codigo_barras: e.target.value }))} className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(boletoData.codigo_barras)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs">Observações</Label>
                  <Textarea value={boletoData.observacoes || ""} onChange={e => setBoletoData((p: any) => ({ ...p, observacoes: e.target.value }))} rows={2} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setBoletoDialogOpen(false); setBoletoData(null); setBoletoFile(null); setBoletoPreview(null); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveBoleto} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar Boleto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Boleto Dialog */}
      <Dialog open={!!viewBoletoConta} onOpenChange={(open) => { if (!open) { setViewBoletoConta(null); setViewBoletoUrl(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Boleto — {viewBoletoConta?.fornecedor}
            </DialogTitle>
          </DialogHeader>
          {viewBoletoConta && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <p className="font-bold text-lg">R$ {Number(viewBoletoConta.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vencimento:</span>
                  <p className="font-medium">{format(new Date(viewBoletoConta.vencimento + "T12:00:00"), "dd/MM/yyyy")}</p>
                </div>
              </div>

              {viewBoletoConta.boleto_linha_digitavel && (
                <div>
                  <Label className="text-xs text-muted-foreground">Linha Digitável</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 bg-muted rounded-md font-mono text-xs break-all">
                      {viewBoletoConta.boleto_linha_digitavel}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(viewBoletoConta.boleto_linha_digitavel!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {viewBoletoConta.boleto_codigo_barras && (
                <div>
                  <Label className="text-xs text-muted-foreground">Código de Barras</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 bg-muted rounded-md font-mono text-xs break-all">
                      {viewBoletoConta.boleto_codigo_barras}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(viewBoletoConta.boleto_codigo_barras!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {viewBoletoUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground">Arquivo do Boleto</Label>
                  <div className="mt-1">
                    {viewBoletoUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <img src={viewBoletoUrl} alt="Boleto" className="max-h-60 rounded-lg border w-full object-contain" />
                    ) : (
                      <a href={viewBoletoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <FileText className="h-4 w-4" /> Abrir PDF do Boleto
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setViewBoletoConta(null); setViewBoletoUrl(null); }}>Fechar</Button>
                {viewBoletoConta.status !== "paga" && (
                  <Button onClick={() => { setViewBoletoConta(null); setViewBoletoUrl(null); openPagarDialog(viewBoletoConta); }}>
                    <DollarSign className="h-4 w-4 mr-2" /> Pagar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ParcelamentoDialog
        open={parcelamentoOpen}
        onOpenChange={setParcelamentoOpen}
        unidadeId={unidadeAtual?.id}
        categorias={categoriasNomes}
        onSuccess={fetchContas}
      />
      </div>
    </MainLayout>
  );
}
