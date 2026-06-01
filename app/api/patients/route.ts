import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createPatient, listPatientsByUser } from "@/lib/db/patients";
import { type CreatePatientInput } from "@/types/domain";

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

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await listPatientsByUser(user.id);
  return NextResponse.json({ patients });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Partial<CreatePatientInput>;
    const error = validatePatientInput(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const patient = await createPatient(user.id, {
      name: body.name!.trim(),
      age: body.age!,
      weightKg: body.weightKg ?? null,
      diagnoses: body.diagnoses!,
      feedingMethod: body.feedingMethod!,
      allergies: body.allergies ?? [],
      intolerances: body.intolerances ?? [],
      monthlyBudgetPhp: body.monthlyBudgetPhp!,
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create patient." },
      { status: 400 },
    );
  }
}
