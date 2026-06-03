"use client";

import { useState, useRef } from "react";
import { SessionList } from "@/components/chat/session-list";
import { ChatMessageArea } from "@/components/chat/chat-message-area";
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

  const messageCache = useRef<Map<string, ChatMessage[]>>(null!);
  if (messageCache.current === null) messageCache.current = new Map();

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

  const hasMoreMap = useRef<Map<string, boolean>>(null!);
  if (hasMoreMap.current === null) hasMoreMap.current = new Map();

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
      <SessionList
        sessions={sessions}
        activeId={activeId}
        selectedIds={selectedIds}
        confirmingDelete={confirmingDelete}
        deleting={deleting}
        onNewChat={newChat}
        onSelectSession={selectSession}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={() => setSelectedIds(new Set())}
        onStartDelete={(ids) => setConfirmingDelete(ids)}
        onConfirmDelete={confirmDelete}
        onCancelDelete={() => setConfirmingDelete(null)}
      />
      <ChatMessageArea
        activeId={activeId}
        messages={messages}
        hasMore={hasMore}
        creating={creating}
        newInput={newInput}
        onNewInputChange={setNewInput}
        onCreateSessionAndSend={createSessionAndSend}
        inputRef={newInputRef}
      />
    </div>
  );
}
