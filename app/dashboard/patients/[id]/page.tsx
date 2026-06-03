import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { PatientDetailContent } from "@/components/patients/patient-detail-content";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PatientDetailPagePage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    notFound();
  }

  return <PatientDetailContent patient={patient} />;
}
