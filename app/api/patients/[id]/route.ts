import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { deletePatient, getPatientById, updatePatient } from "@/lib/db/patients";
import { type CreatePatientInput } from "@/types/domain";

type Params = {
  params: Promise<{ id: string }>;
};

const VALID_FEEDING_METHODS = ["oral", "ngt-soft", "ngt-pureed"];

function validatePatientInput(input: Partial<CreatePatientInput>) {
  if (!input.name?.trim()) return "Patient name is required.";
  if (!Number.isInteger(input.age) || (input.age ?? 0) < 1 || (input.age ?? 0) > 120) {
    return "Age must be between 1 and 120.";
  }
  if (!input.diagnoses || input.diagnoses.length < 1) {
    return "At least one diagnosis is required.";
  }
  if (!VALID_FEEDING_METHODS.includes(input.feedingMethod ?? "")) {
    return "Feeding method is invalid.";
  }
  if ((input.monthlyBudgetPhp ?? 0) < 500) {
    return "Monthly budget must be at least 500 PHP.";
  }
  return null;
}

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await getPatientById(user.id, id);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PUT(req: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<CreatePatientInput>;
  const error = validatePatientInput(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const { id } = await params;
  const patient = await updatePatient(user.id, id, {
    name: body.name!.trim(),
    age: body.age!,
    weightKg: body.weightKg ?? null,
    diagnoses: body.diagnoses!,
    feedingMethod: body.feedingMethod!,
    allergies: body.allergies ?? [],
    intolerances: body.intolerances ?? [],
    monthlyBudgetPhp: body.monthlyBudgetPhp!,
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const removed = await deletePatient(user.id, id);
  if (!removed) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Patient deleted." });
}
