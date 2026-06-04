import { redirect } from "next/navigation";
import { Bot } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { listGlobalSessions, getSessionMessages } from "@/lib/db/chat";
import { GlobalChatClient } from "@/components/chat/global-chat-client";
import type { ChatMessage } from "@/types/domain";

export const metadata = { title: "Caregiver Chat — MediCare AI" };

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sessions = await listGlobalSessions(user.id);
  const activeSession = sessions[0] ?? null;
  const chatData = activeSession
    ? await getSessionMessages(activeSession.id)
    : { messages: [] as ChatMessage[], hasMore: false };
  const activeMessages = chatData.messages;
  const activeHasMore = chatData.hasMore;

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col sm:h-[calc(100vh-8rem)]">
      <div className="mb-4 sm:mb-4 mb-3 flex items-center gap-3">
        <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 shrink-0">
          <Bot className="size-4 sm:size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-lg sm:text-xl font-medium text-foreground truncate">
            Caregiver Chat
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            Ask anything about patient care, medications, or nutrition
          </p>
        </div>
      </div>

      <GlobalChatClient
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        activeMessages={activeMessages}
        activeHasMore={activeHasMore}
      />
    </div>
  );
}
