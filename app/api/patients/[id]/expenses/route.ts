import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  createExpense,
  listExpensesByPatient,
} from "@/lib/db/expenses";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const expenses = await listExpensesByPatient(patient.id);
    return NextResponse.json({ expenses });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

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
  } catch (err) {
    return handleApiError(err);
  }
}
