"use client";

import { useReducer, useRef } from "react";
import { SessionList } from "@/components/chat/session-list";
import { ChatMessageArea } from "@/components/chat/chat-message-area";
import type { ChatSession, ChatMessage } from "@/types/domain";

type GlobalChatState = {
  sessions: ChatSession[];
  activeId: string | null;
  messages: ChatMessage[];
  hasMore: boolean;
  creating: boolean;
  newInput: string;
  selectedIds: Set<string>;
  confirmingDelete: Set<string> | null;
  deleting: boolean;
};

type GlobalChatAction =
  | { type: "SET_CREATING"; creating: boolean }
  | { type: "SESSION_CREATED"; session: ChatSession; messages: ChatMessage[] }
  | { type: "NEW_CHAT" }
  | {
      type: "SELECT_SESSION";
      activeId: string | null;
      messages: ChatMessage[];
      hasMore: boolean;
    }
  | { type: "SET_NEW_INPUT"; newInput: string }
  | { type: "TOGGLE_SELECT"; id: string }
  | { type: "TOGGLE_SELECT_ALL" }
  | { type: "CLEAR_SELECTION" }
  | { type: "START_DELETE"; ids: Set<string> }
  | { type: "CANCEL_DELETE" }
  | { type: "DELETE_START" }
  | { type: "DELETE_DONE" }
  | { type: "SET_HAS_MORE"; hasMore: boolean }
  | { type: "SET_MESSAGES"; messages: ChatMessage[]; hasMore: boolean };

function globalChatReducer(
  state: GlobalChatState,
  action: GlobalChatAction,
): GlobalChatState {
  switch (action.type) {
    case "SET_CREATING":
      return { ...state, creating: action.creating };
    case "SESSION_CREATED":
      return {
        ...state,
        creating: false,
        sessions: [action.session, ...state.sessions],
        activeId: action.session.id,
        messages: action.messages,
        hasMore: false,
        newInput: "",
      };
    case "NEW_CHAT":
      return { ...state, activeId: null, messages: [], selectedIds: new Set() };
    case "SELECT_SESSION":
      return {
        ...state,
        activeId: action.activeId,
        messages: action.messages,
        hasMore: action.hasMore,
        selectedIds: new Set(),
      };
    case "SET_NEW_INPUT":
      return { ...state, newInput: action.newInput };
    case "TOGGLE_SELECT": {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, selectedIds: next };
    }
    case "TOGGLE_SELECT_ALL": {
      if (state.selectedIds.size === state.sessions.length) {
        return { ...state, selectedIds: new Set() };
      }
      return {
        ...state,
        selectedIds: new Set(state.sessions.map((s) => s.id)),
      };
    }
    case "CLEAR_SELECTION":
      return { ...state, selectedIds: new Set() };
    case "START_DELETE":
      return { ...state, confirmingDelete: action.ids };
    case "CANCEL_DELETE":
      return { ...state, confirmingDelete: null };
    case "DELETE_START":
      return { ...state, deleting: true };
    case "DELETE_DONE": {
      const ids = state.confirmingDelete;
      if (!ids || ids.size === 0) return state;
      const remainingSessions = state.sessions.filter((s) => !ids.has(s.id));
      const activeRemoved = state.activeId && ids.has(state.activeId);
      return {
        ...state,
        deleting: false,
        confirmingDelete: null,
        sessions: remainingSessions,
        selectedIds: new Set(),
        ...(activeRemoved
          ? {
              activeId:
                remainingSessions.length > 0 ? remainingSessions[0].id : null,
              messages: [],
              hasMore: true,
            }
          : {}),
      };
    }
    case "SET_MESSAGES":
      return { ...state, messages: action.messages, hasMore: action.hasMore };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.hasMore };
  }
}

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
  const [state, dispatch] = useReducer(globalChatReducer, {
    sessions: initialSessions,
    activeId: initialSessionId,
    messages: initialMessages,
    hasMore: activeHasMore,
    creating: false,
    newInput: "",
    selectedIds: new Set<string>(),
    confirmingDelete: null,
    deleting: false,
  });
  const newInputRef = useRef<HTMLInputElement>(null);

  const messageCache = useRef<Map<string, ChatMessage[]>>(null!);
  if (messageCache.current === null) messageCache.current = new Map();

  async function createSessionAndSend(text: string) {
    dispatch({ type: "SET_CREATING", creating: true });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        dispatch({ type: "SET_CREATING", creating: false });
        return;
      }

      const sessionId = res.headers.get("X-Session-Id");
      if (!sessionId) {
        dispatch({ type: "SET_CREATING", creating: false });
        return;
      }

      // Read the streaming response to get the assistant's reply
      let assistantText = "";
      if (res.body) {
        assistantText = await new Response(res.body).text();
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
      dispatch({
        type: "SESSION_CREATED",
        session: newSession,
        messages: msgs,
      });
    } catch {
      dispatch({ type: "SET_CREATING", creating: false });
    }
  }

  function newChat() {
    dispatch({ type: "NEW_CHAT" });
    setTimeout(() => newInputRef.current?.focus(), 50);
  }

  const hasMoreMap = useRef<Map<string, boolean>>(null!);
  if (hasMoreMap.current === null) hasMoreMap.current = new Map();

  async function selectSession(sessionId: string) {
    const cached = messageCache.current.get(sessionId);
    if (cached) {
      dispatch({
        type: "SELECT_SESSION",
        activeId: sessionId,
        messages: cached,
        hasMore: hasMoreMap.current.get(sessionId) ?? true,
      });
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
      dispatch({
        type: "SELECT_SESSION",
        activeId: sessionId,
        messages: msgs,
        hasMore: more,
      });
    } catch {
      dispatch({
        type: "SELECT_SESSION",
        activeId: sessionId,
        messages: [],
        hasMore: false,
      });
    }
  }

  function toggleSelect(id: string) {
    dispatch({ type: "TOGGLE_SELECT", id });
  }

  function toggleSelectAll() {
    dispatch({ type: "TOGGLE_SELECT_ALL" });
  }

  async function confirmDelete() {
    if (!state.confirmingDelete || state.confirmingDelete.size === 0) return;
    const ids = Array.from(state.confirmingDelete);
    const isBulk = state.confirmingDelete.size > 1;
    dispatch({ type: "DELETE_START" });
    try {
      const res = isBulk
        ? await fetch("/api/chat", {
            method: "DELETE",
            body: JSON.stringify({ ids }),
          })
        : await fetch(`/api/chat/${ids[0]}`, { method: "DELETE" });
      if (!res.ok) {
        dispatch({ type: "CANCEL_DELETE" });
        return;
      }
      ids.forEach((id) => {
        messageCache.current.delete(id);
        hasMoreMap.current.delete(id);
      });
      dispatch({ type: "DELETE_DONE" });
    } catch {
      dispatch({ type: "CANCEL_DELETE" });
    }
  }

  return (
    <div className="flex flex-1 gap-4">
      <SessionList
        sessions={state.sessions}
        activeId={state.activeId}
        selectedIds={state.selectedIds}
        confirmingDelete={state.confirmingDelete}
        deleting={state.deleting}
        onNewChat={newChat}
        onSelectSession={selectSession}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={() => dispatch({ type: "CLEAR_SELECTION" })}
        onStartDelete={(ids) => dispatch({ type: "START_DELETE", ids })}
        onConfirmDelete={confirmDelete}
        onCancelDelete={() => dispatch({ type: "CANCEL_DELETE" })}
      />
      <ChatMessageArea
        activeId={state.activeId}
        messages={state.messages}
        hasMore={state.hasMore}
        creating={state.creating}
        newInput={state.newInput}
        onNewInputChange={(v) =>
          dispatch({ type: "SET_NEW_INPUT", newInput: v })
        }
        onCreateSessionAndSend={createSessionAndSend}
        inputRef={newInputRef}
      />
    </div>
  );
}
