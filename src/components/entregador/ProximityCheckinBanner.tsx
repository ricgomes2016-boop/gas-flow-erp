import { MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProximityCheckinBannerProps {
  isNearby: boolean;
  distanceMeters: number | null;
  onCheckin: () => void;
  className?: string;
}

export function ProximityCheckinBanner({
  isNearby,
  distanceMeters,
  onCheckin,
  className,
}: ProximityCheckinBannerProps) {
  if (distanceMeters === null) return null;

  return (
    <div
      className={cn(
        "rounded-xl p-3 flex items-center gap-3 transition-all duration-500",
        isNearby
          ? "bg-green-500/15 border border-green-500/30 animate-pulse"
          : "bg-muted/50 border border-border",
        className
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          isNearby ? "bg-green-500 text-white" : "bg-muted"
        )}
      >
        <MapPin className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", isNearby && "text-green-700 dark:text-green-400")}>
          {isNearby ? "Você chegou!" : `A ${distanceMeters}m do destino`}
        </p>
        <p className="text-xs text-muted-foreground">
          {isNearby
            ? "Toque para confirmar chegada"
            : "O botão ativará ao se aproximar"}
        </p>
      </div>
      {isNearby && (
        <Button
          size="sm"
          onClick={onCheckin}
          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Cheguei
        </Button>
      )}
    </div>
  );
}
