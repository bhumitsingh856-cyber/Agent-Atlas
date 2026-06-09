"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import LogoMark from "./LogoMark";
import { useParams } from "next/navigation";
import EnhancedMarkdown from "./ChatMarkdown";
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [stream, setStream] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { id } = useParams();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, stream]);

  const handleSend = async () => {
    setIsLoading(true)
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    try {
      const res = await fetch("/api/researchQA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research_id: id, query: input }),
      })
      let ac: string = ""
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const text = decoder.decode(value);
        ac += text
        setIsLoading(false)
        setStream((prev) => ac);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: ac }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong" }]);
    } finally {
      setIsLoading(false)
      setStream("")
    }
  };

  return (
    <div className="flex w-full flex-col border bg-background shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 scale-105 items-center justify-center rounded-full ">
            <LogoMark />
          </div>
          <span className="font-semibold bg-linear-to-br bg-clip-text text-transparent from-sky-400 to-violet-500 font-900">ATLAS AI</span>
        </div>
        <Button onClick={() => setMessages([])} variant="ghost">Clear</Button>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 max-h-[83dvh] p-4">
        {
          messages.length === 0 && (
            <div className="flex justify-center opacity-5">
              <LogoMark />
            </div>
          )
        }

        <main className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" ? (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <LogoMark />
                    </div>
                    <span className="font-semibold bg-linear-to-br bg-clip-text text-transparent from-sky-400 to-violet-500 font-900">ATLAS AI</span>
                  </div>
                  <div className="whitespace-pre-wrap mt-2"><EnhancedMarkdown content={msg.content} /></div>
                </div>
              ) : (
                <div className="flex gap-2 max-w-[80%]">
                  <div className="whitespace-pre-wrap bg-foreground text-background p-2 rounded-lg">{msg.content}</div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                </div>
              )
              }
            </div>
          ))}
          {
            stream && (
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <LogoMark />
                  </div>
                  <span className="font-semibold bg-linear-to-br bg-clip-text text-transparent from-sky-400 to-violet-500 font-900">ATLAS AI</span>
                </div>
                <div className="whitespace-pre-wrap mt-2"><EnhancedMarkdown content={stream} /></div>
              </div>
            )
          }
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </main>
        <div ref={bottomRef} />
      </ScrollArea>

      {/* Input */}
      <footer className="flex items-center gap-2 border-t p-4">
        <Input
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask something..."
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}