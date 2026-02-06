import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, CheckCircle2, AlertCircle, Send } from "lucide-react";

const documentos = [
  { id: 1, tipo: "Balancete", periodo: "Janeiro 2024", status: "Disponível", geradoEm: "2024-02-01" },
  { id: 2, tipo: "DRE", periodo: "Janeiro 2024", status: "Disponível", geradoEm: "2024-02-01" },
  { id: 3, tipo: "Livro Caixa", periodo: "Janeiro 2024", status: "Disponível", geradoEm: "2024-02-01" },
  { id: 4, tipo: "Notas Fiscais", periodo: "Janeiro 2024", status: "Pendente", geradoEm: null },
  { id: 5, tipo: "Folha de Pagamento", periodo: "Janeiro 2024", status: "Disponível", geradoEm: "2024-02-05" },
  { id: 6, tipo: "Guias de Impostos", periodo: "Janeiro 2024", status: "Disponível", geradoEm: "2024-02-10" },
];

export default function Contador() {
  return (
    <MainLayout>
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
              <p className="text-xs text-muted-foreground">Este período</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{documentos.filter(d => d.status === "Disponível").length}</div>
              <p className="text-xs text-muted-foreground">Prontos para download</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{documentos.filter(d => d.status === "Pendente").length}</div>
              <p className="text-xs text-muted-foreground">Em processamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Período Atual</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Jan/24</div>
              <p className="text-xs text-muted-foreground">Mês de referência</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentos.map((doc) => (
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
                <Badge variant={doc.status === "Disponível" ? "default" : "secondary"}>
                  {doc.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {doc.geradoEm ? `Gerado em ${new Date(doc.geradoEm).toLocaleDateString('pt-BR')}` : "Processando..."}
                  </span>
                  {doc.status === "Disponível" && (
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
      </div>
    </MainLayout>
  );
}
