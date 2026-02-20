import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift, Users, TrendingUp, Trophy, Star, CheckCircle, Clock,
  DollarSign, Loader2, Crown, Zap, BarChart3, Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IndicadorRanking {
  nome: string;
  telefone: string;
  indicacoes: number;
  convertidas: number;
  ganhoTotal: number;
  status: string;
}

export default function ProgramaIndicacao() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIndicacoes: 0, convertidas: 0, creditos: 0, ativos: 0 });
  const [ranking, setRanking] = useState<IndicadorRanking[]>([]);
  const [config, setConfig] = useState({ valorIndicador: 10, valorIndicado: 10, ativo: true });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar clientes com código de indicação (simulado via campo telefone como código)
        const { data: clientes } = await supabase
          .from("clientes")
          .select("id, nome, telefone, ativo")
          .eq("ativo", true)
          .order("nome")
          .limit(100);

        // Simular dados de indicações (em produção viria de tabela específica)
        const rankingSimulado: IndicadorRanking[] = (clientes || [])
          .slice(0, 15)
          .map((c, i) => ({
            nome: c.nome,
            telefone: c.telefone || "",
            indicacoes: Math.max(0, 10 - i + Math.floor(Math.random() * 3)),
            convertidas: Math.max(0, 8 - i + Math.floor(Math.random() * 2)),
            ganhoTotal: Math.max(0, (8 - i) * 10),
            status: i < 5 ? "ativo" : "normal",
          }))
          .filter(r => r.indicacoes > 0)
          .sort((a, b) => b.indicacoes - a.indicacoes);

        setRanking(rankingSimulado);
        setStats({
          totalIndicacoes: rankingSimulado.reduce((s, r) => s + r.indicacoes, 0),
          convertidas: rankingSimulado.reduce((s, r) => s + r.convertidas, 0),
          creditos: rankingSimulado.reduce((s, r) => s + r.ganhoTotal, 0),
          ativos: rankingSimulado.filter(r => r.indicacoes >= 3).length,
        });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const conversao = stats.totalIndicacoes > 0
    ? Math.round((stats.convertidas / stats.totalIndicacoes) * 100)
    : 0;

  if (loading) {
    return (
      <MainLayout>
        <Header title="Programa de Indicação" subtitle="Gestão de referrals e recompensas" />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Programa de Indicação" subtitle="Rastreamento de indicações, recompensas e ranking" />
      <div className="p-6 space-y-6">

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Share2 className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold">{stats.totalIndicacoes}</p><p className="text-xs text-muted-foreground">Total Indicações</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-500" /></div>
                <div><p className="text-2xl font-bold">{stats.convertidas}</p><p className="text-xs text-muted-foreground">Convertidas ({conversao}%)</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10"><DollarSign className="h-5 w-5 text-yellow-500" /></div>
                <div><p className="text-2xl font-bold">R$ {stats.creditos}</p><p className="text-xs text-muted-foreground">Créditos Distribuídos</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10"><Users className="h-5 w-5 text-purple-500" /></div>
                <div><p className="text-2xl font-bold">{stats.ativos}</p><p className="text-xs text-muted-foreground">Indicadores Ativos</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ranking">
          <TabsList>
            <TabsTrigger value="ranking"><Trophy className="h-4 w-4 mr-1.5" />Ranking</TabsTrigger>
            <TabsTrigger value="config"><Zap className="h-4 w-4 mr-1.5" />Configurações</TabsTrigger>
            <TabsTrigger value="como"><Gift className="h-4 w-4 mr-1.5" />Como Funciona</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Top 3 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">🏆 Top Indicadores</h3>
                {ranking.slice(0, 3).map((r, i) => (
                  <Card key={r.nome} className={i === 0 ? "border-yellow-400 bg-yellow-500/5" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          i === 0 ? "bg-yellow-500 text-white" : i === 1 ? "bg-gray-400 text-white" : "bg-amber-600 text-white"
                        }`}>
                          {i === 0 ? <Crown className="h-5 w-5" /> : `${i + 1}º`}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{r.nome}</p>
                          <p className="text-xs text-muted-foreground">{r.indicacoes} indicações · {r.convertidas} convertidas</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-sm">R$ {r.ganhoTotal}</p>
                          <p className="text-xs text-muted-foreground">ganho</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tabela completa */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Ranking Completo</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Indicações</TableHead>
                          <TableHead>Convertidas</TableHead>
                          <TableHead>Taxa</TableHead>
                          <TableHead>Ganho</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ranking.map((r, i) => (
                          <TableRow key={r.nome}>
                            <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{r.nome}</p>
                                <p className="text-xs text-muted-foreground">{r.telefone}</p>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{r.indicacoes}</Badge></TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                {r.convertidas}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {r.indicacoes > 0 ? Math.round((r.convertidas / r.indicacoes) * 100) : 0}%
                            </TableCell>
                            <TableCell className="font-bold text-primary">R$ {r.ganhoTotal}</TableCell>
                          </TableRow>
                        ))}
                        {ranking.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              Nenhuma indicação registrada ainda
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações do Programa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border bg-primary/5">
                      <div className="flex items-center gap-3 mb-3">
                        <Gift className="h-5 w-5 text-primary" />
                        <p className="font-semibold">Recompensa por Indicação</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quem indica ganha:</span>
                          <span className="font-bold text-primary">R$ {config.valorIndicador}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quem foi indicado ganha:</span>
                          <span className="font-bold text-green-600">R$ {config.valorIndicado}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border">
                      <p className="font-medium text-sm mb-2">Status do Programa</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${config.ativo ? "bg-green-500" : "bg-destructive"}`} />
                        <span className="text-sm">{config.ativo ? "Ativo" : "Inativo"}</span>
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => {
                          setConfig(c => ({ ...c, ativo: !c.ativo }));
                          toast.success(config.ativo ? "Programa desativado" : "Programa ativado!");
                        }}>
                          {config.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <p className="font-semibold mb-3 text-sm">Regras do Programa</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />Recompensa creditada após a 1ª compra do indicado</li>
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />Crédito válido por 90 dias</li>
                        <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />Sem limite de indicações por cliente</li>
                        <li className="flex items-start gap-2"><Clock className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />Indicado deve ser novo cliente (nunca comprou)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="como">
            <Card>
              <CardHeader><CardTitle className="text-base">Como Funciona o Programa</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { num: "1", icon: Share2, title: "Cliente compartilha", desc: "O cliente acessa o app, copia seu link único de indicação e compartilha com amigos via WhatsApp, redes sociais ou qualquer canal.", color: "text-primary bg-primary/10" },
                    { num: "2", icon: Users, title: "Amigo se cadastra", desc: "O amigo indicado acessa o link, faz o cadastro e realiza a primeira compra usando o código ou link de indicação do amigo.", color: "text-green-600 bg-green-500/10" },
                    { num: "3", icon: Gift, title: "Ambos ganham!", desc: `Automaticamente, o indicador recebe R$ ${config.valorIndicador} na carteira e o indicado recebe R$ ${config.valorIndicado} de desconto na primeira compra.`, color: "text-yellow-600 bg-yellow-500/10" },
                  ].map(item => (
                    <div key={item.num} className="text-center space-y-3">
                      <div className={`h-16 w-16 rounded-full ${item.color} flex items-center justify-center mx-auto`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {item.num}
                      </div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
