import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PDVItem {
  id: string;
  produto_id: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

interface PDVProductListProps {
  itens: PDVItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdatePrice?: (index: number, newPrice: number) => void;
}

export function PDVProductList({ itens, onUpdateQuantity, onRemoveItem, onUpdatePrice }: PDVProductListProps) {
  if (itens.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">Nenhum item</p>
          <p className="text-sm">Escaneie ou busque um produto</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-1">
        {itens.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-card border rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.nome}</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.preco_unitario}
                  onChange={(e) => onUpdatePrice?.(index, Number(e.target.value))}
                  className="w-20 h-6 text-xs px-1"
                />
                <span className="text-xs text-muted-foreground">/ un</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(index, -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={item.quantidade}
                onChange={(e) => {
                  const newQtd = parseInt(e.target.value) || 1;
                  if (newQtd >= 1) {
                    // Set quantity directly via delta
                    onUpdateQuantity(index, newQtd - item.quantidade);
                  }
                }}
                className="w-14 h-8 text-center text-base font-medium"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(index, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-right min-w-[5rem]">
              <p className="font-bold text-primary">
                R$ {item.total.toFixed(2)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRemoveItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
