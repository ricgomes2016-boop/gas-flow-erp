import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useClientes, type ClienteDB, type ClienteForm } from "@/hooks/useClientes";
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { ClienteFormDialog } from "@/components/clientes/ClienteFormDialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Clientes() {
  const {
    clientes, loading, busca, setBusca, filtroBairro, setFiltroBairro,
    bairros, page, setPage, totalPages, totalCount,
    salvarCliente, excluirCliente, emptyForm, fetchClientes,
  } = useClientes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<{ form: ClienteForm; id?: string }>({ form: emptyForm });

  const handleNovo = () => {
    setEditData({ form: emptyForm });
    setDialogOpen(true);
  };

  const handleEdit = (c: ClienteDB) => {
    setEditData({
      form: {
        nome: c.nome,
        telefone: c.telefone || "",
        email: c.email || "",
        cpf: c.cpf || "",
        endereco: c.endereco || "",
        numero: c.numero || "",
        bairro: c.bairro || "",
        cidade: c.cidade || "",
        cep: c.cep || "",
        tipo: c.tipo || "residencial",
        latitude: c.latitude,
        longitude: c.longitude,
      },
      id: c.id,
    });
    setDialogOpen(true);
  };

  const exportExcel = () => {
    const rows = clientes.map((c) => ({
      Nome: c.nome,
      Telefone: c.telefone || "",
      Email: c.email || "",
      CPF: c.cpf || "",
      Endereço: c.endereco || "",
      Número: c.numero || "",
      Bairro: c.bairro || "",
      Cidade: c.cidade || "",
      CEP: c.cep || "",
      Tipo: c.tipo || "",
      Pedidos: c.total_pedidos || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    XLSX.writeFile(wb, "clientes.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Lista de Clientes", 14, 20);
    doc.setFontSize(10);
    doc.text(`Total: ${totalCount} clientes`, 14, 28);

    autoTable(doc, {
      startY: 34,
      head: [["Nome", "Telefone", "Endereço", "Nº", "Bairro", "Pedidos"]],
      body: clientes.map((c) => [
        c.nome,
        c.telefone || "-",
        c.endereco || "-",
        c.numero || "-",
        c.bairro || "-",
        String(c.total_pedidos || 0),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("clientes.pdf");
  };

  return (
    <MainLayout>
      <Header title="Clientes" subtitle="Gerencie seus clientes" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {totalCount} cliente{totalCount !== 1 ? "s" : ""}
                </Badge>
                <Select value={filtroBairro} onValueChange={setFiltroBairro}>
                  <SelectTrigger className="w-40 h-9 text-xs">
                    <SelectValue placeholder="Filtrar bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os bairros</SelectItem>
                    {bairros.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-60 pl-9 h-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-1.5 h-4 w-4" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportExcel}>Excel (.xlsx)</DropdownMenuItem>
                    <DropdownMenuItem onClick={exportPDF}>PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={handleNovo}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClienteTable
              clientes={clientes}
              loading={loading}
              onEdit={handleEdit}
              onDelete={excluirCliente}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editData.form}
        editId={editData.id}
        onSave={salvarCliente}
      />
    </MainLayout>
  );
}
