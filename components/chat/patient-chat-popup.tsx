"use client";

import { useState } from "react";
import { X, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat/chat-panel";
import type { ChatMessage } from "@/types/domain";

export function PatientChatPopup({
  patientId,
}: {
  patientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  async function initChat() {
    if (sessionId) {
      setOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/patient?patientId=${patientId}`);
      const data = (await res.json()) as {
        session: { id: string };
        messages: ChatMessage[];
        hasMore: boolean;
      };
      setSessionId(data.session.id);
      setInitialMessages(data.messages);
      setHasMore(data.hasMore);
      setOpen(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button"
        onClick={initChat}
        disabled={loading}
        className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : open ? (
          <X className="size-5" />
        ) : (
          <Bot className="size-5" />
        )}
      </button>

      {open && sessionId && (
        <div className="fixed bottom-20 right-5 z-50 flex w-90 max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-border/60 bg-card shadow-2xl">
          <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                <Bot className="size-3.5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Caregiver Chat
              </p>
            </div>
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              size="sm"
              className="size-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <ChatPanel
            sessionId={sessionId}
            initialMessages={initialMessages}
            hasMore={hasMore}
            className="h-96"
            patientPanel={true}
          />
        </div>
      )}
    </>
  );
}
