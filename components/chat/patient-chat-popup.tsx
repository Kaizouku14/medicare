"use client";

import { useReducer } from "react";
import { X, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat/chat-panel";
import type { ChatMessage } from "@/types/domain";

type PopupState = {
  open: boolean;
  sessionId: string | null;
  initialMessages: ChatMessage[];
  hasMore: boolean;
  loading: boolean;
};

type PopupAction =
  | { type: "TOGGLE_OPEN" }
  | { type: "LOAD_START" }
  | {
      type: "LOAD_DONE";
      sessionId: string;
      messages: ChatMessage[];
      hasMore: boolean;
    }
  | { type: "LOAD_ERROR" }
  | { type: "CLOSE" };

function popupReducer(state: PopupState, action: PopupAction): PopupState {
  switch (action.type) {
    case "TOGGLE_OPEN":
      return { ...state, open: !state.open };
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_DONE":
      return {
        ...state,
        loading: false,
        open: true,
        sessionId: action.sessionId,
        initialMessages: action.messages,
        hasMore: action.hasMore,
      };
    case "LOAD_ERROR":
      return { ...state, loading: false };
    case "CLOSE":
      return { ...state, open: false };
  }
}

export function PatientChatPopup({ patientId }: { patientId: string }) {
  const [state, dispatch] = useReducer(popupReducer, {
    open: false,
    sessionId: null,
    initialMessages: [],
    hasMore: false,
    loading: false,
  });

  async function initChat() {
    if (state.sessionId) {
      dispatch({ type: "TOGGLE_OPEN" });
      return;
    }
    dispatch({ type: "LOAD_START" });
    try {
      const res = await fetch(`/api/chat/patient?patientId=${patientId}`);
      const data = (await res.json()) as {
        session: { id: string };
        messages: ChatMessage[];
        hasMore: boolean;
      };
      dispatch({
        type: "LOAD_DONE",
        sessionId: data.session.id,
        messages: data.messages,
        hasMore: data.hasMore,
      });
    } catch {
      dispatch({ type: "LOAD_ERROR" });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={initChat}
        disabled={state.loading}
        className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
      >
        {state.loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : state.open ? (
          <X className="size-5" />
        ) : (
          <Bot className="size-5" />
        )}
      </button>

      {state.open && state.sessionId && (
        <div className="fixed bottom-20 right-4 sm:right-5 z-50 flex w-82 sm:w-90 max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-border/60 bg-card shadow-2xl">
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
              onClick={() => dispatch({ type: "CLOSE" })}
              variant="ghost"
              size="sm"
              className="size-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <ChatPanel
            sessionId={state.sessionId}
            initialMessages={state.initialMessages}
            hasMore={state.hasMore}
            className="h-96"
            patientPanel={true}
          />
        </div>
      )}
    </>
  );
}
