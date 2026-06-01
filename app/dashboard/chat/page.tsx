import { redirect } from "next/navigation";
import { Bot } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { listGlobalSessions, getSessionMessages } from "@/lib/db/chat";
import { GlobalChatClient } from "@/components/chat/global-chat-client";

export const metadata = { title: "Caregiver Chat — MediCare AI" };

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sessions = await listGlobalSessions(user.id);
  const activeSession = sessions[0] ?? null;
  const activeMessages = activeSession
    ? await getSessionMessages(activeSession.id)
    : [];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20">
          <Bot className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-medium text-foreground">
            Caregiver Chat
          </h1>
          <p className="text-xs text-muted-foreground">
            Ask anything about patient care, medications, or nutrition
          </p>
        </div>
      </div>

      <GlobalChatClient
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        activeMessages={activeMessages}
      />
    </div>
  );
}
