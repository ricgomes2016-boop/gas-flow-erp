import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaitingTimerProps {
  createdAt: string;
  urgentThresholdMinutes?: number;
}

export function WaitingTimer({ createdAt, urgentThresholdMinutes = 10 }: WaitingTimerProps) {
  const [minutesWaiting, setMinutesWaiting] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - new Date(createdAt).getTime();
      setMinutesWaiting(Math.floor(diff / 60000));
    };
    calc();
    const interval = setInterval(calc, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [createdAt]);

  const isUrgent = minutesWaiting >= urgentThresholdMinutes;
  const label = minutesWaiting < 1 ? "Agora mesmo" : `Aguardando há ${minutesWaiting} min`;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit",
        isUrgent
          ? "bg-destructive/10 text-destructive animate-pulse"
          : "bg-warning/10 text-warning"
      )}
    >
      {isUrgent ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      <span>{label}</span>
    </div>
  );
}
