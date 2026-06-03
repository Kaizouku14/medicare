"use client";

import { Send, Loader2 } from "lucide-react";
import type { RefObject } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat/chat-panel";
import type { ChatMessage } from "@/types/domain";

export function ChatMessageArea({
  activeId,
  messages,
  hasMore,
  creating,
  newInput,
  onNewInputChange,
  onCreateSessionAndSend,
  inputRef,
}: {
  activeId: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
  creating: boolean;
  newInput: string;
  onNewInputChange: (value: string) => void;
  onCreateSessionAndSend: (text: string) => Promise<void>;
  inputRef: RefObject<HTMLInputElement | null>;
}) {

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      {activeId ? (
        <ChatPanel
          key={activeId}
          sessionId={activeId}
          initialMessages={messages}
          hasMore={hasMore}
          className="flex-1"
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-end px-6 py-4">
          <div className="w-full max-w-md text-center">
            <p className="mb-6 text-sm text-muted-foreground">
              Start a new conversation
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = newInput.trim();
                if (t && !creating) onCreateSessionAndSend(t);
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={newInput}
                onChange={(e) => onNewInputChange(e.target.value)}
                placeholder="Type your question..."
                disabled={creating}
                className="h-10 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={creating || !newInput.trim()}
                className="h-10 shrink-0 rounded-lg px-4"
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
