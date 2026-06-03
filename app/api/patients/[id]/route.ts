import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { deletePatient, updatePatient } from "@/lib/db/patients";
import { patientSchema } from "@/lib/validation/patient";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);
    return NextResponse.json({ patient });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const body = patientSchema.parse(await req.json());
    const { id } = await params;
    const patient = await updatePatient(user.id, id, {
      name: body.name.trim(),
      age: body.age,
      heightCm: body.heightCm ?? null,
      weightKg: body.weightKg ?? null,
      diagnoses: body.diagnoses,
      feedingMethod: body.feedingMethod,
      allergies: body.allergies ?? [],
      intolerances: body.intolerances ?? [],
      monthlyBudgetPhp: body.monthlyBudgetPhp,
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((e) => e.message).join(", ")
        : err instanceof Error ? err.message : "Unable to update patient.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const removed = await deletePatient(user.id, id);
    if (!removed) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Patient deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
