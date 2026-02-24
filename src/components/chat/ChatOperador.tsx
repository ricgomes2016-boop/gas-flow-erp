import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, X, ChevronLeft, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  remetente_id: string;
  remetente_tipo: string;
  remetente_nome: string | null;
  destinatario_id: string | null;
  destinatario_tipo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

interface Entregador {
  id: string;
  nome: string;
  ativo: boolean;
  unread: number;
}

export function ChatOperador() {
  const [open, setOpen] = useState(false);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [selected, setSelected] = useState<Entregador | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  // Carrega entregadores e contagem de não lidas
  const fetchEntregadores = async () => {
    const { data: entregadoresData } = await supabase
      .from("entregadores")
      .select("id, nome, ativo")
      .eq("ativo", true)
      .order("nome");

    if (!entregadoresData) return;

    // Busca mensagens não lidas por entregador
    const { data: unreadData } = await supabase
      .from("chat_mensagens")
      .select("remetente_id")
      .eq("remetente_tipo", "entregador")
      .eq("lida", false);

    const unreadMap: Record<string, number> = {};
    unreadData?.forEach((m) => {
      unreadMap[m.remetente_id] = (unreadMap[m.remetente_id] || 0) + 1;
    });

    const list = entregadoresData.map((e) => ({
      ...e,
      unread: unreadMap[e.id] || 0,
    }));

    setEntregadores(list);
    setTotalUnread(Object.values(unreadMap).reduce((a, b) => a + b, 0));
  };

  useEffect(() => {
    fetchEntregadores();
  }, []);

  // Realtime: atualiza lista ao chegar nova mensagem
  useEffect(() => {
    const channel = supabase
      .channel("chat-operador-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensagens" }, () => {
        fetchEntregadores();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Carrega mensagens do entregador selecionado
  const fetchMessages = async (entregadorId: string) => {
    const { data } = await supabase
      .from("chat_mensagens")
      .select("*")
      .or(
        `remetente_id.eq.${entregadorId},destinatario_id.eq.${entregadorId},and(destinatario_tipo.eq.entregador,destinatario_id.is.null)`
      )
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as ChatMessage[]);
  };

  // Marca como lidas ao abrir conversa
  const markAsRead = async (entregadorId: string) => {
    await supabase
      .from("chat_mensagens")
      .update({ lida: true })
      .eq("remetente_id", entregadorId)
      .eq("remetente_tipo", "entregador")
      .eq("lida", false);
    fetchEntregadores();
  };

  const selectEntregador = async (e: Entregador) => {
    setSelected(e);
    await fetchMessages(e.id);
    await markAsRead(e.id);
  };

  // Realtime mensagens da conversa aberta
  useEffect(() => {
    if (!selected) return;
    const channel = supabase
      .channel(`chat-operador-conv-${selected.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensagens" }, (payload) => {
        const msg = payload.new as ChatMessage;
        const isRelevant =
          msg.remetente_id === selected.id ||
          msg.destinatario_id === selected.id ||
          (msg.destinatario_tipo === "entregador" && !msg.destinatario_id);
        if (isRelevant) {
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
          if (msg.remetente_tipo === "entregador") markAsRead(selected.id);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    await supabase.from("chat_mensagens").insert({
      remetente_id: selected.id, // usando id do entregador como referência no remetente para a query funcionar
      remetente_tipo: "base",
      remetente_nome: profile?.full_name || "Base",
      destinatario_id: selected.id,
      destinatario_tipo: "entregador",
      mensagem: input.trim(),
    });
    setInput("");
    setSending(false);
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const initials = (nome: string) =>
    nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-[4.5rem] md:bottom-6 md:right-24 z-40 h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          title="Chat com Entregadores"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Painel de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-1rem)] h-[500px] max-h-[calc(100vh-5rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-2">
              {selected && (
                <button onClick={() => setSelected(null)} className="mr-1 hover:opacity-80">
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {selected ? selected.nome : "Chat com Entregadores"}
              </span>
            </div>
            <button onClick={() => { setOpen(false); setSelected(null); }} className="hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Lista de entregadores */}
          {!selected && (
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {entregadores.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">Nenhum entregador ativo.</p>
                )}
                {entregadores.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => selectEntregador(e)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {initials(e.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-secondary text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{e.nome}</p>
                      <p className="text-xs text-muted-foreground">Entregador</p>
                    </div>
                    {e.unread > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs h-5 min-w-5 px-1 flex items-center justify-center">
                        {e.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Conversa */}
          {selected && (
            <>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      Nenhuma mensagem ainda.
                    </p>
                  )}
                  {messages.map((msg) => {
                    const isBase = msg.remetente_tipo === "base";
                    return (
                      <div key={msg.id} className={cn("flex", isBase ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm",
                            isBase
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          {!isBase && (
                            <p className="text-xs font-semibold mb-0.5 opacity-70">
                              {msg.remetente_nome || selected.nome}
                            </p>
                          )}
                          <p className="text-sm">{msg.mensagem}</p>
                          <p className={cn("text-[10px] mt-0.5", isBase ? "text-white/60" : "text-muted-foreground")}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-2 border-t flex gap-2">
                <Input
                  placeholder="Digite a mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="rounded-full text-sm"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
