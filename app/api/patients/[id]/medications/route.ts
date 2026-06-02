import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import {
  createMedication,
  listMedicationsByPatient,
} from "@/lib/db/medications";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const items = await listMedicationsByPatient(patient.id);
  return NextResponse.json({ medications: items });
}

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const body = await req.json();
  if (!body.name || !body.dosage || !body.frequency || !body.startDate) {
    return NextResponse.json({ error: "Name, dosage, frequency, and start date are required." }, { status: 400 });
  }

  const medication = await createMedication(patient.id, {
    name: body.name,
    dosage: body.dosage,
    frequency: body.frequency,
    route: body.route ?? "oral",
    startDate: body.startDate,
    endDate: body.endDate,
    notes: body.notes,
  });

  return NextResponse.json({ medication }, { status: 201 });
}
