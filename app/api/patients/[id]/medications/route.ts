import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  createMedication,
  listMedicationsByPatient,
} from "@/lib/db/medications";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const items = await listMedicationsByPatient(patient.id);
    return NextResponse.json({ medications: items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

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
  } catch (err) {
    return handleApiError(err);
  }
}
