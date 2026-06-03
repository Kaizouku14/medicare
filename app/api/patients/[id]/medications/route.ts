import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  createMedication,
  listMedicationsByPatient,
  updateMedication,
  deleteMedication,
} from "@/lib/db/tracking/medications";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);
    const items = await listMedicationsByPatient(patient.id);
    return NextResponse.json({ medications: items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const [patient, body] = await Promise.all([
      requirePatientAccess(user.id, id),
      req.json(),
    ]);
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

export async function PUT(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const [patient, body] = await Promise.all([
      requirePatientAccess(user.id, id),
      req.json(),
    ]);
    if (!body.medicationId) {
      return NextResponse.json({ error: "medicationId is required." }, { status: 400 });
    }

    const updated = await updateMedication(body.medicationId, {
      name: body.name,
      dosage: body.dosage,
      frequency: body.frequency,
      route: body.route,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      notes: body.notes ?? null,
    });

    if (!updated) {
      return NextResponse.json({ error: "Medication not found." }, { status: 404 });
    }

    return NextResponse.json({ medication: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);

    const { medicationId } = (await req.json()) as { medicationId: string };
    if (!medicationId) {
      return NextResponse.json({ error: "medicationId is required." }, { status: 400 });
    }

    const deleted = await deleteMedication(patient.id, medicationId);
    if (!deleted) {
      return NextResponse.json({ error: "Medication not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
