import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
  width?: string;
}

interface ImportReviewDialogProps<T extends Record<string, any>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: T[];
  columns: Column[];
  onUpdateItem: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  saving?: boolean;
  confirmLabel?: string;
}

export function ImportReviewDialog<T extends Record<string, any>>({
  open, onOpenChange, title, description, items, columns,
  onUpdateItem, onRemoveItem, onConfirm, saving, confirmLabel,
}: ImportReviewDialogProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="flex-1 border rounded-md">
          <div className="min-w-[600px]">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  <th className="p-2 text-left font-medium w-8">#</th>
                  {columns.map((col) => (
                    <th key={col.key} className="p-2 text-left font-medium" style={{ width: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="p-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-1.5 text-muted-foreground">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className="p-1">
                        <Input
                          value={item[col.key] ?? ""}
                          onChange={(e) => onUpdateItem(i, col.key, col.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                          type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                          className="h-7 text-xs"
                          step={col.type === "number" ? "0.01" : undefined}
                        />
                      </td>
                    ))}
                    <td className="p-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveItem(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2">
          <p className="text-xs text-muted-foreground mr-auto">
            {items.length} registro(s) para importar
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={saving || items.length === 0}>
            {saving ? "Importando..." : confirmLabel || `Importar ${items.length} registro(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
