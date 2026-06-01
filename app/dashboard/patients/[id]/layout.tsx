import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { getPatientChatData } from "@/lib/db/chat";
import { PatientChatSidebar } from "@/components/chat/patient-chat-sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function PatientLayout({ children, params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id } = await params;
  const patient = await getPatientById(user.id, id);

  if (!patient) redirect("/dashboard");

  const { session, messages } = await getPatientChatData(id, user.id);

  return (
    <>
      {children}
      <PatientChatSidebar
        sessionId={session.id}
        initialMessages={messages}
      />
    </>
  );
}
