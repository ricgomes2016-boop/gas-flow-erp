import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, MapPin, Edit, Trash2, Map, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { geocodeAddress } from "@/lib/geocoding";
import { MapPickerDialog } from "@/components/ui/map-picker-dialog";
import type { GeocodingResult } from "@/lib/geocoding";

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  ultimaCompra: string;
  totalCompras: number;
  latitude?: number | null;
  longitude?: number | null;
}

const clientesIniciais: Cliente[] = [
  { id: 1, nome: "Maria Silva", telefone: "(11) 99999-1111", endereco: "Rua das Flores, 123", bairro: "Centro", ultimaCompra: "05/02/2026", totalCompras: 15 },
  { id: 2, nome: "João Santos", telefone: "(11) 99999-2222", endereco: "Av. Brasil, 456", bairro: "Jardim América", ultimaCompra: "04/02/2026", totalCompras: 8 },
  { id: 3, nome: "Ana Oliveira", telefone: "(11) 99999-3333", endereco: "Rua São Paulo, 789", bairro: "Vila Nova", ultimaCompra: "03/02/2026", totalCompras: 22 },
  { id: 4, nome: "Carlos Ferreira", telefone: "(11) 99999-4444", endereco: "Rua Minas Gerais, 321", bairro: "Centro", ultimaCompra: "02/02/2026", totalCompras: 5 },
  { id: 5, nome: "Lucia Costa", telefone: "(11) 99999-5555", endereco: "Av. Paulista, 1000", bairro: "Consolação", ultimaCompra: "01/02/2026", totalCompras: 12 },
];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: "", telefone: "", endereco: "", bairro: "",
    latitude: null as number | null, longitude: null as number | null,
  });

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.includes(busca) ||
      cliente.bairro.toLowerCase().includes(busca.toLowerCase())
  );

  const handleAdicionarCliente = () => {
    const novo: Cliente = {
      id: clientes.length + 1,
      ...novoCliente,
      ultimaCompra: "-",
      totalCompras: 0,
    };
    setClientes([...clientes, novo]);
    setNovoCliente({ nome: "", telefone: "", endereco: "", bairro: "", latitude: null, longitude: null });
    setDialogOpen(false);
  };

  const handleAddressBlur = async () => {
    const addr = [novoCliente.endereco, novoCliente.bairro].filter(Boolean).join(", ");
    if (addr.length < 5) return;
    setIsGeocoding(true);
    const result = await geocodeAddress(addr);
    if (result) {
      setNovoCliente((prev) => ({
        ...prev,
        latitude: result.latitude,
        longitude: result.longitude,
        bairro: prev.bairro || result.bairro || "",
      }));
    }
    setIsGeocoding(false);
  };

  const handleMapConfirm = (result: GeocodingResult) => {
    setNovoCliente((prev) => ({
      ...prev,
      latitude: result.latitude,
      longitude: result.longitude,
      endereco: result.endereco || prev.endereco,
      bairro: result.bairro || prev.bairro,
    }));
  };

  return (
    <MainLayout>
      <Header title="Clientes" subtitle="Gerencie seus clientes" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Cliente</DialogTitle>
                      <DialogDescription>Preencha os dados do novo cliente</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <div className="flex gap-1">
                          <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="endereco"
                              placeholder="Rua, Avenida..."
                              value={novoCliente.endereco}
                              onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                              onBlur={handleAddressBlur}
                              className="pl-10"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setMapPickerOpen(true)}
                            title="Selecionar no mapa"
                          >
                            {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
                          </Button>
                        </div>
                        {novoCliente.latitude && novoCliente.longitude && (
                          <p className="text-[10px] text-muted-foreground">
                            📍 {novoCliente.latitude.toFixed(5)}, {novoCliente.longitude.toFixed(5)}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input id="bairro" value={novoCliente.bairro} onChange={(e) => setNovoCliente({ ...novoCliente, bairro: e.target.value })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAdicionarCliente}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Bairro</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Total Compras</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {cliente.telefone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {cliente.endereco}
                        {cliente.latitude && <span className="text-[10px] text-muted-foreground ml-1">📍</span>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{cliente.bairro}</Badge></TableCell>
                    <TableCell>{cliente.ultimaCompra}</TableCell>
                    <TableCell>{cliente.totalCompras}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <MapPickerDialog
        open={mapPickerOpen}
        onOpenChange={setMapPickerOpen}
        initialPosition={
          novoCliente.latitude && novoCliente.longitude
            ? { lat: novoCliente.latitude, lng: novoCliente.longitude }
            : null
        }
        onConfirm={handleMapConfirm}
      />
    </MainLayout>
  );
}
