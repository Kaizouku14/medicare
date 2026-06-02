import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import {
  createExpense,
  listExpensesByPatient,
} from "@/lib/db/expenses";

type Params = {
  params: Promise<{ id: string }>;
};

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

  const expenses = await listExpensesByPatient(patient.id);
  return NextResponse.json({ expenses });
}

export async function POST(req: Request, { params }: Params) {
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

  const { date, amount, note } = (await req.json()) as {
    date: string;
    amount: number;
    note?: string;
  };

  if (!date || amount == null || amount < 0) {
    return NextResponse.json(
      { error: "Valid date and amount are required." },
      { status: 400 },
    );
  }

  const expense = await createExpense(patient.id, date, amount, note);
  return NextResponse.json({ expense }, { status: 201 });
}
