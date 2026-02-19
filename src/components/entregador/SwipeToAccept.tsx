import { useRef, useState, useCallback } from "react";
import { CheckCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToAcceptProps {
  onAccept: () => void;
  label?: string;
  disabled?: boolean;
}

export function SwipeToAccept({ onAccept, label = "Deslize para aceitar", disabled = false }: SwipeToAcceptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const THRESHOLD = 0.7; // 70% of width to trigger

  const getMaxDrag = () => {
    if (!containerRef.current) return 200;
    return containerRef.current.offsetWidth - 56; // 56 = thumb width
  };

  const handleStart = useCallback((clientX: number) => {
    if (disabled) return;
    startXRef.current = clientX;
    setIsDragging(true);
  }, [disabled]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startXRef.current;
    const max = getMaxDrag();
    setDragX(Math.max(0, Math.min(diff, max)));
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const max = getMaxDrag();
    if (dragX / max >= THRESHOLD) {
      // Trigger vibration feedback
      if ("vibrate" in navigator) navigator.vibrate(100);
      onAccept();
    }
    setDragX(0);
  }, [isDragging, dragX, onAccept]);

  const progress = dragX / getMaxDrag();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-14 rounded-xl overflow-hidden select-none touch-pan-y",
        "bg-gradient-to-r from-primary/20 to-primary/10",
        disabled && "opacity-50 pointer-events-none"
      )}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (isDragging) handleEnd(); }}
    >
      {/* Background fill */}
      <div
        className="absolute inset-0 bg-primary/20 transition-none"
        style={{ width: `${(dragX + 56)}px` }}
      />

      {/* Label */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-primary"
        style={{ opacity: 1 - progress * 1.5 }}
      >
        <span>{label}</span>
        <ChevronRight className="h-4 w-4 animate-pulse" />
        <ChevronRight className="h-4 w-4 animate-pulse [animation-delay:150ms]" />
      </div>

      {/* Draggable thumb */}
      <div
        className={cn(
          "absolute top-1 left-1 h-12 w-12 rounded-lg flex items-center justify-center",
          "gradient-primary text-white shadow-lg",
          isDragging ? "scale-110" : "transition-transform"
        )}
        style={{
          transform: `translateX(${dragX}px) ${isDragging ? "scale(1.1)" : "scale(1)"}`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <CheckCircle className="h-6 w-6" />
      </div>
    </div>
  );
}
