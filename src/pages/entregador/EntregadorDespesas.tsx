import { useState, useRef } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Receipt,
  Camera,
  Fuel,
  Utensils,
  Wrench,
  Car,
  Plus,
  CheckCircle,
  Clock,
  X,
  Image,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Despesa {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  hora: string;
  status: "pendente" | "aprovada" | "rejeitada";
  fotoUrl?: string;
}

const tiposDespesa = [
  { id: "combustivel", nome: "Combustível", icon: Fuel },
  { id: "refeicao", nome: "Refeição", icon: Utensils },
  { id: "manutencao", nome: "Manutenção", icon: Wrench },
  { id: "estacionamento", nome: "Estacionamento", icon: Car },
  { id: "outros", nome: "Outros", icon: Receipt },
];

const despesasIniciais: Despesa[] = [
  {
    id: 1,
    tipo: "combustivel",
    descricao: "Abastecimento - Posto Shell",
    valor: 150.0,
    data: "06/02/2025",
    hora: "08:30",
    status: "aprovada",
    fotoUrl: "https://via.placeholder.com/200",
  },
  {
    id: 2,
    tipo: "refeicao",
    descricao: "Almoço - Restaurante Popular",
    valor: 25.0,
    data: "06/02/2025",
    hora: "12:15",
    status: "pendente",
    fotoUrl: "https://via.placeholder.com/200",
  },
  {
    id: 3,
    tipo: "manutencao",
    descricao: "Troca de óleo",
    valor: 180.0,
    data: "05/02/2025",
    hora: "14:00",
    status: "aprovada",
  },
  {
    id: 4,
    tipo: "refeicao",
    descricao: "Jantar",
    valor: 30.0,
    data: "05/02/2025",
    hora: "19:30",
    status: "rejeitada",
  },
];

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-warning/10 text-warning", icon: Clock },
  aprovada: { label: "Aprovada", color: "bg-success/10 text-success", icon: CheckCircle },
  rejeitada: { label: "Rejeitada", color: "bg-destructive/10 text-destructive", icon: X },
};

export default function EntregadorDespesas() {
  const [despesas, setDespesas] = useState<Despesa[]>(despesasIniciais);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({
    tipo: "",
    descricao: "",
    valor: "",
  });
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const totalPendente = despesas
    .filter((d) => d.status === "pendente")
    .reduce((acc, d) => acc + d.valor, 0);

  const totalAprovado = despesas
    .filter((d) => d.status === "aprovada")
    .reduce((acc, d) => acc + d.valor, 0);

  const handleCapturarFoto = () => {
    // Simula captura de foto (em produção usaria getUserMedia)
    setCapturedPhoto("https://via.placeholder.com/300x200?text=Comprovante");
    toast({
      title: "Foto capturada!",
      description: "O comprovante foi anexado à despesa.",
    });
  };

  const handleSelecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const enviarDespesa = () => {
    if (!novaDespesa.tipo || !novaDespesa.valor) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o tipo e valor da despesa.",
        variant: "destructive",
      });
      return;
    }

    const tipoInfo = tiposDespesa.find((t) => t.id === novaDespesa.tipo);
    const novaId = Math.max(...despesas.map((d) => d.id)) + 1;
    const agora = new Date();

    setDespesas((prev) => [
      {
        id: novaId,
        tipo: novaDespesa.tipo,
        descricao: novaDespesa.descricao || tipoInfo?.nome || "",
        valor: Number(novaDespesa.valor),
        data: agora.toLocaleDateString("pt-BR"),
        hora: agora.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "pendente",
        fotoUrl: capturedPhoto || undefined,
      },
      ...prev,
    ]);

    setNovaDespesa({ tipo: "", descricao: "", valor: "" });
    setCapturedPhoto(null);
    setDialogAberto(false);
    toast({
      title: "Despesa enviada!",
      description: "Aguardando aprovação do gestor.",
    });
  };

  const getTipoIcon = (tipoId: string) => {
    const tipo = tiposDespesa.find((t) => t.id === tipoId);
    return tipo?.icon || Receipt;
  };

  const getTipoNome = (tipoId: string) => {
    const tipo = tiposDespesa.find((t) => t.id === tipoId);
    return tipo?.nome || tipoId;
  };

  return (
    <EntregadorLayout title="Despesas">
      <div className="p-4 space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-lg font-bold">R$ {totalPendente.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-lg font-bold">R$ {totalAprovado.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Nova Despesa */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 gradient-primary text-white shadow-glow">
              <Camera className="h-5 w-5 mr-2" />
              Registrar Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Área de foto */}
              <div className="space-y-2">
                <Label className="text-xs">Comprovante (Foto)</Label>
                <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center overflow-hidden">
                  {capturedPhoto ? (
                    <div className="relative w-full h-full">
                      <img
                        src={capturedPhoto}
                        alt="Comprovante"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => setCapturedPhoto(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Image className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Tire uma foto do comprovante
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCapturarFoto}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Câmera
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Galeria
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelecionarFoto}
                  />
                </div>
              </div>

              {/* Tipo de despesa */}
              <div className="space-y-2">
                <Label className="text-xs">Tipo de Despesa *</Label>
                <Select
                  value={novaDespesa.tipo}
                  onValueChange={(value) =>
                    setNovaDespesa({ ...novaDespesa, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDespesa.map((tipo) => {
                      const Icon = tipo.icon;
                      return (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {tipo.nome}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Input
                  value={novaDespesa.descricao}
                  onChange={(e) =>
                    setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
                  }
                  placeholder="Ex: Posto Shell, Restaurante..."
                />
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label className="text-xs">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaDespesa.valor}
                  onChange={(e) =>
                    setNovaDespesa({ ...novaDespesa, valor: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <Button
                onClick={enviarDespesa}
                className="w-full gradient-primary text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Enviar Despesa
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista de despesas */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Histórico de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {despesas.map((despesa) => {
              const TipoIcon = getTipoIcon(despesa.tipo);
              const StatusIcon = statusConfig[despesa.status].icon;

              return (
                <div
                  key={despesa.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TipoIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {despesa.descricao}
                      </p>
                      <Badge className={statusConfig[despesa.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[despesa.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {despesa.data} às {despesa.hora}
                      </p>
                      <p className="font-bold text-primary">
                        R$ {despesa.valor.toFixed(2)}
                      </p>
                    </div>
                    {despesa.fotoUrl && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Image className="h-3 w-3 mr-1" />
                          Comprovante anexado
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </EntregadorLayout>
  );
}
