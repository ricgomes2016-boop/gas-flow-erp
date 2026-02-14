import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

export default function Contador() {
  const { unidadeAtual } = useUnidade();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos_contabeis", unidadeAtual?.id],
    queryFn: async () => {
      let query = supabase
        .from("documentos_contabeis")
        .select("*")
        .order("created_at", { ascending: false });

      if (unidadeAtual?.id) query = query.eq("unidade_id", unidadeAtual.id);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const disponiveis = documentos.filter((d: any) => d.status === "disponivel").length;
  const pendentes = documentos.filter((d: any) => d.status === "pendente").length;

  // Determine current period from latest document or fallback
  const periodoAtual = documentos.length > 0 ? documentos[0].periodo : "—";

  return (
    <MainLayout>
      <Header title="Área do Contador" subtitle="Documentos e relatórios para contabilidade" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Área do Contador</h1>
            <p className="text-muted-foreground">Documentos e relatórios para contabilidade</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Enviar para Contador
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Baixar Todos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentos.length}</div>
              <p className="text-xs text-muted-foreground">Total cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{disponiveis}</div>
              <p className="text-xs text-muted-foreground">Prontos para download</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
              <p className="text-xs text-muted-foreground">Em processamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Período Atual</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{periodoAtual}</div>
              <p className="text-xs text-muted-foreground">Referência</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Carregando documentos...</p>
        ) : documentos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum documento cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((doc: any) => (
              <Card key={doc.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{doc.tipo}</CardTitle>
                      <p className="text-sm text-muted-foreground">{doc.periodo}</p>
                    </div>
                  </div>
                  <Badge variant={doc.status === "disponivel" ? "default" : "secondary"}>
                    {doc.status === "disponivel" ? "Disponível" : "Pendente"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {doc.gerado_em
                        ? `Gerado em ${new Date(doc.gerado_em).toLocaleDateString("pt-BR")}`
                        : "Processando..."}
                    </span>
                    {doc.status === "disponivel" && (
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3 w-3" />
                        Baixar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
