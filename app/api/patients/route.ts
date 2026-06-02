import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, handleApiError } from "@/lib/auth";
import { createPatient, listPatientsByUser } from "@/lib/db/patients";
import { patientSchema } from "@/lib/validation/patient";

export async function GET() {
  try {
    const { user } = await requireAuth();
    const patients = await listPatientsByUser(user.id);
    return NextResponse.json({ patients });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = patientSchema.parse(await req.json());

    const patient = await createPatient(user.id, {
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

    return NextResponse.json({ patient }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((e) => e.message).join(", ")
        : "Unable to create patient.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
