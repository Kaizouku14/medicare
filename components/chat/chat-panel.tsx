"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { Send, Loader2, ChevronUp, RefreshCw } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/chat-message";
import type { ChatMessage as ChatMessageType } from "@/types/domain";

export function ChatPanel({
  sessionId,
  initialMessages,
  hasMore = false,
  className = "",
  patientPanel = false,
}: {
  sessionId: string;
  initialMessages: ChatMessageType[];
  hasMore?: boolean;
  className?: string;
  patientPanel?: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [earlierMessages, setEarlierMessages] = useState<ChatMessageType[]>([]);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [hasMoreEarlier, setHasMoreEarlier] = useState(hasMore);

  const { messages, sendMessage, status, error, regenerate } = useChat({
    id: sessionId,
    transport: new TextStreamChatTransport({
      api: `/api/chat/${sessionId}`,
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages: messages.filter((m) => m.role === "user").slice(-1),
        },
      }),
    }),
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      parts: [{ type: "text" as const, text: m.content }],
    })),
    onError: () => {},
  });

  const isLoading = status === "submitted";

  useEffect(() => {
    sentinelRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadEarlier() {
    setLoadingEarlier(true);
    try {
      const offset = earlierMessages.length + messages.length;
      const res = await fetch(`/api/chat/${sessionId}?offset=${offset}`);
      const data = (await res.json()) as {
        messages?: ChatMessageType[];
        hasMore?: boolean;
      };
      if (data.messages && data.messages.length > 0) {
        setEarlierMessages((prev) => [...data.messages!, ...prev]);
      }
      setHasMoreEarlier(data.hasMore ?? false);
    } catch {
      /* ignore */
    } finally {
      setLoadingEarlier(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <ScrollArea
        className={`flex-1 px-4 py-4 ${patientPanel ? "h-80" : "max-h-[calc(100vh-240px)]"}`}
      >
        <div className="space-y-4">
          {hasMoreEarlier && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadEarlier}
                disabled={loadingEarlier}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                {loadingEarlier ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <ChevronUp className="size-3" />
                )}
                Load earlier messages
              </Button>
            </div>
          )}

          {earlierMessages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {messages.length === 0 && earlierMessages.length === 0 && (
            <p className="pt-8 text-center text-xs text-muted-foreground">
              Ask a question about patient care, diet, or medications.
            </p>
          )}
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={
                {
                  id: m.id,
                  sessionId,
                  role: m.role as "user" | "assistant",
                  content:
                    typeof m.content === "string"
                      ? m.content
                      : (m.parts
                          ?.flatMap((p) => p.type === "text" ? [(p as { text: string }).text] : [])
                          .join("") ?? ""),
                  createdAt: "",
                } as ChatMessageType
              }
            />
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="rounded-2xl bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
                <span className="animate-pulse">Thinking…</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-center text-xs text-destructive">
                Failed to send message. Please try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerate()}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className="size-3" />
                Retry
              </Button>
            </div>
          )}
          <div ref={sentinelRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={onSubmit}
        className="flex gap-2 border-t border-border/60 px-4 py-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={isLoading}
          className="h-9 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !input.trim()}
          className="h-9 shrink-0 rounded-lg px-3"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
