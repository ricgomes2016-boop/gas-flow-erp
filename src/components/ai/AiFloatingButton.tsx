import { useState, useEffect } from "react";
import { Bot, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AiAssistantChat } from "./AiAssistantChat";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AiFloatingButtonProps {
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

export function AiFloatingButton({ externalOpen, onExternalClose }: AiFloatingButtonProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  const handleClose = () => {
    setOpen(false);
    onExternalClose?.();
  };

  return (
    <>
      {/* Desktop floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 hidden md:flex h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 items-center justify-center"
          title="Assistente IA"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <Card className={cn(
          "fixed z-40 shadow-2xl border flex flex-col",
          "bottom-0 left-0 right-0 h-[80vh] rounded-t-2xl rounded-b-none md:bottom-6 md:right-6 md:left-auto md:w-[380px] md:h-[520px] md:max-h-[calc(100vh-6rem)] md:rounded-lg"
        )}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5 rounded-t-2xl md:rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Assistente IA</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { handleClose(); navigate("/assistente-ia"); }}
                title="Abrir página completa"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <AiAssistantChat />
        </Card>
      )}
    </>
  );
}
