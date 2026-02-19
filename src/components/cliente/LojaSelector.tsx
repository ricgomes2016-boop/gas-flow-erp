import { useCliente } from "@/contexts/ClienteContext";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

export function LojaSelector() {
  const { lojas, lojaSelecionadaId, setLojaSelecionadaId, lojasLoading } = useCliente();
  const [open, setOpen] = useState(false);

  // Abre o dialog automaticamente quando o carregamento termina e nenhuma loja está selecionada
  useEffect(() => {
    if (!lojasLoading && !lojaSelecionadaId && lojas.length > 1) {
      setOpen(true);
    }
  }, [lojasLoading, lojaSelecionadaId, lojas.length]);

  const lojaSelecionada = lojas.find(l => l.id === lojaSelecionadaId);

  const handleSelect = (id: string) => {
    setLojaSelecionadaId(id);
    setOpen(false);
  };

  if (lojasLoading) return null;

  return (
    <>
      {/* Compact selector button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-primary-foreground/90 hover:text-primary-foreground text-xs transition-colors"
      >
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate max-w-[140px]">
          {lojaSelecionada?.nome || "Escolher loja"}
        </span>
      </button>

      {/* Selection dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Escolha sua loja
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {lojas.map(loja => (
              <Card
                key={loja.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  loja.id === lojaSelecionadaId ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => handleSelect(loja.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{loja.nome}</p>
                    {(loja.bairro || loja.cidade) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[loja.bairro, loja.cidade].filter(Boolean).join(" - ")}
                      </p>
                    )}
                  </div>
                  {loja.id === lojaSelecionadaId && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
