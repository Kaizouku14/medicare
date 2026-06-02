import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { PatientChatPopup } from "@/components/chat/patient-chat-popup";

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

  return (
    <>
      {children}
      <PatientChatPopup patientId={id} />
    </>
  );
}
