"use client";

import { useState, useRef } from "react";
import {
  Plus,
  MessageSquare,
  ChevronRight,
  Send,
  Loader2,
  Trash2,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPanel } from "@/components/chat/chat-panel";
import type { ChatSession, ChatMessage } from "@/types/domain";

export function GlobalChatClient({
  sessions: initialSessions,
  activeSessionId: initialSessionId,
  activeMessages: initialMessages,
  activeHasMore = true,
}: {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeMessages: ChatMessage[];
  activeHasMore?: boolean;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [activeId, setActiveId] = useState<string | null>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [hasMore, setHasMore] = useState(activeHasMore);
  const [creating, setCreating] = useState(false);
  const [newInput, setNewInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState<Set<string> | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);

  const messageCache = useRef<Map<string, ChatMessage[]>>(new Map());

  async function createSessionAndSend(text: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) return;

      const sessionId = res.headers.get("X-Session-Id");
      if (!sessionId) return;

      // Read the streaming response to get the assistant's reply
      const reader = res.body?.getReader();
      let assistantText = "";
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
        }
      }

      const firstText = text.length > 60 ? text.slice(0, 60) + "..." : text;

      const newSession: ChatSession = {
        id: sessionId,
        userId: "",
        patientId: null,
        title: firstText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const msgs: ChatMessage[] = [
        {
          id: crypto.randomUUID(),
          sessionId,
          role: "user",
          content: text,
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          sessionId,
          role: "assistant",
          content: assistantText,
          createdAt: new Date().toISOString(),
        },
      ];

      messageCache.current.set(sessionId, msgs);
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(sessionId);
      setMessages(msgs);
      setNewInput("");
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setSelectedIds(new Set());
    setTimeout(() => newInputRef.current?.focus(), 50);
  }

  const hasMoreMap = useRef<Map<string, boolean>>(new Map());

  async function selectSession(sessionId: string) {
    setSelectedIds(new Set());

    const cached = messageCache.current.get(sessionId);
    if (cached) {
      setMessages(cached);
      setHasMore(hasMoreMap.current.get(sessionId) ?? true);
      setActiveId(sessionId);
      return;
    }

    try {
      const res = await fetch(`/api/chat/${sessionId}`);
      const data = (await res.json()) as {
        messages?: ChatMessage[];
        hasMore?: boolean;
      };
      const msgs = data.messages ?? [];
      const more = data.hasMore ?? false;
      messageCache.current.set(sessionId, msgs);
      hasMoreMap.current.set(sessionId, more);
      setMessages(msgs);
      setHasMore(more);
      setActiveId(sessionId);
    } catch {
      setMessages([]);
      setHasMore(false);
      setActiveId(sessionId);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (prev.size === sessions.length) return new Set();
      return new Set(sessions.map((s) => s.id));
    });
  }

  async function confirmDelete() {
    if (!confirmingDelete || confirmingDelete.size === 0) return;
    const ids = Array.from(confirmingDelete);
    const isBulk = confirmingDelete.size > 1;
    setDeleting(true);
    try {
      const res = isBulk
        ? await fetch("/api/chat", {
            method: "DELETE",
            body: JSON.stringify({ ids }),
          })
        : await fetch(`/api/chat/${ids[0]}`, { method: "DELETE" });
      if (!res.ok) return;
      setSessions((prev) => prev.filter((s) => !confirmingDelete.has(s.id)));
      ids.forEach((id) => {
        messageCache.current.delete(id);
        hasMoreMap.current.delete(id);
      });
      if (activeId && confirmingDelete.has(activeId)) {
        const remaining = sessions.filter((s) => !confirmingDelete.has(s.id));
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else {
          setActiveId(null);
          setMessages([]);
        }
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setConfirmingDelete(null);
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-1 gap-4">
      <div className="hidden w-64 shrink-0 space-y-2 sm:block">
        <Button
          onClick={newChat}
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          New Chat
        </Button>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5">
            <span className="flex-1 text-xs text-destructive">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setConfirmingDelete(selectedIds)}
              className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <ScrollArea className="flex-1 pr-2 max-h-96">
          <div className="space-y-0.5">
            {sessions.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-xs text-muted-foreground hover:text-foreground"
              >
                <span
                  className={`flex size-3.5 items-center justify-center rounded border ${
                    selectedIds.size === sessions.length
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  }`}
                >
                  {selectedIds.size === sessions.length && (
                    <Check className="size-2.5" />
                  )}
                </span>
                Select all
              </button>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-left text-sm transition-all ${
                  s.id === activeId
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span
                  onClick={() => toggleSelect(s.id)}
                  className={`flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded border ${
                    selectedIds.has(s.id)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border opacity-0 group-hover:opacity-100"
                  } transition-opacity`}
                >
                  {selectedIds.has(s.id) && <Check className="size-2.5" />}
                </span>
                <button
                  onClick={() => selectSession(s.id)}
                  className="flex flex-1 items-center gap-2 overflow-hidden"
                >
                  <MessageSquare className="size-3.5 shrink-0" />
                  <span className="truncate flex-1">{s.title}</span>
                  <ChevronRight className="size-3 shrink-0 opacity-50" />
                </button>
                {selectedIds.size === 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDelete(new Set([s.id]));
                    }}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="px-3 pt-4 text-center text-xs text-muted-foreground">
                No conversations yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

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
            <div className="w-full max-w-md text-center ">
              <p className="mb-6 text-sm text-muted-foreground">
                Start a new conversation
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = newInput.trim();
                  if (t && !creating) createSessionAndSend(t);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={newInputRef}
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value)}
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

      <Dialog
        open={confirmingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmingDelete(null);
        }}
      >
        {confirmingDelete && (
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                Delete{" "}
                {confirmingDelete.size === 1 ? "conversation" : "conversations"}
                ?
              </DialogTitle>
              <DialogDescription>
                This will permanently delete{" "}
                {confirmingDelete.size === 1
                  ? "this conversation"
                  : `all ${confirmingDelete.size} conversations`}{" "}
                and their messages. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1.5 size-3.5" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
