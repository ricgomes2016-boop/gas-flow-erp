import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Merge, AlertTriangle, ChevronRight, User, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  tipo: string | null;
  latitude: number | null;
  longitude: number | null;
  ativo: boolean | null;
  created_at: string;
}

interface DuplicateGroup {
  key: string;
  label: string;
  clientes: Cliente[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerged: () => void;
}

function normalizeStr(s: string | null | undefined): string {
  return (s || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function buildAddressKey(c: Cliente): string {
  const parts = [
    normalizeStr(c.endereco),
    normalizeStr(c.numero),
    normalizeStr(c.bairro),
    normalizeStr(c.cidade),
  ].filter(Boolean);
  return parts.join("|");
}

export function MesclarClientesDialog({ open, onOpenChange, onMerged }: Props) {
  const [step, setStep] = useState<"detect" | "merge">("detect");
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [masterId, setMasterId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setStep("detect");
      setSelectedGroup(null);
      setSelectedIds(new Set());
      setMasterId("");
      detectDuplicates();
    }
  }, [open]);

  const detectDuplicates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by normalized address
      const map = new Map<string, Cliente[]>();
      for (const c of data || []) {
        const key = buildAddressKey(c);
        if (!key || key === "|||") continue; // skip clients with no address
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(c);
      }

      const dupGroups: DuplicateGroup[] = [];
      map.forEach((clientes, key) => {
        if (clientes.length > 1) {
          const sample = clientes[0];
          const label = [sample.endereco, sample.numero, sample.bairro, sample.cidade]
            .filter(Boolean)
            .join(", ");
          dupGroups.push({ key, label, clientes });
        }
      });

      setGroups(dupGroups);
    } catch (err: any) {
      toast.error("Erro ao buscar duplicatas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openGroup = (group: DuplicateGroup) => {
    setSelectedGroup(group);
    // Pre-select all
    setSelectedIds(new Set(group.clientes.map(c => c.id)));
    // Master = oldest (first created)
    setMasterId(group.clientes[0].id);
    setStep("merge");
  };

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 2) return prev; // must keep at least 2 to merge
        next.delete(id);
        if (masterId === id) setMasterId([...next][0]);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMerge = async () => {
    if (!selectedGroup || !masterId || selectedIds.size < 2) return;
    const toMerge = [...selectedIds].filter(id => id !== masterId);
    if (toMerge.length === 0) return;

    setMerging(true);
    try {
      // Reassign pedidos from duplicates to master
      for (const dupId of toMerge) {
        await supabase
          .from("pedidos")
          .update({ cliente_id: masterId })
          .eq("cliente_id", dupId);
      }

      // Soft-delete the duplicates
      const { error } = await supabase
        .from("clientes")
        .update({ ativo: false })
        .in("id", toMerge);

      if (error) throw error;

      toast.success(`${toMerge.length} cliente(s) mesclado(s) com sucesso!`);
      onMerged();

      // Re-detect
      await detectDuplicates();
      setStep("detect");
      setSelectedGroup(null);
    } catch (err: any) {
      toast.error("Erro ao mesclar: " + err.message);
    } finally {
      setMerging(false);
    }
  };

  const selectedGroupClients = selectedGroup
    ? selectedGroup.clientes.filter(c => selectedIds.has(c.id))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5 text-primary" />
            Mesclar Clientes com Endereço Repetido
          </DialogTitle>
          <DialogDescription>
            {step === "detect"
              ? "Clientes com o mesmo endereço cadastrado foram agrupados abaixo."
              : `Escolha qual registro manter como principal e quais serão mesclados.`}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: detect */}
        {step === "detect" && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Buscando duplicatas...
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <MapPin className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">Nenhum endereço repetido encontrado!</p>
                <p className="text-xs">Todos os clientes possuem endereços únicos.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {groups.length} grupo{groups.length !== 1 ? "s" : ""} com endereço repetido
                  </Badge>
                </div>
                <ScrollArea className="flex-1 max-h-[50vh]">
                  <div className="space-y-2 pr-2">
                    {groups.map((group) => (
                      <button
                        key={group.key}
                        onClick={() => openGroup(group)}
                        className="w-full text-left border rounded-lg p-3 hover:bg-muted/60 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium truncate">{group.label || "Endereço não informado"}</span>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {group.clientes.length} clientes
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-5">
                              {group.clientes.map(c => (
                                <span key={c.id} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {c.nome}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}

        {/* STEP 2: merge */}
        {step === "merge" && selectedGroup && (
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">{selectedGroup.label}</span>
            </div>

            <div className="grid gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Selecione os clientes a mesclar (mín. 2)
              </p>
              <ScrollArea className="max-h-[40vh]">
                <div className="space-y-2 pr-2">
                  {selectedGroup.clientes.map((c) => {
                    const isSelected = selectedIds.has(c.id);
                    const isMaster = masterId === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`border rounded-lg p-3 transition-colors ${isSelected ? "border-primary/40 bg-primary/5" : "opacity-50"}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleId(c.id)}
                            disabled={isMaster}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{c.nome}</span>
                              {isMaster && (
                                <Badge className="text-[10px] h-4 px-1.5">Principal</Badge>
                              )}
                              {c.cpf && (
                                <span className="text-xs text-muted-foreground">{c.cpf}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                              {c.telefone && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />{c.telefone}
                                </span>
                              )}
                              {c.email && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />{c.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Choose master */}
                        {isSelected && (
                          <div className="mt-2 ml-7">
                            <button
                              onClick={() => setMasterId(c.id)}
                              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                isMaster
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border hover:border-primary text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {isMaster ? "✓ Registro principal" : "Definir como principal"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <strong>Atenção:</strong> Os clientes não-principais serão desativados e seus pedidos transferidos para o cliente principal. Esta ação não pode ser desfeita.
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "merge" ? (
            <>
              <Button variant="outline" onClick={() => setStep("detect")} disabled={merging}>
                ← Voltar
              </Button>
              <Button
                onClick={handleMerge}
                disabled={merging || selectedIds.size < 2 || !masterId}
                variant="destructive"
              >
                <Merge className="h-4 w-4 mr-1.5" />
                {merging ? "Mesclando..." : `Mesclar ${selectedIds.size} clientes`}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
