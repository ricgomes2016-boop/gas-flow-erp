import { useState, useMemo } from "react";
import { ContadorPageWrapper } from "@/components/contador/ContadorPageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidade } from "@/contexts/UnidadeContext";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const PRAZOS_LEGAIS = [
  { label: "FGTS", dia: 7 },
  { label: "EFD-ICMS/IPI", dia: 15 },
  { label: "DAS / INSS / IRRF", dia: 20 },
  { label: "CSLL / PIS / COFINS", dia: 25 },
];

export default function ContadorCalendario() {
  const { unidadeAtual } = useUnidade();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: docs = [] } = useQuery({
    queryKey: ["docs_cal", unidadeAtual?.id, year, month],
    queryFn: async () => {
      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;
      let q = supabase.from("documentos_contabeis").select("id, nome, status, created_at, prazo_entrega")
        .gte("created_at", start).lte("created_at", end + "T23:59:59");
      if (unidadeAtual?.id) q = q.eq("unidade_id", unidadeAtual.id);
      const { data } = await q;
      return data || [];
    },
  });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const docsByDay = useMemo(() => {
    const map: Record<number, { novo: number; lido: number }> = {};
    docs.forEach((d: any) => {
      const day = new Date(d.created_at).getDate();
      if (!map[day]) map[day] = { novo: 0, lido: 0 };
      if (d.status === "disponivel") map[day].lido++;
      else map[day].novo++;
    });
    return map;
  }, [docs]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedDocs = selectedDay
    ? docs.filter((d: any) => new Date(d.created_at).getDate() === selectedDay)
    : [];

  const monthLabel = new Date(year, month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const prazosDias = PRAZOS_LEGAIS.map(p => p.dia);

  return (
    <ContadorPageWrapper title="Calendário" subtitle="Documentos e obrigações do mês">
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(0,0%,95%)]">Calendário</h2>
        <p className="text-sm text-[hsl(220,10%,55%)]">Documentos e obrigações do mês</p>
      </div>

      {/* Month nav */}
      <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-[hsl(165,60%,55%)]"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg font-bold text-[hsl(0,0%,95%)] capitalize">{monthLabel}</CardTitle>
            <Button variant="ghost" size="icon" className="text-[hsl(165,60%,55%)]"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs">
            <span className="text-[hsl(220,10%,55%)]">Legenda:</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[hsl(165,60%,40%)]" /> Docs novos</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[hsl(220,15%,30%)]" /> Já lidos</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[hsl(0,60%,45%)]" /> Prazo fiscal</span>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold py-2 text-[hsl(165,60%,55%)]">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const info = docsByDay[day];
              const isPrazo = prazosDias.includes(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const isSelected = selectedDay === day;

              let bgClass = "bg-[hsl(220,18%,15%)]";
              if (info?.novo) bgClass = "bg-[hsl(165,60%,25%)]";
              else if (info?.lido) bgClass = "bg-[hsl(220,15%,25%)]";
              if (isPrazo && !info) bgClass = "bg-[hsl(0,40%,22%)]";

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`
                    relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                    transition-all duration-150 cursor-pointer
                    ${bgClass}
                    ${isSelected ? "ring-2 ring-[hsl(165,60%,55%)]" : ""}
                    ${isToday ? "ring-2 ring-[hsl(45,90%,55%)]" : ""}
                    hover:brightness-125
                    text-[hsl(0,0%,85%)]
                  `}
                >
                  {day}
                  {info && (
                    <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[hsl(165,60%,55%)]" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day details */}
      {selectedDay && (
        <Card className="bg-[hsl(220,22%,12%)] border-[hsl(220,15%,20%)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[hsl(165,60%,55%)]">
              Dia {String(selectedDay).padStart(2, "0")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Prazos fiscais do dia */}
            {PRAZOS_LEGAIS.filter(p => p.dia === selectedDay).map(p => (
              <div key={p.label} className="p-3 rounded-lg bg-[hsl(0,40%,22%)] border border-[hsl(0,60%,35%)]">
                <div className="flex items-center gap-2">
                  <CalIcon className="h-4 w-4 text-[hsl(0,80%,65%)]" />
                  <span className="text-sm font-medium text-[hsl(0,80%,75%)]">Prazo: {p.label}</span>
                </div>
              </div>
            ))}
            {/* Docs do dia */}
            {selectedDocs.length === 0 && PRAZOS_LEGAIS.filter(p => p.dia === selectedDay).length === 0 && (
              <p className="text-sm text-[hsl(220,10%,45%)] py-2">Nenhum documento neste dia.</p>
            )}
            {selectedDocs.map((doc: any) => (
              <div key={doc.id} className="p-3 rounded-lg bg-[hsl(220,18%,15%)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(0,0%,88%)]">{doc.nome}</p>
                  <p className="text-xs text-[hsl(220,10%,50%)]">
                    {new Date(doc.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge className={
                  doc.status === "disponivel" ? "bg-[hsl(165,60%,40%)]/20 text-[hsl(165,60%,55%)]" :
                  doc.status === "pendente" ? "bg-[hsl(45,90%,55%)]/20 text-[hsl(45,90%,60%)]" :
                  "bg-[hsl(220,15%,25%)] text-[hsl(220,10%,65%)]"
                }>
                  {doc.status === "disponivel" ? "Lido" : doc.status === "pendente" ? "Novo" : doc.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
    </ContadorPageWrapper>
  );
}
