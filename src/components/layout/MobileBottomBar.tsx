import { useState } from "react";
import { Bot, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  onOpenAi: () => void;
  onOpenChat: () => void;
  chatUnread?: number;
}

export function MobileBottomBar({ onOpenAi, onOpenChat, chatUnread = 0 }: MobileBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <button
        onClick={onOpenChat}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-primary transition-colors relative"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[10px] font-medium">Chat</span>
        {chatUnread > 0 && (
          <span className="absolute top-1.5 right-[calc(50%-16px)] h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            {chatUnread > 9 ? "9+" : chatUnread}
          </span>
        )}
      </button>
      <div className="w-px bg-border my-2" />
      <button
        onClick={onOpenAi}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground hover:text-primary transition-colors"
      >
        <Bot className="h-5 w-5" />
        <span className="text-[10px] font-medium">Assistente IA</span>
      </button>
    </div>
  );
}
