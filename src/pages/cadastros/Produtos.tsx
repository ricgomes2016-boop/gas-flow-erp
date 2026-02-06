import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Search, Edit, Trash2, Flame, Droplets, Box, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";

interface Produto {
  id: string;
  nome: string;
  categoria: string | null;
  preco: number;
  estoque: number | null;
  ativo: boolean | null;
  codigo_barras: string | null;
  descricao: string | null;
  tipo_botijao: string | null;
  image_url: string | null;
}

interface ProdutoForm {
  nome: string;
  categoria: string;
  preco: string;
  estoque: string;
  codigo_barras: string;
  descricao: string;
  tipo_botijao: string;
  image_url: string | null;
}

const initialForm: ProdutoForm = {
  nome: "",
  categoria: "",
  preco: "",
  estoque: "",
  codigo_barras: "",
  descricao: "",
  tipo_botijao: "",
  image_url: null,
};

export default function Produtos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);
  const [form, setForm] = useState<ProdutoForm>(initialForm);

  // Buscar produtos do Supabase
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as Produto[];
    },
  });

  // Mutation para criar produto
  const criarProduto = useMutation({
    mutationFn: async (dados: ProdutoForm) => {
      const { data, error } = await supabase
        .from("produtos")
        .insert({
          nome: dados.nome,
          categoria: dados.categoria || null,
          preco: parseFloat(dados.preco.replace(",", ".")) || 0,
          estoque: parseInt(dados.estoque) || 0,
          codigo_barras: dados.codigo_barras || null,
          descricao: dados.descricao || null,
          tipo_botijao: dados.tipo_botijao || null,
          image_url: dados.image_url || null,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Produto cadastrado com sucesso!" });
      setDialogAberto(false);
      setForm(initialForm);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar produto
  const atualizarProduto = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: ProdutoForm }) => {
      const { data, error } = await supabase
        .from("produtos")
        .update({
          nome: dados.nome,
          categoria: dados.categoria || null,
          preco: parseFloat(dados.preco.replace(",", ".")) || 0,
          estoque: parseInt(dados.estoque) || 0,
          codigo_barras: dados.codigo_barras || null,
          descricao: dados.descricao || null,
          tipo_botijao: dados.tipo_botijao || null,
          image_url: dados.image_url || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Produto atualizado com sucesso!" });
      setDialogAberto(false);
      setEditandoProduto(null);
      setForm(initialForm);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir produto
  const excluirProduto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast({ title: "Produto excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!form.nome || !form.preco) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editandoProduto) {
      atualizarProduto.mutate({ id: editandoProduto.id, dados: form });
    } else {
      criarProduto.mutate(form);
    }
  };

  const handleEditar = (produto: Produto) => {
    setEditandoProduto(produto);
    setForm({
      nome: produto.nome,
      categoria: produto.categoria || "",
      preco: produto.preco.toString().replace(".", ","),
      estoque: (produto.estoque || 0).toString(),
      codigo_barras: produto.codigo_barras || "",
      descricao: produto.descricao || "",
      tipo_botijao: produto.tipo_botijao || "",
      image_url: produto.image_url || null,
    });
    setDialogAberto(true);
  };

  const handleExcluir = (produto: Produto) => {
    if (confirm(`Deseja excluir o produto "${produto.nome}"?`)) {
      excluirProduto.mutate(produto.id);
    }
  };

  const handleNovoClick = () => {
    setEditandoProduto(null);
    setForm(initialForm);
    setDialogAberto(true);
  };

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo_barras?.toLowerCase().includes(busca.toLowerCase())
  );

  // Estatísticas
  const totalProdutos = produtos.length;
  const produtosGas = produtos.filter((p) => p.categoria === "gas").length;
  const produtosAgua = produtos.filter((p) => p.categoria === "agua").length;
  const produtosAcessorios = produtos.filter((p) => p.categoria === "acessorio").length;
  const baixoEstoque = produtos.filter((p) => (p.estoque || 0) < 10).length;

  const isSubmitting = criarProduto.isPending || atualizarProduto.isPending;

  return (
    <MainLayout>
      <Header title="Produtos" subtitle="Catálogo de produtos" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleNovoClick}>
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editandoProduto ? "Editar Produto" : "Cadastrar Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  {editandoProduto
                    ? "Altere os dados do produto abaixo."
                    : "Preencha os dados para cadastrar um novo produto."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome do Produto *</Label>
                  <Input
                    placeholder="Ex: Botijão P13 Cheio"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={form.categoria}
                    onValueChange={(value) => setForm({ ...form, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Gás</SelectItem>
                      <SelectItem value="agua">Água</SelectItem>
                      <SelectItem value="acessorio">Acessório</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Botijão</Label>
                  <Select
                    value={form.tipo_botijao}
                    onValueChange={(value) => setForm({ ...form, tipo_botijao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cheio">Cheio</SelectItem>
                      <SelectItem value="vazio">Vazio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda (R$) *</Label>
                  <Input
                    placeholder="0,00"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Atual</Label>
                  <Input
                    placeholder="0"
                    type="number"
                    value={form.estoque}
                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Código de Barras</Label>
                  <Input
                    placeholder="7891234567890"
                    value={form.codigo_barras}
                    onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Descrição detalhada do produto..."
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Imagem do Produto</Label>
                  <ImageUpload
                    value={form.image_url}
                    onChange={(url) => setForm({ ...form, image_url: url })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editandoProduto ? "Salvar Alterações" : "Salvar Produto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalProdutos}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">No catálogo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Gás</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-orange-600">{produtosGas}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Produtos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Água</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">{produtosAgua}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Produtos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Acessórios</CardTitle>
              <Box className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">{produtosAcessorios}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Produtos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Baixo Est.</CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">{baixoEstoque}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Repor</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Lista de Produtos</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  className="pl-10 w-full sm:w-[300px]"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {busca
                  ? "Nenhum produto encontrado com essa busca."
                  : "Nenhum produto cadastrado. Clique em 'Novo Produto' para adicionar."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 hidden sm:table-cell">Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="hidden sm:table-cell">Estoque</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="hidden sm:table-cell">
                        {produto.image_url ? (
                          <img
                            src={produto.image_url}
                            alt={produto.nome}
                            className="h-10 w-10 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="sm:hidden">
                            {produto.image_url ? (
                              <img
                                src={produto.image_url}
                                alt={produto.nome}
                                className="h-8 w-8 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            {produto.nome}
                            <span className="block md:hidden text-xs text-muted-foreground">
                              {produto.categoria || "Sem categoria"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{produto.categoria || "Sem categoria"}</Badge>
                      </TableCell>
                      <TableCell>
                        R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className={
                            (produto.estoque || 0) < 10
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {produto.estoque || 0}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={produto.ativo ? "default" : "destructive"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditar(produto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExcluir(produto)}
                            disabled={excluirProduto.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
