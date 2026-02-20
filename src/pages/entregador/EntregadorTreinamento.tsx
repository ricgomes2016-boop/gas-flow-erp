import { useState, useRef, useEffect } from "react";
import { EntregadorLayout } from "@/components/entregador/EntregadorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Send, Bot, User, Lightbulb, Flame, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGESTOES = [
  "Como convencer um cliente que diz que está caro?",
  "Como oferecer o botijão maior (P20) para um cliente do P13?",
  "O cliente diz que vai pensar. O que faço?",
  "Como abordar um cliente novo na porta?",
  "Como fidelizar clientes que compram pouco?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/treinamento-vendas`;

export default function EntregadorTreinamento() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou seu **coach de vendas** especialista em revenda de gás. Posso te ajudar com técnicas de vendas, como contornar objeções, aumentar seu ticket médio e fidelizar clientes. Pode perguntar à vontade!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (resp.status === 429) {
        toast.error("Muitas requisições. Aguarde um momento.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos insuficientes para usar o coach IA.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Erro ao conectar com o coach.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantText = "";
      let streamDone = false;

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              assistantText += chunk;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantText };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao conectar com o coach IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EntregadorLayout title="Treinamento de Vendas">
      <div className="flex flex-col h-[calc(100vh-130px)]">

        {/* Header card */}
        <div className="p-4 pb-0">
          <div className="gradient-primary rounded-2xl p-4 text-white shadow-lg flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-base">Coach de Vendas IA</h2>
              <p className="text-white/80 text-xs">Especialista em revenda de gás • Disponível 24h</p>
            </div>
            <Badge className="ml-auto bg-white/20 text-white border-none text-xs">
              <Flame className="h-3 w-3 mr-1" /> Online
            </Badge>
          </div>

          {/* Sugestões rápidas */}
          {messages.length <= 1 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Perguntas sugeridas:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-muted hover:bg-primary/10 text-foreground rounded-full px-3 py-1.5 border border-border transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="h-4 w-4" />
                    : <User className="h-4 w-4" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{msg.content || (loading && i === messages.length - 1 ? "▌" : "")}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Pergunte sobre técnicas de venda..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </EntregadorLayout>
  );
}
